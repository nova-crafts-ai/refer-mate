import { z } from "zod";

export const WebhookResponseSchema = z.object({
    success: z.boolean(),
    message: z.string(),
});


export const AuthMeResponseSchema = z.object({
    user: z.any(),
    message: z.string(),
});

export type WebhookResponse = z.infer<typeof WebhookResponseSchema>;
export type AuthMeResponse = z.infer<typeof AuthMeResponseSchema>;
