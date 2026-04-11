import { Prisma } from "@prisma/client";
import prisma from "../apis/prismaClient.js";
import { GenerateMailRequest } from "../types/GenerateMailRequest.js";
import { emailStrategy } from "./email/context.js";
import { upsertEmployee } from "./employeeService.js";
import { handleTailoredJobs } from "./jobService.js";
import { saveMessage } from "./messageService.js";
import { createThread } from "./threadService.js";
import MessageType from "../types/MessageType.js";
import { BadRequestError } from "../types/HttpError.js";
import { logger } from "../utils/logger.js";
import { ErrorCode } from "../types/errorCodes.js";


export async function saveDraftEmail(
  authUserId: string,
  req: GenerateMailRequest,
  body: string,
  subject: string
) {
  if (!body.trim()) throw new BadRequestError("Empty mail body", ErrorCode.EMPTY_FIELD);
  if (!subject.trim()) throw new BadRequestError("Empty subject", ErrorCode.EMPTY_FIELD);

  logger.info(`Saving draft email for user: ${authUserId}`);

  return prisma.$transaction(async (tx) => {
    const employee = await upsertEmployee(tx, req);
    const threadContext = await resolveThread(tx, authUserId, employee?.id || 0, req);

    const message = await saveMessage(
      tx,
      threadContext.id,
      authUserId,
      subject,
      body
    );
    logger.info(`Draft email saved for user: ${authUserId} with message ID: ${message.id}`);
    return {
      messageId: message.id,
      ...('isNew' in threadContext ? threadContext : {})
    };
  });
}

async function resolveThread(
  tx: Prisma.TransactionClient,
  authUserId: string,
  employeeId: number,
  req: GenerateMailRequest
) {
  if (req.type === MessageType.FOLLOW_UP || req.type === MessageType.THANK_YOU) {
    logger.info(`Resolving thread for follow-up or thank you email for user: ${authUserId}`);
    return { id: req.threadId };
  }

  const thread = await createThread(tx, authUserId, employeeId, req.type);

  if (req.type === MessageType.TAILORED) {
    await handleTailoredJobs(tx, thread.id, req.jobs, req.jobDescription);
  }

  return { ...thread, isNew: true };
}

export async function generateAndSaveEmail(
  authUserId: string,
  req: GenerateMailRequest
) {
  const strategy = emailStrategy[req.type.toLowerCase()];
  if (!strategy) {
    logger.error(`No email strategy found for type: ${req.type}`);
    throw new BadRequestError(`No email strategy found for type: ${req.type}`, ErrorCode.INVALID_EMAIL_STRATEGY);
  }

  logger.info(`Generating email using strategy for: ${req.type}`);
  const emailContent = await strategy(req);

  let responseData: any = { ...emailContent };

  const draft = await saveDraftEmail(
    authUserId,
    req,
    emailContent.body,
    emailContent.subject
  );
  responseData.threadId = draft.id;
  responseData.id = draft.messageId;

  return responseData;
}
