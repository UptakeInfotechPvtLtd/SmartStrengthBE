import { NextFunction, Request, Response } from 'express';
import { AccessModule, AccessPermission, Roles } from '../../config';
import { messages } from '../../lang/api-messages';
import { AccessControlRepository, DbDataSource } from '../database';
import { ForbiddenException } from '../error';

const accessControlRepo = new AccessControlRepository(DbDataSource);

export const requireAccessPermission = (moduleKey: AccessModule, permission: AccessPermission) => {
    return async (req: Request, _res: Response, next: NextFunction) => {
        try {
            const authUser = (req as any).user;
            if (authUser?.roleName === Roles.Admin) {
                next();
                return;
            }

            const hasPermission = await accessControlRepo.hasPermission(
                authUser?.roleId,
                authUser?.userId,
                moduleKey,
                permission,
            );

            if (!hasPermission) {
                throw new ForbiddenException(messages.accessPermissionDenied);
            }

            next();
        } catch (error: any) {
            next(error);
        }
    };
};
