import { RateLimiterRedis } from "rate-limiter-flexible";
import { redisConnection } from "../utils/redis.js";
import { NextFunction, Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { TooManyRequestsError } from "../types/HttpError.js";
import { ErrorCode } from "../types/errorCodes.js";

const distributedRateLimiter = new RateLimiterRedis({
    storeClient: redisConnection,
    keyPrefix: 'middleware',
    points: 10,
    duration: 60,
    blockDuration: 60 * 1.5,
});

export const rateLimiter = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = getAuth(req);
    try {
        await distributedRateLimiter.consume(userId ?? req.ip ?? "unknown");
        next();
    } catch (error) {
        throw new TooManyRequestsError("Too Many Requests", ErrorCode.RATE_LIMIT_EXCEEDED);
    }
}