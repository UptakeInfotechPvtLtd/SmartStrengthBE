import * as crypto from 'crypto';
import { compare, genSaltSync, hash } from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import redis from '../config/redis';
import {
    IJwtPayload,
    REDIS_EXPIRATION_SECONDS,
    REFRESH_TOKEN_EXPIRES,
    TOKEN_EXPIRES,
} from '../config';
import { messages } from '../lang/api-messages';
import { UnauthorizedException } from './error';

/**
 * It returns the md5 hash of the given string
 */
export const md5 = (str: string) => {
    return crypto.createHash('md5').update(str).digest('hex');
};

export interface PostgresSortParams {
    limit?: number;
    offset?: number;
    orders?: {
        order: 'asc' | 'desc';
        orderColumn: string;
    }[];
}

export interface PostgresCompareSchema {
    key: string;
    isWildCard?: boolean;
    customCheck?: string;
    customQuery?: string;
    value: string | number | boolean | null;
}

export interface PostgresSearchParams {
    or?: PostgresCompareSchema[];
    and?: PostgresCompareSchema[];
    joinBothWith?: 'or' | 'and';
}

export interface JwtPayload {
    uid: string;
}

export interface Sha512Interface {
    salt: string;
    passwordHash: string;
}

export interface IVerifyEmailAndForgotPasswordTokenPayload {
    email: string;
    userId: string;
}

/**
 * JWT SIGN - Refresh token
 */
export const jwtRefreshSign = (data: object) => {
    return jwt.sign(data, process.env.JWT_REFRESH_SALT || 'secret', {
        algorithm: 'HS256',
        expiresIn: REFRESH_TOKEN_EXPIRES,
    });
};

/**
 * JWT SIGN - Access token
 */
export const jwtSign = (data: object) => {
    return jwt.sign(data, process.env.JWT_SALT || 'secret', {
        algorithm: 'HS256',
        // expiresIn: parseInt(process.env.JWT_EXPIRES || '10000') * 1000,
        expiresIn: TOKEN_EXPIRES,
    });
};

export const generateTokens = async (tokenPayload: IJwtPayload) => {
    const sessionId = uuidv4();
    const tokenSessionPayload = { ...tokenPayload, sessionId };

    const accessToken = jwtSign(tokenSessionPayload);

    const refreshToken = jwtRefreshSign(tokenSessionPayload);

    const redisKey = `refresh:${tokenPayload?.userId}:${sessionId}`;
    await redis.set(redisKey, refreshToken);
    await redis.expire(redisKey, REDIS_EXPIRATION_SECONDS);

    console.log(`[generateTokens] New tokens generated`);
    console.log(`[generateTokens] Redis key: ${redisKey}`);
    console.log(`[generateTokens] Redis TTL set to ${REDIS_EXPIRATION_SECONDS} seconds`);

    const decoded: any = jwt.decode(refreshToken);

    console.log(
        `[generateTokens] Refresh token expires:`,
        new Date(decoded.exp * 1000).toISOString(),
    );

    return { accessToken, refreshToken };
};

/**
 * JWT SIGN for email verification / forgot password
 */
export const jwtSignForEmailVerificationAndForgotPassword = (data: object) => {
    return jwt.sign(
        data,
        process.env.JWT_SALT_FOR_EMAIL_VERIFICATION_AND_FORGOT_PASSWORD || 'secret',
        {
            algorithm: 'HS256',
            expiresIn: parseInt(process.env.JWT_EXPIRES || '10000') * 1000,
        },
    );
};

/**
 * Verify token
 */
export const jwtVerify = (token: string) => {
    return jwt.verify(token, process.env.JWT_SALT || 'secret', {
        algorithms: ['HS256'],
    });
};

/**
 * Verify token for email verification and forgot password
 */
export const tokenVerifyForEmailVerificationAndForgotPassword = (token: string) => {
    try {
        const decodedToken = jwt.verify(
            token,
            process.env.JWT_SALT_FOR_EMAIL_VERIFICATION_AND_FORGOT_PASSWORD || 'secret',
            { algorithms: ['HS256'] },
        );

        return decodedToken;
    } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
            throw new UnauthorizedException(messages.tokenExpires);
        } else {
            throw new UnauthorizedException(messages.invalidToken);
        }
    }
};

/**
 * Generate random strong password string
 */
export const generateRandomString = (length: number) => {
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const digitChars = '0123456789';
    const specialChars = '@#$%&';

    let randomString = '';

    randomString += uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)];
    randomString += lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)];
    randomString += digitChars[Math.floor(Math.random() * digitChars.length)];
    randomString += specialChars[Math.floor(Math.random() * specialChars.length)];

    for (let i = 4; i < length; i++) {
        const charset = uppercaseChars + lowercaseChars + digitChars + specialChars;
        randomString += charset[Math.floor(Math.random() * charset.length)];
    }

    return randomString
        .split('')
        .sort(() => 0.5 - Math.random())
        .join('');
};

/**
 * OTP Generator
 */
export const otpGenerator = (length: number) => {
    const characters = '0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return result;
};

/**
 * Get milliseconds from days
 */
export function getMsTimeFromDays(days: number) {
    return days * 24 * 60 * 60 * 1000;
}

/**
 * Trim and lowercase
 */
export function trimAndLowerCase(value = '') {
    return `${String(value)}`.trim().toLowerCase();
}

/**
 * Get domain from email
 */
export function getDomainFromEmail(email: string) {
    return String(email)
        .substring(email.lastIndexOf('@') + 1)
        .trim()
        .toLowerCase();
}

/**
 * Compare password
 */
export async function comparePassword(plainPassword: string, passwordHash: string) {
    return await compare(plainPassword, passwordHash);
}

/**
 * Make hash
 */
export async function makeHash(plainPassword: string, salt: string): Promise<string> {
    return await hash(plainPassword, salt);
}

/**
 * Generate salt
 */
export async function generateSalt(round = 10) {
    return genSaltSync(round);
}

/**
 * Generate salt and hash
 */
export async function generateSaltAndHash(userPassword: string): Promise<Sha512Interface> {
    const salt = await generateSalt();
    const passwordHash = await makeHash(userPassword, salt);

    return { salt, passwordHash };
}

/**
 * Add months using Moment
 */
export const addMonths = (months: number, date: Date) => {
    return moment(date).add(months, 'months').toDate();
};

/**
 * Validate JWT and store user into request object
 */
export const validateJwt = (token: string, req: any) => {
    try {
        const data = assertJwt(token);
        req.user = data;
        return true;
    } catch (e) {
        return false;
    }
};

/**
 * Assert JWT
 */
export const assertJwt = (token?: string) => {
    try {
        if (!token) throw new UnauthorizedException(messages.authorizationRequired);

        if (!token.includes('Bearer')) {
            throw new UnauthorizedException(messages.authorizationBearerRequired);
        }

        const splitBearer = token.split(' ')[1];
        const jwtData = jwtVerify(String(splitBearer)) as any;
        return jwtData;
    } catch (e) {
        if (e instanceof jwt.JsonWebTokenError) {
            throw new UnauthorizedException(messages.tokenParseFailed);
        }
        throw e;
    }
};
