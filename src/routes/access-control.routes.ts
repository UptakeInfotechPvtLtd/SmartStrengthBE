import { Router } from 'express';
import { Roles } from '../config';
import { AccessControlController } from '../controllers';
import { accessControlService, routeHandler, verifyToken } from '../utils';
import validate from '../utils/middleware/validation.middleware';
import {
    getAccessConfigSchema,
    getUserAccessConfigSchema,
    roleAccessConfigSchema,
    upsertAccessConfigSchema,
    upsertUserAccessConfigSchema,
} from '../validations';

const router = Router();

const accessControlController = new AccessControlController(accessControlService);
const masterAdminRoles = [Roles.Admin];
const accessConfigViewRoles = [Roles.Admin, Roles.SubAdmin];
const authRoles = [Roles.Admin, Roles.SubAdmin, Roles.Trainer, Roles.User];

router.get(
    '/modules',
    verifyToken(masterAdminRoles),
    routeHandler(accessControlController.getModules),
);
router.get('/me', verifyToken(authRoles), routeHandler(accessControlController.getMyAccessConfig));
router.get(
    '/role/:roleId',
    verifyToken(accessConfigViewRoles),
    validate(roleAccessConfigSchema),
    routeHandler(accessControlController.getRoleAccessConfig),
);
router.get(
    '/user/:userId',
    verifyToken(masterAdminRoles),
    validate(getUserAccessConfigSchema),
    routeHandler(accessControlController.getUserAccessConfig),
);
router.get(
    '/',
    verifyToken(masterAdminRoles),
    validate(getAccessConfigSchema),
    routeHandler(accessControlController.getAccessConfig),
);
router.put(
    '/',
    verifyToken(masterAdminRoles),
    validate(upsertAccessConfigSchema),
    routeHandler(accessControlController.upsertAccessConfig),
);
router.put(
    '/user',
    verifyToken(masterAdminRoles),
    validate(upsertUserAccessConfigSchema),
    routeHandler(accessControlController.upsertUserAccessConfig),
);

export default router;
