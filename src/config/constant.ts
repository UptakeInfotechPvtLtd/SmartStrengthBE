import { SignOptions } from 'jsonwebtoken';
import { getEnv } from '../utils';

export const TOKEN_EXPIRES = (getEnv('JWT_EXPIRES') ?? '1d') as SignOptions['expiresIn'];
export const REFRESH_TOKEN_EXPIRES = (getEnv('JWT_REFRESH_TOKEN_EXPIRES') ??
    '30d') as SignOptions['expiresIn'];
export const REDIS_EXPIRATION_SECONDS = 60 * 60 * 24 * 30; // '30 Days';
