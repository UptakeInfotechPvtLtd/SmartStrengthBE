import { NextFunction, Request, Response } from 'express';
import correlator from 'express-correlation-id';
import { logger } from '../log.util';
import { ZodError } from 'zod';
import { formatZodErrors } from '../zod-error.util';
import { messages } from '../../lang/api-messages';

export function exceptionDispatchers(err: any, req: Request, res: Response, next: NextFunction) {
    const reqId = correlator.getId();

    logger.error(
        {
            message: err.message,
            stack: err.stack,
            path: `${req.method} ${req.url}`,
        },
        reqId,
    );

    if (res.headersSent) {
        return next(err);
    }

    if (err instanceof ZodError) {
        return res.status(400).json({
            success: false,
            message: messages.validationFailed,
            errors: formatZodErrors(err),
            data: null,
        });
    }

    if (res.statusCode && (res.statusCode == 200 || res.statusCode == 201)) {
    }

    const statusCode = err.status || err.statusCode || 500;

    return res.status(statusCode).json({
        success: false,
        message: err.message || messages.somethingWentWrong,
        data: null,
    });
}
