import { PromptTemplate } from "@langchain/core/prompts";
import prisma from "../../../apis/prismaClient.js";
import { ThankYouEmailRequest } from "../../../types/GenerateMailRequest.js";
import { getThreadById } from "../../threadService.js";
import { thankyouPromptTemplate } from "../../../utils/prompts/thankYouPromptTemplate.js";
import callLLM from "../../../apis/llmClient.js";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { emailSchema } from "../../../schema/schema.js";
import { logger } from "../../../utils/logger.js";
import { NotFoundError } from "../../../types/HttpError.js";
import { ErrorCode } from "../../../types/errorCodes.js";

export const thankyouEmailStrategy = async (emailRequest: ThankYouEmailRequest) => {

    logger.info(`Generating thankyou mail for user ${emailRequest.userId} with thread id: ${emailRequest.threadId}`)
    // Get thread by id and extract the last message
    const thread = await getThreadById(prisma, emailRequest.userId, emailRequest.threadId);

    if (!thread) {
        logger.error("Thread not found");
        throw new NotFoundError("Thread not found", ErrorCode.THREAD_NOT_FOUND, { threadId: emailRequest.threadId });
    }
    const lastMessage = thread?.messages.at(-1);
    if (!lastMessage) {
        logger.error("Last message not found");
        throw new NotFoundError("Last message not found", ErrorCode.MESSAGE_NOT_FOUND, { threadId: emailRequest.threadId });
    }

    logger.info(`Initiating thankyou email strategy for thread ${emailRequest.threadId}`);

    // prepare the prompt template
    const promptTemplate = PromptTemplate.fromTemplate(thankyouPromptTemplate);

    const outputFormat = StructuredOutputParser.fromZodSchema(emailSchema);

    // generate the email
    const email = await callLLM(
        await promptTemplate.format({
            previousMessage: lastMessage.body,
            emailSchema: outputFormat.getFormatInstructions(),
        })
    );

    logger.info(`RAW email: ${email}`);

    return outputFormat.parse(email);
}