import { ThreadStatus, MessageStatus } from "@prisma/client";
import z from "zod";
import { MessageSchema } from "./messageSchema.js";

const JobSchema = z.object({
    title: z.string().nullable(),
    company: z.string().nullable(),
    jobId: z.string(),
    description: z.string().nullable()
});

export const EmployeeSchema = z.object({
    name: z.string(),
    email: z.string().nullable()
});

const ThreadBaseSchema = z.object({
    id: z.number(),
    createdAt: z.string().datetime(),
    lastUpdated: z.string().datetime(),
    status: z.nativeEnum(ThreadStatus),
    automated: z.boolean(),
    employee: EmployeeSchema,
    jobs: z.array(JobSchema).optional()
});

const ThreadSchema = ThreadBaseSchema.extend({
    messages: z.array(MessageSchema)
});

const ThreadDetailSchema = ThreadSchema.extend({
    sync: z.object({
        status: z.boolean(),
        code: z.string().optional()
    })
});

export const ThreadMetaParamsSchema = z.object({
    page: z.string().optional(),
    pageSize: z.string().optional(),
    status: z.preprocess(
        (val) => (typeof val === "string" ? val.split(",").map(s => s.trim()) : val),
        z.array(z.nativeEnum(ThreadStatus).or(z.literal("FOLLOW_UP"))).optional()
    ).optional(),
    search: z.preprocess(
        (val) => (typeof val === "string" ? val.split(",").map(s => s.trim()) : val),
        z.array(z.string()).optional()
    ).optional(),
    messageStatus: z.preprocess(
        (val) => (typeof val === "string" ? val.split(",").map(s => s.trim()) : val),
        z.array(z.nativeEnum(MessageStatus)).optional()
    ).optional()
});

const ThreadMetaSchema = z.object({
    threads: z.array(ThreadBaseSchema.extend({
        messages: z.array(MessageSchema.pick({ id: true, status: true })),
    })),
    total: z.number().default(0),
    page: z.number(),
    pageSize: z.number()
});

export const UpdateThreadSchema = z.object({
    status: z.nativeEnum(ThreadStatus).optional(),
    isAutomated: z.boolean().optional(),
}).refine(data => data.status !== undefined || data.isAutomated !== undefined, {
    message: "At least one of 'status' or 'isAutomated' must be provided",
});

export type UpdateThreadRequest = z.infer<typeof UpdateThreadSchema>;
export type UpdateThreadResponse = z.infer<typeof UpdateThreadSchema>;
export type Job = z.infer<typeof JobSchema>;
export type Employee = z.infer<typeof EmployeeSchema>;
export type Thread = z.infer<typeof ThreadSchema>;
export type ThreadMetaParams = z.infer<typeof ThreadMetaParamsSchema>;
export type ThreadMetaResponse = z.infer<typeof ThreadMetaSchema>;
export type ThreadDetailResponse = z.infer<typeof ThreadDetailSchema>;
export type ThreadResponse = z.infer<typeof ThreadBaseSchema>;