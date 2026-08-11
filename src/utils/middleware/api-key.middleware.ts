import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { BadRequestException, UnauthorizedException } from '../error';
import { messages } from '../../lang/api-messages';

/**
 * Authorizes the public QR scanner endpoint without requiring a user JWT.
 * The key must be supplied in the x-api-key request header.
 */
export const verifyQrApiKey = (req: Request, _res: Response, next: NextFunction): void => {
    const configuredKey = process.env.QR_VERIFY_API_KEY?.trim();

    if (!configuredKey) {
        throw new BadRequestException(messages.qrApiKeyNotConfigured);
    }

    const providedKey = req.headers['x-api-key'];
    if (typeof providedKey !== 'string' || !providedKey.trim()) {
        throw new UnauthorizedException(messages.qrApiKeyRequired);
    }

    const configuredBuffer = Buffer.from(configuredKey);
    const providedBuffer = Buffer.from(providedKey.trim());
    const isValid =
        configuredBuffer.length === providedBuffer.length &&
        crypto.timingSafeEqual(configuredBuffer, providedBuffer);

    if (!isValid) {
        throw new UnauthorizedException(messages.qrApiKeyInvalid);
    }

    next();
};
