import { Queue } from 'bullmq';
import { redisConnection } from './redis.js';

export const resumeQueue = new Queue('resume-processing', {
  connection: redisConnection as any,
});

// Add job with retry and backoff configuration
export const enqueueResumeJob = async (userId: string, resumePath: string) => {
  await resumeQueue.add(
    'parse-resume',
    { userId, resumePath },
    {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 10000, // 10 seconds
      },
      removeOnComplete: true,
      removeOnFail: false,
    }
  );
};
