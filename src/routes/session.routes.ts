import { Router } from 'express';
import { Roles } from '../config';
import { SessionController } from '../controllers';
import { routeHandler, sessionService, verifyToken } from '../utils';
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
const manageRoles = [Roles.Admin, Roles.SubAdmin];
const viewRoles = [Roles.Admin, Roles.SubAdmin, Roles.Trainer, Roles.User];

router.post(
    '/',
    verifyToken(manageRoles),
    validate(createSessionSchema),
    routeHandler(sessionController.createSession),
);
router.get(
    '/',
    verifyToken(viewRoles),
    validate(listSessionsSchema),
    routeHandler(sessionController.listSessions),
);
router.get(
    '/:id',
    verifyToken(viewRoles),
    validate(sessionIdSchema),
    routeHandler(sessionController.getSessionById),
);
router.put(
    '/:id',
    verifyToken(manageRoles),
    validate(updateSessionSchema),
    routeHandler(sessionController.updateSession),
);
router.patch(
    '/:id/status',
    verifyToken(manageRoles),
    validate(updateSessionStatusSchema),
    routeHandler(sessionController.updateSessionStatus),
);
router.delete(
    '/:id',
    verifyToken(manageRoles),
    validate(sessionIdSchema),
    routeHandler(sessionController.deleteSession),
);

export default router;
