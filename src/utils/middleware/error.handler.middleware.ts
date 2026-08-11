// src/middlewares/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../error'; // adjust path if needed
import { logger } from '../log.util';
import { messages } from '../../lang/api-messages';

interface ErrorWithStatus extends Error {
    status?: number;
}

/**
 * Global error handler middleware
 */
export const errorHandler = (
    err: ErrorWithStatus,
    req: Request,
    res: Response,
    _next: NextFunction,
) => {
    const status = err.status || 500;
    const message = err.message || messages.somethingWentWrong;

    if (!(err instanceof HttpException)) {
        // Log unhandled errors
        logger.error({
            message: err.message,
            stack: err.stack,
            path: req.path,
            method: req.method,
        });
    }

    return res.status(status).json({
        success: false,
        status,
        message,
    });
};
