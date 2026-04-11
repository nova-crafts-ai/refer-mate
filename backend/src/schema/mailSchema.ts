import { z } from "zod";
import EmailType from "../types/MessageType.js";
import { MessageSchema } from "./messageSchema.js";

const InceptionSchema = z.object({
    contactName: z.string().min(1, "Contact name is required"),
    contactEmail: z.string().email("Invalid email format").optional(),
    companyName: z.string().min(1, "Company name is required"),
    role: z.string().optional(),
});

// Base parts
const EmailRequestBaseSchema = z.object({
    type: z.nativeEnum(EmailType),
});

// Tailored Email Schema
const TailoredEmailSchema = EmailRequestBaseSchema.merge(InceptionSchema).extend({
    type: z.literal(EmailType.TAILORED),
    jobs: z.array(z.string()).min(1, "At least one job is required"),
    jobDescription: z.string().min(1, "Job description is required"),
});

// Cold Email Schema
const ColdEmailSchema = EmailRequestBaseSchema.merge(InceptionSchema).extend({
    type: z.literal(EmailType.COLD),
    templateId: z.string().optional(),
});

// Followup Email Schema
const FollowupEmailSchema = EmailRequestBaseSchema.extend({
    type: z.literal(EmailType.FOLLOW_UP),
    threadId: z.number().int().positive("Thread ID must be a positive integer"),
});

// Thank You Email Schema
const ThankYouEmailSchema = EmailRequestBaseSchema.extend({
    type: z.literal(EmailType.THANK_YOU),
    threadId: z.number().int().positive("Thread ID must be a positive integer"),
});

// Discriminated Union for GenerateMailBody
export const GenerateMailSchema = z.discriminatedUnion("type", [
    TailoredEmailSchema,
    ColdEmailSchema,
    FollowupEmailSchema,
    ThankYouEmailSchema,
]);

export const DraftMailSchema = MessageSchema.pick({
    subject: true,
    body: true,
    id: true,
}).extend({
    threadId: z.number().int().positive("Thread ID must be a positive integer"),
});

export type DraftMailResponse = z.infer<typeof DraftMailSchema>;
export type GenerateMailBody = z.infer<typeof GenerateMailSchema>;
export type TailoredEmailBody = z.infer<typeof TailoredEmailSchema>;
export type ColdEmailBody = z.infer<typeof ColdEmailSchema>;
export type FollowupEmailBody = z.infer<typeof FollowupEmailSchema>;
export type ThankYouEmailBody = z.infer<typeof ThankYouEmailSchema>;
