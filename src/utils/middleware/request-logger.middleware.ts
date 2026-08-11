// src/middlewares/request-logger.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { logger } from '../log.util';
import os from 'os';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const startTime = performance.now();

    // Listen for response finish event
    res.on('finish', () => {
        const duration = performance.now() - startTime;
        const { method, originalUrl, ip } = req;
        const hostname = os.hostname();
        const userAgent = req.get('user-agent') || '';
        const referer = req.get('referer') || '';
        const { statusCode } = res;
        const contentLength = res.get('content-length');

        logger.info(
            `[${hostname}] method=${method} url='${originalUrl}' performance=${duration.toFixed(
                2,
            )}ms statusCode='${statusCode}' contentLength='${contentLength}' referer='${referer}' user_agent='${userAgent}' ip='${ip}'`,
        );
    });

    next();
};
