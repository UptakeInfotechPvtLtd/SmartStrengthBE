import { NextFunction, Request, Response } from 'express';
import { AccessModule, AccessPermission, Roles } from '../../config';
import { messages } from '../../lang/api-messages';
import { AccessControlRepository, DbDataSource } from '../database';
import { ForbiddenException } from '../error';

const accessControlRepo = new AccessControlRepository(DbDataSource);

type AccessPermissionRule = {
    moduleKey: AccessModule;
    permission: AccessPermission;
};

export const requireAccessPermission = (moduleKey: AccessModule, permission: AccessPermission) => {
    return async (req: Request, _res: Response, next: NextFunction) => {
        try {
            const authUser = (req as any).user;
            if (authUser?.roleName === Roles.Admin || authUser?.roleName === Roles.User) {
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

export const requireAnyAccessPermission = (rules: AccessPermissionRule[]) => {
    return async (req: Request, _res: Response, next: NextFunction) => {
        try {
            const authUser = (req as any).user;
            if (authUser?.roleName === Roles.Admin || authUser?.roleName === Roles.User) {
                next();
                return;
            }

            const permissionResults = await Promise.all(
                rules.map((rule) =>
                    accessControlRepo.hasPermission(
                        authUser?.roleId,
                        authUser?.userId,
                        rule.moduleKey,
                        rule.permission,
                    ),
                ),
            );
            const hasPermission = permissionResults.some(Boolean);

            if (!hasPermission) {
                throw new ForbiddenException(messages.accessPermissionDenied);
            }

            next();
        } catch (error: any) {
            next(error);
        }
    };
};

export const requireSessionAccessPermission = (permission: AccessPermission) => {
    return async (req: Request, _res: Response, next: NextFunction) => {
        try {
            const authUser = (req as any).user;
            if (authUser?.roleName === Roles.Admin || authUser?.roleName === Roles.User) {
                next();
                return;
            }

            const querySachin = req.query.isSachinStatus;
            const isSachin =
                querySachin === 'true' ||
                (querySachin as unknown) === true ||
                req.body?.isSachinStatus === true;

            const isExplicitSingle =
                querySachin === 'false' ||
                (querySachin as unknown) === false ||
                (req.body?.isSachinStatus !== undefined && req.body?.isSachinStatus === false);

            const modulesToCheck: AccessModule[] = isSachin
                ? [AccessModule.TrainWithSachinManagement, AccessModule.SingleSessionManagement]
                : isExplicitSingle
                  ? [AccessModule.SingleSessionManagement]
                  : [AccessModule.SingleSessionManagement, AccessModule.TrainWithSachinManagement];

            const permissionResults = await Promise.all(
                modulesToCheck.map((moduleKey) =>
                    accessControlRepo.hasPermission(
                        authUser?.roleId,
                        authUser?.userId,
                        moduleKey,
                        permission,
                    ),
                ),
            );
            const hasPermission = permissionResults.some(Boolean);

            if (!hasPermission) {
                throw new ForbiddenException(messages.accessPermissionDenied);
            }

            next();
        } catch (error: any) {
            next(error);
        }
    };
};
