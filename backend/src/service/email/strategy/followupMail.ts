import { PromptTemplate } from "@langchain/core/prompts";
import { FollowupEmailRequest } from "../../../types/GenerateMailRequest.js";
import { followUpPromptTemplate } from "../../../utils/prompts/followUpPromptTemplate.js";
import { getThreadById } from "../../threadService.js";
import prisma from "../../../apis/prismaClient.js";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { emailSchema } from "../../../schema/schema.js";
import callLLM from "../../../apis/llmClient.js";
import { logger } from "../../../utils/logger.js";
import { BadRequestError, NotFoundError } from "../../../types/HttpError.js";
import { getUserProfile } from "../../profileService.js";
import { ErrorCode } from "../../../types/errorCodes.js";

export const followupEmailStrategy = async (followupRequest: FollowupEmailRequest) => {
    logger.info(`Generating followup email for user ${followupRequest.userId} with threadId: ${followupRequest.threadId}`);

    if (!followupRequest.threadId || !followupRequest.userId) {
        throw new BadRequestError("Missing threadId or userId in followup request", ErrorCode.VALIDATION_FAILED);
    }

    try {
        logger.info(`Fetching messages for threadId: ${followupRequest.threadId}`);
        const thread = await getThreadById(prisma, followupRequest.userId, followupRequest.threadId);
        const profileDetails = await getUserProfile(followupRequest.userId);
        if (!thread) {
            throw new NotFoundError(`Thread not found for id: ${followupRequest.threadId}`, ErrorCode.THREAD_NOT_FOUND, { threadId: followupRequest.threadId });
        }

        logger.info(`Fetched thread with messages count: ${thread.messages.length}`);

        const prompt = PromptTemplate.fromTemplate(followUpPromptTemplate);
        const outputParser = StructuredOutputParser.fromZodSchema(emailSchema);

        const followUpEmail = await callLLM(
            await prompt.format({
                email_thread: JSON.stringify(thread.messages.map(m => ({
                    sender: m.authUserId === followupRequest.userId ? "Me" : "Contact",
                    body: m.body,
                    subject: m.subject
                }))),
                user_name: profileDetails?.firstName + " " + profileDetails?.lastName,
                contact_name: thread.employee?.name || 'Recruiter',
                follow_up_reason: 'Checking on update',
                emailSchema: outputParser.getFormatInstructions()
            })
        );

        logger.info("AI response received for followup email");
        return outputParser.parse(followUpEmail);
    } catch (error) {
        logger.error("Error generating followup email:", error);
        throw error;
    }
}