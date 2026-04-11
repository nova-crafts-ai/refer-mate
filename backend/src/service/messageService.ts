import { MessageStatus, Prisma } from "@prisma/client";
import { MessageRequest } from "../schema/messageSchema.js";
import { logger } from "../utils/logger.js";
import { BadRequestError, NotFoundError, UnprocessableEntityError } from "../types/HttpError.js";
import { ErrorCode } from "../types/errorCodes.js";

export async function saveMessage(
  tx: Prisma.TransactionClient,
  threadId: number,
  authUserId: string,
  subject: string,
  body: string
) {

  const lastMessage = await getLastMessage(tx, threadId, authUserId);

  if (lastMessage && lastMessage.status == MessageStatus.DRAFT) {
    logger.info(`Updating draft message for thread: ${threadId} by user: ${authUserId}`);
    try {
      return tx.message.update({
        where: {
          id: lastMessage.id,
          authUserId: authUserId,
        },
        data: {
          subject,
          body,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        logger.error(`Message not found for message ID: ${lastMessage.id} by user: ${authUserId}`);
        throw new NotFoundError("Message not found", ErrorCode.MESSAGE_NOT_FOUND, { messageId: lastMessage.id });
      }
      logger.error(`Error updating message ID: ${lastMessage.id} by user: ${authUserId}`, error);
      throw error;
    }
  }

  logger.info(`Saving message for thread: ${threadId} by user: ${authUserId}`);
  return tx.message.create({
    data: {
      threadId,
      authUserId,
      subject,
      body,
      fromUser: true,
    },
  });
}

export async function getLastMessage(tx: Prisma.TransactionClient, threadId: number, authUserId: string) {
  logger.info(`Getting last message for thread: ${threadId} by user: ${authUserId}`);
  return tx.message.findFirst({
    where: {
      threadId,
      authUserId: authUserId,
    },
    orderBy: {
      date: "desc",
    },
    take: 1
  });
}

export async function updateMessage(
  tx: Prisma.TransactionClient,
  messageId: number,
  authUserId: string,
  message: MessageRequest
) {
  logger.info(`Editing message ID: ${messageId} by user: ${authUserId}`);

  const updateData: any = {};
  if (typeof message.subject === "string" && message.subject.length != 0) updateData.subject = message.subject;
  if (typeof message.body === "string" && message.body.length != 0) updateData.body = message.body;
  if (typeof message.status === "string" && message.status.length != 0) updateData.status = MessageStatus[message.status];

  if (Object.keys(updateData).length === 0) {
    logger.error(`No valid fields provided to update for message ID: ${messageId} by user: ${authUserId}`)
    throw new BadRequestError("No valid fields provided to update", ErrorCode.NO_VALID_FIELDS, { messageId });
  }

  try {
    return tx.message.update({
      where: {
        id: messageId,
        authUserId: authUserId,
      },
      data: updateData,
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      logger.error(`Message not found for message ID: ${messageId} by user: ${authUserId}`);
      throw new NotFoundError("Message not found", ErrorCode.MESSAGE_NOT_FOUND, { messageId });
    }
    logger.error(`Error updating message ID: ${messageId} by user: ${authUserId}`, error);
    throw error;
  }
}

export async function getMessageById(
  tx: Prisma.TransactionClient,
  messageId: number,
  authUserId: string
) {
  logger.info(`Retrieving message ID: ${messageId} for user: ${authUserId}`);
  return tx.message.findFirst({
    where: {
      id: messageId,
      authUserId: authUserId,
    },
  });
}

export async function populateMessagesForThread(tx: Prisma.TransactionClient, threadId: number, authUserId: string, messages: any[]) {
  logger.info(`Populating messages for user ${authUserId} from external source to db with thread ID ${threadId}`);
  const existingMessages = await tx.message.findMany({
    where: {
      threadId,
      externalMessageId: {
        in: messages.map((m) => m.id),
      },
    },
    select: {
      externalMessageId: true,
    },
  });

  const existingIds = new Set(existingMessages.map((m: any) => m.externalMessageId));

  const newMessages = messages.filter((m: any) => !existingIds.has(m.id));

  if (newMessages.length === 0) {
    logger.info(`No new messages to save for user ${authUserId} with thread ID ${threadId}`);
    return;
  }

  logger.info(`Saving ${newMessages.length} new messages for user ${authUserId} with thread ID ${threadId}`);

  // Bulk insert new messages
  await tx.message.createMany({
    data: newMessages.map((message: any) => ({
      threadId,
      authUserId,
      subject: message.subject || "",
      body: message.body || "",
      fromUser: message.fromUser || false,
      externalMessageId: message.id,
    })),
  });
}

export async function deleteMessage(tx: Prisma.TransactionClient, messageId: number, authUserId: string) {
  logger.info(`Deleting message ID: ${messageId} for user: ${authUserId}`);

  const message = await tx.message.findFirst({
    where: {
      id: messageId,
      authUserId: authUserId,
    },
  });

  if (!message) {
    logger.error(`Message not found for message ID: ${messageId} for user: ${authUserId}`);
    throw new NotFoundError("Message not found", ErrorCode.MESSAGE_NOT_FOUND, { messageId });
  }

  if (message.status !== MessageStatus.DRAFT) {
    logger.error(`Message cannot be deleted unless it is in DRAFT state for message ID: ${messageId} for user: ${authUserId}`);
    throw new UnprocessableEntityError(
      "Message cannot be deleted unless it is in DRAFT state",
      ErrorCode.MESSAGE_NOT_DRAFT,
      { messageId, currentStatus: message.status }
    );
  }

  return tx.message.delete({
    where: {
      id: messageId,
    },
  });
}