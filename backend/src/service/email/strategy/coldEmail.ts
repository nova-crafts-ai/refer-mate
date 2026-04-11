import { getCandidateProfile } from "../../extractCandidateProfile.js";
import { PromptTemplate } from "@langchain/core/prompts";
import { coldPromptTemplate } from "../../../utils/prompts/coldPromptTemplate.js";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { emailSchema } from "../../../schema/schema.js";
import callLLM from "../../../apis/llmClient.js";
import { ColdEmailRequest } from "../../../types/GenerateMailRequest.js";
import { logger } from "../../../utils/logger.js";
import prisma from "../../../apis/prismaClient.js";

export const coldEmailStrategy = async (emailRequest: ColdEmailRequest) => {

    logger.info(`Generating cold email for user ${emailRequest.userId} with ${JSON.stringify(emailRequest)}`);
    const userId = emailRequest.userId;
    let template;

    if (!emailRequest.templateId) {
        logger.info("No template provided for cold email strategy.");
    } else {
        logger.info("Using provided template for cold email strategy.");
    }

    const profileDetails = await getCandidateProfile(prisma, userId || "");

    const coldEmailPrompt = PromptTemplate.fromTemplate(coldPromptTemplate);

    const parser = StructuredOutputParser.fromZodSchema(emailSchema);

    const emailContent = await callLLM(
        await coldEmailPrompt.format({
            userName: profileDetails.userName,
            skills: profileDetails.skills,
            experience: profileDetails.experiences,
            education: profileDetails.education,
            template: template || "No template provided",
            emailSchema: parser.getFormatInstructions(),
            companyName: emailRequest.companyName,
            employeeName: emailRequest.contactName,
        })
    );

    logger.info("RAW LLM response:", emailContent);

    return await parser.parse(emailContent);
}