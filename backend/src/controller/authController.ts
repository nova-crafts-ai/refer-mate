import { Request, Response } from "express";
import { Webhook } from "svix";
import prisma from "../apis/prismaClient.js";
import { AuthMeResponse, WebhookResponse } from "../schema/authSchema.js";
import { InternalServerError } from "../types/HttpError.js";
import { ErrorCode } from "../types/errorCodes.js";

// Webhook handler
export const handleClerkWebhook = async (req: Request, res: Response<WebhookResponse>) => {
  const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!SIGNING_SECRET) {
    throw new InternalServerError(
      "Error: Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env",
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }

  // Create new Svix instance with secret
  const wh = new Webhook(SIGNING_SECRET);

  // Get headers and body
  const headers = req.headers;
  const payload = (req as any).rawBody;

  // Get Svix headers for verification
  const svix_id = headers["svix-id"];
  const svix_timestamp = headers["svix-timestamp"];
  const svix_signature = headers["svix-signature"];

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    res.status(400).json({
      success: false,
      message: "Error: Missing svix headers",
    });
    return
  }

  let evt: any;

  // Attempt to verify the incoming webhook
  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id as string,
      "svix-timestamp": svix_timestamp as string,
      "svix-signature": svix_signature as string,
    });
  } catch (err: any) {
    console.log("Error: Could not verify webhook:", err.message);
    res.status(400).json({
      success: false,
      message: err.message,
    });
    return
  }
  const eventType = evt.type;

  if (eventType === "user.created" || eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name } = evt.data;

    // Upsert the user
    try {
      await prisma.userProfileData.upsert({
        where: { authUserId: id },
        update: {
          email: email_addresses[0].email_address,
          firstName: first_name,
          lastName: last_name,
        },
        create: {
          authUserId: id,
          email: email_addresses[0].email_address,
          firstName: first_name,
          lastName: last_name,
        }
      })
      console.log(`User ${id} synchronized successfully`);
    } catch (error) {
      console.error("Error saving user to database", error);
      res.status(500).json({ success: false, message: "Database Error" });
      return
    }
  }

  res.status(200).json({
    success: true,
    message: "Webhook received",
  });

};
// Client-side "Lazy Sync" handler
export const getMe = async (req: Request, res: Response<AuthMeResponse>) => {
  const user = res.locals.user;
  res.status(200).json({ user, message: "User info retrieved" });
};