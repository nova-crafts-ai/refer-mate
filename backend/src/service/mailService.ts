import { google } from "googleapis";
import nodemailer from "nodemailer";
import prisma from "../apis/prismaClient.js";
import { storageService } from "./storageService.js";
import { Readable } from "stream";
import { getGoogleAccessToken } from "../apis/googleOAuth2Client.js";
import { SendMailRequest } from "../schema/messageSchema.js";
import { logger } from "../utils/logger.js";
import { BadRequestError, NotFoundError, ExternalServiceError } from "../types/HttpError.js";
import { ErrorCode } from "../types/errorCodes.js";

export class MailService {
    async sendMail(userId: string, mailData: SendMailRequest & { messageId: number }) {
        const { threadId, messageId, attachResume } = mailData;

        // 1. Fetch & Validate Data
        const thread = await prisma.thread.findUnique({
            where: { id: threadId, authUserId: userId },
            include: {
                messages: {
                    where: { id: messageId },
                },
                employee: true,
            },
        });
        logger.info(`Thread fetched for user ${userId} with id ${threadId}`);

        if (!thread || !thread.employee) {
            logger.error(`Thread not found or Employee details missing for user ${userId} with id ${threadId}`);
            throw new NotFoundError(
                "Thread not found or Employee details missing",
                ErrorCode.THREAD_NOT_FOUND,
                { threadId, userId }
            );
        }

        const message = thread.messages[0];
        if (!message) {
            logger.error(`Message not found for user ${userId} with id ${messageId}`);
            throw new NotFoundError("Message not found", ErrorCode.MESSAGE_NOT_FOUND, { messageId, userId });
        }

        const to = thread.employee.email;
        const { subject, body: text } = message;

        if (!to || !subject || !text) {
            logger.error(`Incomplete email data for user ${userId} with id ${messageId}`);
            throw new BadRequestError(
                "Incomplete email data (missing recipient, subject, or body)",
                ErrorCode.VALIDATION_FAILED
            );
        }

        // 2. Fetch Resume if requested
        let attachments: any[] = [];
        if (attachResume) {
            await this.getResumeStream(userId, attachments);
            logger.info(`Resume attachment stream prepared for user ${userId}`);
        }

        // 3. Get User Info (From address)
        const fromEmail = (await prisma.userProfileData.findUnique({
            where: { authUserId: userId },
            select: { email: true },
        }))?.email;
        logger.info(`User email found for user ${userId}: ${fromEmail}`);

        if (!fromEmail) {
            logger.error(`User email not found for user ${userId}`);
            throw new NotFoundError("User email not found", ErrorCode.USER_NOT_FOUND, { userId });
        }

        // 4. Construct MIME Stream using Nodemailer
        const mimeStream = await this.getMimeStream({
            from: fromEmail,
            to,
            subject,
            html: text.replace(/\n/g, "<br>"), // Preserve formatting
            attachments
        });
        logger.info(`MIME stream prepared for user ${userId}`);

        // 5. Send via Gmail Media Upload
        return this.sendViaGmail(userId, mimeStream);
    }

    private async getResumeStream(userId: string, attachments: any[]) {
        const userProfile = await prisma.userProfileData.findUnique({
            where: { authUserId: userId },
            select: { resumeUrl: true },
        });

        if (userProfile?.resumeUrl) {
            try {
                const stream = await storageService.getFileStream(userProfile.resumeUrl);
                attachments.push({
                    filename: "Resume.pdf",
                    content: stream,
                });
                logger.info(`Resume attachment stream prepared successfully for user ${userId}`);
            } catch (error) {
                logger.error(`Failed to prepare resume stream for user ${userId}:`, error);
            }
        } else {
            logger.warn(`Attach resume requested but no resume URL found for user ${userId}`);
        }
    }

    private async getMimeStream(mailOptions: any): Promise<Readable> {
        const transporter = nodemailer.createTransport({
            streamTransport: true,
            newline: 'unix',
            buffer: false // Disable buffering
        });
        logger.info(`MIME stream prepared`);
        const info = await transporter.sendMail(mailOptions);
        return info.message as Readable;
    }

    private async sendViaGmail(userId: string, mimeStream: Readable): Promise<any> {

        const accessToken = await getGoogleAccessToken(userId);
        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: accessToken });

        const gmail = google.gmail({ version: "v1", auth });
        try {
            const response = await gmail.users.messages.send({
                userId: "me",
                media: {
                    mimeType: 'message/rfc822',
                    body: mimeStream
                }
            });
            return response.data;
        } catch (error: any) {
            logger.error(`Failed to send email for user ${userId}:`, error);
            throw new ExternalServiceError(
                `Failed to send email: ${error.message}`,
                ErrorCode.EMAIL_SEND_FAILED,
                { userId, errorDetails: error.message }
            );
        }
    }
}

export const mailService = new MailService();