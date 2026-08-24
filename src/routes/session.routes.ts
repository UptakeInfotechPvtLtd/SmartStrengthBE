import { Router } from 'express';
import { AccessModule, AccessPermission, Roles } from '../config';
import { SessionController } from '../controllers';
import { requireAccessPermission, routeHandler, sessionService, verifyToken } from '../utils';
import validate from '../utils/middleware/validation.middleware';
import {
    createSessionSchema,
    listSessionsSchema,
    sessionIdSchema,
    updateSessionSchema,
    updateSessionStatusSchema,
} from '../validations';

const router = Router();

const sessionController = new SessionController(sessionService);
const authRoles = [Roles.Admin, Roles.SubAdmin, Roles.Trainer, Roles.User];

router.post(
    '/',
    verifyToken(authRoles),
    requireAccessPermission(AccessModule.SingleSessionManagement, AccessPermission.Create),
    validate(createSessionSchema),
    routeHandler(sessionController.createSession),
);
router.get(
    '/',
    verifyToken(authRoles),
    requireAccessPermission(AccessModule.SingleSessionManagement, AccessPermission.Read),
    validate(listSessionsSchema),
    routeHandler(sessionController.listSessions),
);
router.get(
    '/:id',
    verifyToken(authRoles),
    requireAccessPermission(AccessModule.SingleSessionManagement, AccessPermission.Read),
    validate(sessionIdSchema),
    routeHandler(sessionController.getSessionById),
);
router.put(
    '/:id',
    verifyToken(authRoles),
    requireAccessPermission(AccessModule.SingleSessionManagement, AccessPermission.Update),
    validate(updateSessionSchema),
    routeHandler(sessionController.updateSession),
);
router.patch(
    '/:id/status',
    verifyToken(authRoles),
    requireAccessPermission(AccessModule.SingleSessionManagement, AccessPermission.Update),
    validate(updateSessionStatusSchema),
    routeHandler(sessionController.updateSessionStatus),
);
router.delete(
    '/:id',
    verifyToken(authRoles),
    requireAccessPermission(AccessModule.SingleSessionManagement, AccessPermission.Delete),
    validate(sessionIdSchema),
    routeHandler(sessionController.deleteSession),
);

export default router;
