import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { BlackListTokenRepository, DbDataSource } from '../database';
import { ForbiddenException } from '../error';
import redis from '../../config/redis';
import { messages } from '../../lang/api-messages';

interface DecodedToken extends JwtPayload {
    id: number;
    role: string;
    [key: string]: any;
}

// Initialize the repository
const blackListTokenRepo = new BlackListTokenRepository(DbDataSource);

const authenticateRequest = async (req: Request, allowedRoles: string[] = []): Promise<void> => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new ForbiddenException(messages.authTokenRequired);
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SALT || 'your_jwt_secret') as DecodedToken;

    const blacklistedToken = await blackListTokenRepo.findBlackListTokenByToken(token);

    if (blacklistedToken) {
        throw new ForbiddenException(messages.authTokenRevoked);
    }

    if (decoded?.userId && decoded?.sessionId) {
        const redisSessionKey = `refresh:${decoded?.userId}:${decoded?.sessionId}`;
        const activeSession = await redis.get(redisSessionKey);

        if (!activeSession) {
            throw new ForbiddenException(messages.authTokenRevoked);
        }
    }

    (req as any).user = decoded;

    const userRole = decoded?.roleName;

    if (!allowedRoles.includes('*') && !allowedRoles.includes(userRole)) {
        throw new ForbiddenException(messages.accessDenied);
    }
};

export const verifyToken = (allowedRoles: string[] = []) => {
    return async (req: Request, _res: Response, next: NextFunction) => {
        try {
            await authenticateRequest(req, allowedRoles);
            next();
        } catch (error: any) {
            console.error('Token verification error:', error?.message);
            throw new ForbiddenException(error?.message || messages.invalidAuthToken);
        }
    };
};

export const optionalVerifyToken = (allowedRoles: string[] = []) => {
    return async (req: Request, _res: Response, next: NextFunction) => {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader) {
                next();
                return;
            }

            await authenticateRequest(req, allowedRoles);
            next();
        } catch (error: any) {
            console.error('Optional token verification error:', error?.message);
            throw new ForbiddenException(error?.message || messages.invalidAuthToken);
        }
    };
};
