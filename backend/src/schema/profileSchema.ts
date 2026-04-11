import { ProfileCompletenessStatus } from "@prisma/client";
import z from "zod";
import { JSONSchema } from "zod/v4/core";


const ExperienceSchema = z.object({
    company: z.string(),
    role: z.string(),
    startDate: z.string().datetime().transform((date) => new Date(date)).optional(),
    endDate: z.string().datetime().transform((date) => new Date(date)).optional(),
    description: z.string().optional(),
});

const SkillSchema = z.object({
    name: z.string(),
    category: z.string().optional(),
});

export const ProfileSchema = z.object({
    summary: z.string().optional(),
    education: z.array(z.object(JSONSchema)).optional(),
    email: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phoneNo: z.string().optional(),
    status: z.enum([ProfileCompletenessStatus.INCOMPLETE, ProfileCompletenessStatus.PARTIAL, ProfileCompletenessStatus.COMPLETE]).optional(),
    credits: z.number().optional(),
    experience: z.array(ExperienceSchema).optional(),
    skills: z.array(SkillSchema).optional(),
});

const StatsSchema = z.object({
    followUp: z.number(),
    absconded: z.number(),
    reachedOut: z.number(),
    referred: z.number()
});

export const CreditsSchema = z.object({
    amount: z.number()
});

export type ProfileRequest = z.infer<typeof ProfileSchema>;
export type ProfileResponse = z.infer<typeof ProfileSchema>;
export type StatsResponse = z.infer<typeof StatsSchema>;
export type CreditResponse = z.infer<typeof CreditsSchema>;
export type CreditRequest = z.infer<typeof CreditsSchema>;
