import {
  ColdEmailBody,
  FollowupEmailBody,
  GenerateMailBody,
  TailoredEmailBody,
  ThankYouEmailBody,
} from "../schema/mailSchema.js";

export type TailoredEmailRequest = TailoredEmailBody & { userId: string };
export type FollowupEmailRequest = FollowupEmailBody & { userId: string };
export type ColdEmailRequest = ColdEmailBody & { userId: string };
export type ThankYouEmailRequest = ThankYouEmailBody & { userId: string };

export type GenerateMailRequest = GenerateMailBody & { userId: string };
