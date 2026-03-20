import { Message, MessageStatus } from "./messagesTypes";
import { THREAD_STATUS_VALUES } from "../consts/threadsConsts";

export interface ThreadsParams {
  page: number;
  pageSize: number;
  search?: string;
  status?: ThreadStatus | "ALL";
  messageStatus?: MessageStatus;
}

export interface Employee {
  name: string;
  email: string;
  position: string;
  company: string;
}

export interface Job {
  jobId: string;
  title: string;
  company: string;
  description: string;
}

export interface Thread {
  id: number;
  status: ThreadStatus;
  isAutomated: boolean;
  createdAt: string;
  lastUpdated: string;
  employee: Employee;
  jobs?: Job[];
  messages: Message[];
  sync: {
    status: boolean;
    code?: string;
  };
}

export type ThreadMetaItem = Omit<Thread, "messages" | "sync"> & {
  messages: Array<Pick<Message, "id" | "status">>;
};
export interface ThreadsMeta {
  threads: ThreadMetaItem[];
  total: number;
  page: number;
  pageSize: number;
}

export type ThreadStatus = (typeof THREAD_STATUS_VALUES)[number];
