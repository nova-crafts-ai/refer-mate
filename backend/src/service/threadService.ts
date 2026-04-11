import { MessageStatus, Prisma, ThreadStatus } from "@prisma/client";
import EmailType from "../types/MessageType.js";
import externalMailService from "./externalMailService.js";
import { getLastMessage, populateMessagesForThread } from "./messageService.js";
import { UpdateThreadRequest } from "../schema/threadSchema.js";
import { logger } from "../utils/logger.js";
import { NotFoundError, ConflictError, UnprocessableEntityError } from "../types/HttpError.js";
import { ErrorCode } from "../types/errorCodes.js";

const status = [
  ThreadStatus.PENDING,
  ThreadStatus.SENT,
  ThreadStatus.FIRST_FOLLOW_UP,
  ThreadStatus.SECOND_FOLLOW_UP,
  ThreadStatus.THIRD_FOLLOW_UP
]

export async function createThread(
  tx: Prisma.TransactionClient,
  authUserId: string,
  employeeId: number,
  type: EmailType.COLD | EmailType.TAILORED
) {
  logger.info(`Creating thread for user: ${authUserId} and employee: ${employeeId} of type: ${type}`);

  try {
    return tx.thread.create({
      data: {
        authUserId,
        employeeId,
        lastUpdated: new Date(),
      },
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      logger.error(`Thread already exists: ${error.message}`);
      throw new ConflictError("Thread already exists", ErrorCode.THREAD_ALREADY_EXISTS, { employeeId });
    }
    logger.error(`Error creating thread: ${error.message}`);
    throw error;
  }
}

export async function upgradeThreadStatus(tx: Prisma.TransactionClient, threadId: number, userId: string) {
  logger.info(`Upgrading status of thread ${threadId}`);

  const currentStatus = await tx.thread.findUnique({ where: { id: threadId } });
  if (!currentStatus
    || currentStatus.status === ThreadStatus.CLOSED
    || currentStatus.status === ThreadStatus.REFERRED
    || currentStatus.status === ThreadStatus.DELETED
    || currentStatus.status === ThreadStatus.THIRD_FOLLOW_UP
  ) {
    throw new UnprocessableEntityError(
      "Thread not found or already in unupgradable state",
      ErrorCode.THREAD_NOT_UPGRADABLE,
      { threadId, currentStatus: currentStatus?.status }
    );
  }

  const lastMessage = await getLastMessage(tx, threadId, userId);

  if (lastMessage?.status === MessageStatus.SENT) {
    logger.info(`Thread ${threadId} is already in SENT state`);
    throw new UnprocessableEntityError(
      "Thread is already in SENT state",
      ErrorCode.THREAD_ALREADY_SENT,
      { threadId }
    );
  }

  return await updateThread(tx, threadId, userId, { status: calculateNextState(currentStatus.status) });
}

export async function getStats(
  tx: Prisma.TransactionClient,
  authUserId: string
) {
  logger.info(`Calculating stats for user: ${authUserId}`);

  const statQueries = {
    followUps: {
      authUserId,
      status: {
        in: [
          ThreadStatus.FIRST_FOLLOW_UP,
          ThreadStatus.SECOND_FOLLOW_UP,
          ThreadStatus.THIRD_FOLLOW_UP,
        ],
      },
    },
    absonded: {
      authUserId,
      status: ThreadStatus.CLOSED,
    },
    reachedOut: {
      authUserId,
      status: ThreadStatus.SENT,
    },
    reffered: {
      authUserId,
      status: ThreadStatus.REFERRED,
    },
  };

  const [followUp, absconded, reachedOut, referred] = await Promise.all([
    tx.thread.count({ where: statQueries.followUps }),
    tx.thread.count({ where: statQueries.absonded }),
    tx.thread.count({ where: statQueries.reachedOut }),
    tx.thread.count({ where: statQueries.reffered }),
  ]);

  return {
    followUp,
    absconded,
    reachedOut,
    referred,
  };

}

export async function linkToExternalThread(tx: Prisma.TransactionClient, threadId: number, externalThreadId: string, externalMessageId: string) {
  logger.info(`Linking thread ${threadId} to external thread ${externalThreadId}`);
  try {
    return await tx.thread.update({
      where: { id: threadId },
      data: {
        externalThreadId,
        messages: {
          updateMany: {
            where: {
              threadId: threadId
            },
            data: {
              externalMessageId: externalMessageId
            }
          }
        }
      }
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      logger.error(`Thread not found: ${error.message}`);
      throw new NotFoundError("Thread not found", ErrorCode.THREAD_NOT_FOUND, { threadId });
    }
    logger.error(`Error linking thread: ${error.message}`);
    throw error;
  }
}

export async function updateThread(tx: Prisma.TransactionClient, threadId: number, userId: string, data: UpdateThreadRequest) {
  logger.info(`Updating thread ${threadId} with data ${JSON.stringify(data)}`);
  try {
    return await tx.thread.update({
      where: { id: threadId, authUserId: userId },
      data: {
        automated: data.isAutomated,
        status: data.status,
      }
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      logger.error(`Thread not found: ${error.message}`);
      throw new NotFoundError("Thread not found", ErrorCode.THREAD_NOT_FOUND, { threadId, userId });
    }
    logger.error(`Error updating thread: ${error.message}`);
    throw error;
  }
}

export async function getThreadById(
  tx: Prisma.TransactionClient,
  authUserId: string,
  threadId: number
) {
  logger.info(`Fetching full thread for user ${authUserId} with thread ID ${threadId}`);
  try {
    return tx.thread.findUnique({
      where: { id: threadId, AND: { authUserId: authUserId } },
      include: {
        messages: {
          orderBy: {
            date: "asc",
          },
        },
        employee: true,
        jobs: {
          select: {
            job: true,
          },
        },
      },
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      logger.error(`Thread not found: ${error.message}`);
      throw new NotFoundError("Thread not found", ErrorCode.THREAD_NOT_FOUND, { threadId, authUserId });
    }
    logger.error(`Error fetching thread: ${error.message}`);
    throw error;
  }
}

export async function syncThreadWithGoogle(
  tx: Prisma.TransactionClient,
  authUserId: string,
  threadId: number
) {
  logger.info(`Fetching thread messages for user ${authUserId} with thread ID ${threadId} from external source`);
  let messages: any[] = [];
  let status = true;
  let code = "";

  try {
    messages = await externalMailService.getThreadMessage(threadId, authUserId);
  } catch (err: any) {
    logger.error(`Error fetching thread messages from external source: ${err.message}`);
    status = false;
    code = err.message;
  }

  try {
    logger.info(`Populating messages for user ${authUserId} from external source to db with thread ID ${threadId}`);
    await populateMessagesForThread(tx, threadId, authUserId, messages);
  } catch (err: any) {
    logger.error(`Error populating messages for thread ID: ${threadId}, ${err.message}`);
    status = false;
    code = err.message;
  }

  return {
    status,
    code: status ? undefined : code
  };
}

export async function extractThreadMeta(
  tx: Prisma.TransactionClient,
  authUserId: string,
  page: number,
  pageSize: number,
  search?: string[],
  messageState?: MessageStatus[],
  status?: (ThreadStatus | "FOLLOW_UP")[]
) {
  const skip = (page - 1) * pageSize;
  const limit = pageSize;

  const whereClause: Prisma.ThreadWhereInput = {
    authUserId,
  };

  const employeeFilter: Prisma.EmployeeWhereInput | undefined = buildEmployeeFilter(search, search);

  if (employeeFilter) {
    logger.info(`Applying employee filters: ${employeeFilter}`);
    whereClause.employee = employeeFilter;
  }

  if (status && status.length > 0) {
    const dbStatus: ThreadStatus[] = [];
    for (const s of status) {
      if (s === "FOLLOW_UP") {
        dbStatus.push(ThreadStatus.FIRST_FOLLOW_UP, ThreadStatus.SECOND_FOLLOW_UP, ThreadStatus.THIRD_FOLLOW_UP);
      } else {
        dbStatus.push(s);
      }
    }
    logger.info(`Filtering by statuses: ${dbStatus}`);
    whereClause.status = { in: dbStatus };
  }

  if (messageState && messageState.length > 0) {
    logger.info(`Filtering by message states: ${messageState}`);
    whereClause.messages = { some: { status: { in: messageState } } };
  }

  logger.info(`Fetching threads for user: ${authUserId}`);

  const [threads, total] = await Promise.all([
    tx.thread.findMany({
      where: whereClause,
      orderBy: { lastUpdated: "desc" },
      skip,
      take: limit,
      select: {
        status: true,
        lastUpdated: true,
        createdAt: true,
        employee: {
          select: {
            name: true,
            email: true,
          },
        },
        messages: {
          orderBy: { date: "desc" },
          take: 1,
          select: {
            id: true,
            status: true,
          },
        },
        automated: true,
        jobs: {
          select: {
            job: {
              select: {
                title: true,
                company: true,
                jobId: true,
                description: true,
              }
            }
          }
        },
        id: true,
        _count: {
          select: { messages: true },
        },
      },
    }),
    tx.thread.count({ where: whereClause }),
  ]);

  return {
    threads,
    total,
    page,
    pageSize,
  };
}

export async function getSyncedThread(tx: Prisma.TransactionClient, threadId: number, userId: string) {
  // shoulkd we move this to a new endpoint it will create a delay
  const sync = await syncThreadWithGoogle(tx, userId, threadId);
  logger.info(`Thread synced with Gmail for user ${userId} and thread ${threadId}`);
  const thread = await getThreadById(tx, userId, threadId);

  if (!thread) {
    logger.error(`Thread not found for user ${userId} and thread ${threadId}`);
    throw new NotFoundError("Thread not found", ErrorCode.THREAD_NOT_FOUND, { threadId, userId });
  }

  logger.info(`Thread fetched successfully for user ${userId} and thread ${threadId}`);
  return { ...thread, sync };
}

function buildEmployeeFilter(
  companyName?: string[],
  employeeName?: string[]
): Prisma.EmployeeWhereInput | undefined {
  let employeeFilter: Prisma.EmployeeWhereInput[] = [];

  if (companyName && companyName.length > 0) {
    logger.info(`Filtering by company names: ${companyName}`);
    employeeFilter.push({
      company: { in: companyName, mode: "insensitive" },
    });
  }

  if (employeeName && employeeName.length > 0) {
    logger.info(`Filtering by employee names: ${employeeName}`);
    employeeFilter.push({
      OR: employeeName.map((n) => ({
        name: { contains: n, mode: "insensitive" },
      })),
    });
  }

  if (employeeFilter.length == 0) return undefined;

  return {
    OR: employeeFilter,
  };
}

function calculateNextState(currentStatus: ThreadStatus): ThreadStatus {
  const index = status.findIndex((s) => s === currentStatus);
  if (index === -1) {
    return currentStatus;
  }
  return status[index + 1];
}