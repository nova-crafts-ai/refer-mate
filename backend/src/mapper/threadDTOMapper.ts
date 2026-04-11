import { Thread } from "../schema/threadSchema.js";
import { toEmployeeDTO } from "./employeeDTOMapper.js";
import { toJobDTO } from "./jobDTOMapper.js";
import { toMessageDTO } from "./messageDTOMapper.js";

export const toThreadDTO = (thread: any): Thread => {
  return {
    id: thread.id,
    status: thread.status,
    automated: thread.automated,
    createdAt: thread.createdAt,
    lastUpdated: thread.lastUpdated,
    jobs: thread.jobs.map((job: any) => toJobDTO(job.job)) ?? null,
    employee: toEmployeeDTO(thread.employee),
    messages: thread.messages.map((message: any) => (toMessageDTO(message))),
  };
}       