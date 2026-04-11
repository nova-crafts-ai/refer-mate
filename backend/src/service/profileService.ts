import prisma from "../apis/prismaClient.js";
import { ProfileCompletenessStatus } from "@prisma/client";
import { ProfileRequest } from "../schema/profileSchema.js";
import { logger } from "../utils/logger.js";
import busboy from "busboy";
import { Request } from "express";
import { storageService } from "./storageService.js";
import { enqueueResumeJob } from "../utils/enqueResume.js";
import { BadRequestError, NotFoundError, UnprocessableEntityError } from "../types/HttpError.js";
import { ErrorCode } from "../types/errorCodes.js";

export const getUserProfile = async (authUserId: string) => {
  logger.info(`Fetching user profile for user ${authUserId}`);
  return await prisma.userProfileData.findUnique({
    where: { authUserId },
    include: {
      profileSkills: {
        include: {
          Skills: true,
        },
      },
      experiences: true,
    },
  });
};

export const updateProfile = async (authUserId: string, profile: ProfileRequest) => {
  const {
    summary,
    education,
    skills,
    experience,
    firstName,
    lastName,
    status
  } = profile;

  try {
    logger.info(`Updating user profile for user ${authUserId} with profile ${JSON.stringify(profile)}`);
    return await prisma.userProfileData.update({
      where: { authUserId },
      data: {
        summary,
        education: education ?? undefined,
        firstName,
        lastName,
        status: status === "COMPLETE" ? "COMPLETE" : undefined,
        experiences: experience
          ? {
            deleteMany: {},
            create: experience.map((exp) => {
              const startDate = exp.startDate ? new Date(exp.startDate) : undefined;
              const endDate = exp.endDate ? new Date(exp.endDate) : undefined;

              if ((startDate && isNaN(startDate.getTime())) || (endDate && isNaN(endDate.getTime()))) {
                throw new BadRequestError("Invalid date format in experience", ErrorCode.INVALID_DATE_FORMAT);
              }

              return {
                companyName: exp.company,
                role: exp.role,
                startDate,
                endDate,
                description: exp.description,
              };
            }),
          }
          : undefined,
        profileSkills: skills
          ? {
            deleteMany: {},
            create: skills.map((skill) => ({
              Skills: {
                connectOrCreate: {
                  where: { name: skill.name },
                  create: {
                    name: skill.name,
                    category: "Uncategorized", // Default category as per plan
                  },
                },
              },
            })),
          }
          : undefined,
      },
      include: {
        profileSkills: {
          include: {
            Skills: true,
          },
        },
        experiences: true,
      },
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      logger.error(`Profile not found for user ${authUserId}`);
      throw new NotFoundError("Profile not found", ErrorCode.PROFILE_NOT_FOUND, { authUserId });
    }
    logger.error(`Error updating profile for user ${authUserId}`, error);
    throw error;
  }
};

export const deductCredits = async (authUserId: string, deltaCredits: number) => {
  logger.info(`Deducting credits for user ${authUserId} by ${deltaCredits}`);
  try {
    return await prisma.userProfileData.update({
      where: { authUserId, credits: { gte: deltaCredits } },
      data: {
        credits: {
          decrement: deltaCredits,
        },
      },
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      logger.error(`Failed to deduct credits for user ${authUserId}. Likely insufficient balance.`);
      throw new UnprocessableEntityError(
        "Insufficient credits or profile not found",
        ErrorCode.INSUFFICIENT_CREDITS,
        { authUserId, requestedAmount: deltaCredits }
      );
    }
    logger.error(`Error deducting credits for user ${authUserId}`, error);
    throw error;
  }
};

export const addCredits = async (authUserId: string, deltaCredits: number) => {
  logger.info(`Adding credits for user ${authUserId} by ${deltaCredits}`);
  try {
    return await prisma.userProfileData.update({
      where: { authUserId },
      data: {
        credits: {
          increment: deltaCredits,
        },
      },
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      logger.error(`Failed to add credits for user ${authUserId}. Profile not found.`);
      throw new NotFoundError("Profile not found", ErrorCode.PROFILE_NOT_FOUND, { authUserId });
    }
    logger.error(`Error adding credits for user ${authUserId}`, error);
    throw error;
  }
};

export const handleResumeUpload = (req: Request, authUserId: string): Promise<{ message: string }> => {
  return new Promise((resolve, reject) => {
    logger.info("Starting resume upload service", { userId: authUserId });
    const bb = busboy({
      headers: req.headers,
      limits: {
        files: 1,
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    });
    let autofill = false;
    let fileUploadPromise: Promise<void> | null = null;
    let fileFound = false;

    bb.on("field", (name, val) => {
      if (name === "autofill") {
        autofill = val === "true";
      }
    });

    bb.on("file", (name, file, info) => {
      if (fileUploadPromise) {
        file.resume();
        return reject(new BadRequestError("Only one file is allowed", ErrorCode.FILE_TOO_LARGE));
      }

      fileFound = true;
      const { filename, mimeType } = info;
      const filePath = `user_${authUserId}/${filename}`;

      fileUploadPromise = (async () => {
        try {
          const uploadPath = await storageService.uploadFileStream(filePath, file, mimeType);

          await prisma.userProfileData.update({
            where: { authUserId },
            data: { resumeUrl: uploadPath, status: ProfileCompletenessStatus.PARTIAL },
          });

          logger.info("Resume uploaded successfully", { userId: authUserId, path: uploadPath });

          if (autofill) {
            logger.info("Enqueuing resume parsing job", { userId: authUserId });
            await enqueueResumeJob(authUserId, uploadPath);
            await prisma.userProfileData.update({
              where: { authUserId },
              data: { status: ProfileCompletenessStatus.PROCESSING },
            });
          }
        } catch (err) {
          logger.error("Stream upload error:", err);
          throw err;
        }
      })();
    });

    bb.on("close", async () => {
      try {
        if (fileUploadPromise) {
          await fileUploadPromise;
          resolve({
            message: autofill
              ? "Resume uploaded and sent for parsing"
              : "Resume uploaded successfully",
          });
        } else {
          if (!fileFound) {
            reject(new BadRequestError("No file uploaded", ErrorCode.NO_FILE_UPLOADED));
          } else {
            reject(new BadRequestError("File processing failed", ErrorCode.FILE_PROCESSING_FAILED));
          }
        }
      } catch (error) {
        reject(error);
      }
    });

    bb.on("error", (error) => {
      logger.error("Busboy error", error);
      reject(error);
    });

    req.pipe(bb);
  });
};