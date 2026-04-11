import { ErrorCode } from "./errorCodes.js";

export class HttpError extends Error {
    status: number;
    errorCode?: ErrorCode;
    details?: any;
    isOperational: boolean;

    constructor(
        status: number,
        message: string,
        errorCode?: ErrorCode,
        details?: any,
        isOperational: boolean = true
    ) {
        super(message);
        this.status = status;
        this.errorCode = errorCode;
        this.details = details;
        this.isOperational = isOperational;
        this.name = this.constructor.name;

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export class BadRequestError extends HttpError {
    constructor(message: string, errorCode: ErrorCode = ErrorCode.BAD_REQUEST, details?: any) {
        super(400, message, errorCode, details);
    }
}

export class UnauthorizedError extends HttpError {
    constructor(message: string, errorCode: ErrorCode = ErrorCode.UNAUTHORIZED, details?: any) {
        super(401, message, errorCode, details);
    }
}

export class ForbiddenError extends HttpError {
    constructor(message: string, errorCode: ErrorCode = ErrorCode.FORBIDDEN, details?: any) {
        super(403, message, errorCode, details);
    }
}

export class NotFoundError extends HttpError {
    constructor(message: string, errorCode: ErrorCode = ErrorCode.RESOURCE_NOT_FOUND, details?: any) {
        super(404, message, errorCode, details);
    }
}

export class ConflictError extends HttpError {
    constructor(message: string, errorCode: ErrorCode = ErrorCode.RESOURCE_CONFLICT, details?: any) {
        super(409, message, errorCode, details);
    }
}

export class UnprocessableEntityError extends HttpError {
    constructor(message: string, errorCode: ErrorCode = ErrorCode.UNPROCESSABLE_ENTITY, details?: any) {
        super(422, message, errorCode, details);
    }
}

export class InternalServerError extends HttpError {
    constructor(message: string = "Internal server error", errorCode: ErrorCode = ErrorCode.INTERNAL_SERVER_ERROR, details?: any) {
        super(500, message, errorCode, details, false); // Not operational - indicates a bug
    }
}

export class ExternalServiceError extends HttpError {
    constructor(message: string, errorCode: ErrorCode = ErrorCode.EXTERNAL_SERVICE_ERROR, details?: any) {
        super(502, message, errorCode, details);
    }
}

export class ServiceUnavailableError extends HttpError {
    constructor(message: string, errorCode: ErrorCode = ErrorCode.SERVICE_UNAVAILABLE, details?: any) {
        super(503, message, errorCode, details);
    }
}

export class TooManyRequestsError extends HttpError {
    constructor(message: string, errorCode: ErrorCode = ErrorCode.INSUFFICIENT_CREDITS, details?: any) {
        super(429, message, errorCode, details);
    }
}

export class RateLimitExceededError extends HttpError {
    constructor(message: string, errorCode: ErrorCode = ErrorCode.RATE_LIMIT_EXCEEDED, details?: any) {
        super(429, message, errorCode, details);
    }
}

export default HttpError;