import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger.js";
import { getAuth } from "@clerk/express";
import { toProfileDTO } from "../mapper/profileDTOMapper.js";
import { addCredits, getUserProfile, handleResumeUpload, updateProfile as updateProfileService } from "../service/profileService.js";
import prisma from "../apis/prismaClient.js";
import { getStats } from "../service/threadService.js";
import { CreditRequest, CreditResponse, ProfileRequest, ProfileResponse, StatsResponse } from "../schema/profileSchema.js";
import { NotFoundError } from "../types/HttpError.js";
import { ErrorCode } from "../types/errorCodes.js";

// GET /profile
export const getProfile = async (
  req: Request,
  res: Response<ProfileResponse | any>,
  next: NextFunction
) => {

  try {
    const { userId } = getAuth(req);

    const profile = await getUserProfile(userId!);
    if (!profile) {
      logger.info("Profile not found for user", { userId });
      return next(new NotFoundError("Profile not found for user", ErrorCode.RESOURCE_NOT_FOUND, { userId }));
    }

    return res.status(200).json(toProfileDTO(profile));

  } catch (error) {
    logger.error("Error fetching profile", error);
    next(error);
  }
};

// PATCH /profile
export const updateProfile = async (
  req: Request<{}, {}, ProfileRequest>,
  res: Response<ProfileResponse | any>,
  next: NextFunction
) => {

  try {
    const { userId: clerkUserId } = getAuth(req);

    const updatedProfile = await updateProfileService(clerkUserId!, req.body);

    logger.info("Profile updated successfully", { userId: clerkUserId });
    res.json(toProfileDTO(updatedProfile));
  } catch (err: any) {
    logger.error("Error updating profile", err);
    next(err);
  }
};

// PUT /profile/resume
export const uploadResume = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId: clerkUserId } = getAuth(req);
  logger.info("Starting resume upload", { userId: clerkUserId });

  try {
    const result = await handleResumeUpload(req, clerkUserId!);
    res.json(result);
  } catch (error) {
    logger.error("Upload failed", error);
    next(error);
  }
};

// POST /profile/credits/transaction
export const rechargeCredits = async (
  req: Request<{}, {}, CreditRequest>,
  res: Response<CreditResponse>,
  next: NextFunction
) => {

  const { userId: clerkUserId } = getAuth(req);
  const amount = req.body.amount;

  logger.info("Initiating credit recharge", { userId: clerkUserId, amount });

  try {
    const profile = await addCredits(clerkUserId!, amount * 20);
    logger.info("Credits recharged successfully", { userId: clerkUserId, amount });
    res.status(200).json({ amount: profile.credits });
  } catch (e) {
    logger.error("Error recharging credits", e);
    next(e);
  }
}

// GET /profile/stats
export const extractStats = async (
  req: Request,
  res: Response<StatsResponse | { error: string }>,
  next: NextFunction
) => {
  const { userId: clerkUserId } = getAuth(req);
  logger.info("Extracting stats", { userId: clerkUserId });
  try {
    const stats = await getStats(prisma, clerkUserId!);
    logger.info("Stats extracted successfully", { userId: clerkUserId });
    return res.status(200).json(stats);
  } catch (error) {
    logger.error("Error extracting stats", error);
    next(error);
  }
}
