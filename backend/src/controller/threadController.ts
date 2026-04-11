import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger.js";
import { extractThreadMeta, getSyncedThread, getThreadById, syncThreadWithGoogle, updateThread } from "../service/threadService.js";
import prisma from "../apis/prismaClient.js";
import { getAuth } from "@clerk/express";

import { toThreadDTO } from "../mapper/threadDTOMapper.js";
import { MessageStatus, ThreadStatus } from "@prisma/client";
import { ThreadDetailResponse, ThreadMetaResponse, ThreadMetaParams, UpdateThreadRequest, UpdateThreadResponse } from "../schema/threadSchema.js";
import { ErrorCode } from "../types/errorCodes.js";
import { NotFoundError } from "../types/HttpError.js";

function parseCSVQuery(q?: string | string[] | undefined): string[] | undefined {
  if (!q) return undefined;
  if (Array.isArray(q)) return q.flatMap(s => s.split(",").map(x => x.trim()).filter(Boolean));
  return q.split(",").map(x => x.trim()).filter(Boolean);
}

function extractThreadMetaParams(req: Request<{}, {}, {}, ThreadMetaParams>) {
  const page = Math.max(1, Number(req.query.page ?? 1));
  const pageSizeRequested = Number(req.query.pageSize ?? 10);
  const MAX_PAGE_SIZE = 100;
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, isNaN(pageSizeRequested) ? 10 : pageSizeRequested));

  const search = parseCSVQuery(req.query.search as any); // string[] | undefined
  const threadStatus = parseCSVQuery(req.query.status as any);
  const messageStatus = parseCSVQuery(req.query.messageStatus as any)?.map((s) => (s.toUpperCase() as MessageStatus));

  return { page, pageSize, search, threadStatus, messageStatus };
}

// GET /threads/:id
export const getThread = async (
  req: Request,
  res: Response<ThreadDetailResponse | { error: string }>,
  next: NextFunction
) => {
  const threadId = req.params.id as unknown as number;

  const { userId: clerkUserId } = getAuth(req) as { userId: string | null };
  logger.info("Fetching single thread", { userId: clerkUserId, threadId });

  try {
    const thread = await getSyncedThread(prisma, threadId, clerkUserId!);
    if (!thread) {
      logger.error(`Thread not found for user ${clerkUserId} and thread ${threadId}`);
      return next(new NotFoundError("Thread not found for user", ErrorCode.RESOURCE_NOT_FOUND, { threadId, clerkUserId }));
    }
    const threadDTO = toThreadDTO(thread);
    return res.status(200).json({ ...threadDTO, sync: thread.sync });
  } catch (error) {
    logger.error(`Error fetching thread for user ${clerkUserId} and thread ${threadId}`, error);
    next(error);
  }
}

// GET /threads
export const getThreads = async (
  req: Request<{}, {}, {}, ThreadMetaParams>,
  res: Response<ThreadMetaResponse | { error: string }>,
  next: NextFunction
) => {
  try {

    const { userId: clerkUserId } = getAuth(req) as { userId: string | null };
    logger.info(`Fetching threads list for user ${clerkUserId} with filters`, { query: req.query });

    const { page, pageSize, search, threadStatus, messageStatus } = extractThreadMetaParams(req);

    // call service using prisma client
    const meta = await extractThreadMeta(
      prisma,
      clerkUserId!,
      page,
      pageSize,
      search,
      messageStatus,
      threadStatus as (ThreadStatus | "FOLLOW_UP")[]
    );
    const threads = meta.threads.map(toThreadDTO);

    logger.info(`Threads list fetched successfully for user ${clerkUserId}`, { count: threads.length });
    return res.status(200).json({
      ...meta,
      threads
    });
  } catch (err) {
    logger.error(`Error fetching thread meta`, err);
    next(err);
  }
};

// PATCH /threads/:id
export const patchThread = async (
  req: Request<{ id: string }, {}, UpdateThreadRequest>,
  res: Response<UpdateThreadResponse | { error: string }>,
  next: NextFunction
) => {
  const threadId = req.params.id as unknown as number;

  try {
    let updatedThread;
    const { userId: clerkUserId } = getAuth(req) as { userId: string | null };
    logger.info(`Updating thread status for user ${clerkUserId} with patch ${JSON.stringify(req.body)}`);

    updatedThread = await updateThread(prisma, threadId, clerkUserId!, req.body);
    logger.info(`Thread updated successfully for user ${clerkUserId} with patch ${JSON.stringify(req.body)}`);

    return res.status(200).json(toThreadDTO(updatedThread));
  } catch (error: any) {
    logger.error("Error updating thread status", error);
    next(error);
  }
};