import { getAuth } from "@clerk/express";
import { Request, Response } from "express";
import { UnauthorizedError } from "../types/HttpError.js";
import { ErrorCode } from "../types/errorCodes.js";

export const requireAuth = (req: Request, res: Response, next: any) => {
  const { isAuthenticated } = getAuth(req);
  if (!isAuthenticated) {
    return next(new UnauthorizedError("User authentication required", ErrorCode.UNAUTHORIZED));
  }
  next();
}