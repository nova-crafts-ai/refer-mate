import { Request, Response, NextFunction } from "express";
import { HttpError, InternalServerError } from "../types/HttpError.js";
import { ErrorCode, ErrorCodeMetadata } from "../types/errorCodes.js";
import { logger } from "../utils/logger.js";
import { Prisma } from "@prisma/client";
import { getAuth } from "@clerk/express";

interface ErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
        details?: any;
    };
    requestId?: string;
    timestamp: string;
}

function mapPrismaError(error: any): HttpError {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
            case "P2025":
                return new HttpError(404, "Resource not found", ErrorCode.RESOURCE_NOT_FOUND, {
                    prismaCode: error.code,
                    meta: error.meta,
                });

            case "P2002":
                return new HttpError(409, "Resource already exists", ErrorCode.DUPLICATE_ENTRY, {
                    prismaCode: error.code,
                    fields: error.meta?.target,
                });

            case "P2003":
                return new HttpError(400, "Invalid reference", ErrorCode.VALIDATION_FAILED, {
                    prismaCode: error.code,
                    field: error.meta?.field_name,
                });

            case "P2011":
            case "P2012":
            case "P2013":
            case "P2014":
                return new HttpError(400, "Missing required field", ErrorCode.VALIDATION_FAILED, {
                    prismaCode: error.code,
                });

            default:
                return new HttpError(500, "Database error", ErrorCode.DATABASE_ERROR, {
                    prismaCode: error.code,
                });
        }
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
        return new HttpError(400, "Invalid data format", ErrorCode.VALIDATION_FAILED);
    }

    // Generic Prisma error
    return new HttpError(500, "Database error occurred", ErrorCode.DATABASE_ERROR);
}

function isOperationalError(error: any): boolean {
    if (error instanceof HttpError) {
        return error.isOperational;
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        return true;
    }

    return false;
}

function sanitizeError(error: HttpError, isProd: boolean): any {
    const sanitized: any = {
        code: error.errorCode || ErrorCode.INTERNAL_SERVER_ERROR,
        message: error.message,
    };

    if (error.details) {
        if (!isProd || error.isOperational) {
            sanitized.details = error.details;
        }
    }

    if (!isProd && error.stack) {
        sanitized.stack = error.stack;
    }

    return sanitized;
}

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response<ErrorResponse>,
    next: NextFunction
) => {
    const isProd = process.env.NODE_ENV === "production";

    const auth = getAuth(req);
    const userId = auth?.userId || "anonymous";
    const requestId = (req as any).id || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const endpoint = `${req.method} ${req.path}`;

    let httpError: HttpError;

    if (err instanceof HttpError) {
        httpError = err;
    } else if (err instanceof Prisma.PrismaClientKnownRequestError ||
        err instanceof Prisma.PrismaClientValidationError) {
        httpError = mapPrismaError(err);
    } else {
        httpError = new InternalServerError(
            isProd ? "An unexpected error occurred" : err.message,
            ErrorCode.INTERNAL_SERVER_ERROR,
            isProd ? undefined : { originalError: err.message }
        );
    }

    const logContext = {
        endpoint,
        userId,
        requestId,
        statusCode: httpError.status,
        errorCode: httpError.errorCode,
        isOperational: httpError.isOperational,
        ...(httpError.details && { details: httpError.details }),
    };

    if (httpError.isOperational) {
        logger.warn(`Operational error: ${httpError.message}`, logContext);
    } else {
        logger.error(`Unexpected error: ${httpError.message}`, {
            ...logContext,
            stack: httpError.stack,
            originalError: err,
        });
    }

    const errorResponse: ErrorResponse = {
        success: false,
        error: sanitizeError(httpError, isProd),
        requestId,
        timestamp: new Date().toISOString(),
    };

    res.status(httpError.status).json(errorResponse);
};

export const notFoundHandler = (
    req: Request,
    res: Response<ErrorResponse>,
    next: NextFunction
) => {
    const error = new HttpError(
        404,
        `Route ${req.method} ${req.path} not found`,
        ErrorCode.RESOURCE_NOT_FOUND
    );

    next(error);
};

export default errorHandler;
