import { Prisma } from "@prisma/client";
import { logger } from "../utils/logger.js";

export async function handleTailoredJobs(
  tx: Prisma.TransactionClient,
  threadId: number,
  jobs: string[],
  desc: string
) {

  logger.info(`Handling tailored jobs for thread: ${threadId}`);
  for (const jobId of jobs) {
    logger.info(`Upserting job with ID: ${jobId}`);
    let job;
    try {
      job = await tx.job.upsert({
        where: { jobId },
        update: { description: desc },
        create: { jobId, description: desc },
      });
    } catch (error) {
      logger.error(`Error upserting job with ID: ${jobId}`, error);
      job = await tx.job.findUnique({
        where: { jobId },
      });
    }
    if (!job) {
      logger.error(`Job not found for ID: ${jobId}`);
      continue;
    }
    logger.info(`Mapping job to thread: ${jobId} -> ${threadId}`);
    await tx.threadJobMapping.create({
      data: {
        threadId,
        jobId: job.id,
      },
    });
  }
}
