import { google } from "googleapis";
import prisma from "../apis/prismaClient.js";
import * as cheerio from "cheerio";
import { getGoogleAccessToken } from "../apis/googleOAuth2Client.js";
import { logger } from "../utils/logger.js";
import { UnauthorizedError, NotFoundError, ForbiddenError, ExternalServiceError } from "../types/HttpError.js";
import { ErrorCode } from "../types/errorCodes.js";


export class ExternalMailService {

  constructor() {

  }

  async getThreadMessage(threadId: number, clerkUserId: string) {

    let accessToken;

    try {
      accessToken = await getGoogleAccessToken(clerkUserId);
      logger.info(`Access token fetched for user ${clerkUserId}`);
    } catch (error: any) {
      logger.error(`Error fetching access token for user ${clerkUserId}: ${error.message}`);
      throw new UnauthorizedError("Refresh token not found", ErrorCode.REFRESH_TOKEN_NOT_FOUND, { clerkUserId });
    }
    const thread = await prisma.thread.findUnique({
      where: {
        id: threadId
      }
    });
    if (!thread) {
      logger.error(`Thread not found for user ${clerkUserId} with thread ID ${threadId}`);
      throw new NotFoundError("Thread not found", ErrorCode.THREAD_NOT_FOUND, { threadId, clerkUserId });
    }

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const gmail = google.gmail({
      version: "v1",
      auth: auth
    });

    try {
      const t = await gmail.users.threads.get({
        userId: "me",
        id: thread?.externalThreadId || ''
      });

      if (!t.data.messages) return [];

      const result = t.data.messages.map((message) => {
        const a = this.extractMessageBody(message.payload);
        const fromUser = message.labelIds?.includes("SENT") || false;
        logger.info(`Message fetched for user ${clerkUserId} with thread ID ${threadId}`);
        return { id: message.id, threadId: message.threadId, body: a, fromUser };
      });

      return result;
    } catch (error: any) {
      logger.error(`Error fetching thread messages for user ${clerkUserId} with thread ID ${threadId}: ${error.message}`);
      if (error.code === 403) {
        throw new ForbiddenError("Insufficient permissions", ErrorCode.INSUFFICIENT_PERMISSIONS, { threadId });
      }
      throw new ExternalServiceError(
        "Thread not found in external source",
        ErrorCode.GMAIL_API_ERROR,
        { threadId, externalError: error.message }
      );
    }

  }

  private extractMessageBody(payload: any): string {
    if (!payload) return "";
    console.log("Extracting body from payload MIME type:", payload.mimeType);

    let body = "";

    // 1. If there is body data directly (usually text/plain or text/html non-multipart)
    if (payload.body && payload.body.data) {
      console.log("Found body data directly");
      body = Buffer.from(payload.body.data, 'base64').toString('utf-8');
    }
    // 2. If there are parts (multipart)
    else if (payload.parts && payload.parts.length > 0) {
      console.log("Found parts:", payload.parts.length);
      // Find HTML part
      let part = payload.parts.find((p: any) => p.mimeType === 'text/html');
      // Fallback to plain text
      if (!part) {
        part = payload.parts.find((p: any) => p.mimeType === 'text/plain');
      }

      // If still no part found (maybe nested multipart/related or mixed)
      if (!part) {
        // Try to find a part that has parts
        part = payload.parts.find((p: any) => p.parts && p.parts.length > 0);
      }

      if (part) {
        body = this.extractMessageBody(part);
      }
    }

    // Logic to cleanup html
    if (body) {
      const $ = cheerio.load(body);
      $(".gmail_quote").remove();
      $("div.gmail_quote").remove();
      $("blockquote.gmail_quote").remove();
      return $.html();
    }

    return "";
  }

}

export default new ExternalMailService();