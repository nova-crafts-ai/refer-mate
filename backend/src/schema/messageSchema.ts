import { MessageStatus } from "@prisma/client";
import z from "zod";
import MessageType from "../types/MessageType.js";


export const MessageSchema = z.object({
    id: z.number(),
    subject: z.string(),
    body: z.string(),
    threadId: z.number(),
    date: z.string().datetime(),
    fromUser: z.boolean(),
    status: z.nativeEnum(MessageStatus)
});

const MessageTypeSchema = z.array(z.nativeEnum(MessageType));

export const SendMailSchema = z.object({
    threadId: z.number().int().positive(),
    attachResume: z.boolean().optional(),
});

export const MessageRequestSchema = MessageSchema.omit({
    id: true,
    date: true,
    fromUser: true,
    threadId: true
}).partial();

export type SendMailRequest = z.infer<typeof SendMailSchema>;

export type MessageTypeResponse = z.infer<typeof MessageTypeSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type MessageRequest = z.infer<typeof MessageRequestSchema>;
export type MessageResponse = z.infer<typeof MessageSchema>;
