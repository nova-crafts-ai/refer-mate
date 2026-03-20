import { ThreadStatus } from "../types/threadsTypes";

export const THREAD_STATUS_VALUES = ['PENDING', 'FIRST_FOLLOW_UP', 'SECOND_FOLLOW_UP', 'THIRD_FOLLOW_UP', 'CLOSED', 'SENT', 'REFERRED', 'DELETED'] as const;

export const HUMAN_READABLE_STATUS: Record<ThreadStatus, string> = {
  CLOSED: "closed",
  DELETED: "deleted",
  FIRST_FOLLOW_UP: "first follow up",
  PENDING: "pending",
  REFERRED: "referred",
  SECOND_FOLLOW_UP: "second follow up",
  SENT: "sent",
  THIRD_FOLLOW_UP: "third follow up"
}