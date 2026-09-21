import { Router } from 'express';
import { AccessModule, AccessPermission, Roles } from '../config/enum';
import { RosterController } from '../controllers';
import { requireAccessPermission, rosterService, routeHandler, verifyToken } from '../utils';
import validate from '../utils/middleware/validation.middleware';
import {
    createRosterSchema,
    listRostersSchema,
    rosterIdSchema,
    updateRosterStatusSchema,
} from '../validations/roster.validations';

const router = Router();

const rosterController = new RosterController(rosterService);
const authRoles = [Roles.Admin, Roles.SubAdmin, Roles.Trainer];

router.post(
    '/',
    verifyToken(authRoles),
    requireAccessPermission(AccessModule.RosterManagement, AccessPermission.Create),
    validate(createRosterSchema),
    routeHandler(rosterController.createRosters),
);
router.get(
    '/',
    verifyToken(authRoles),
    requireAccessPermission(AccessModule.RosterManagement, AccessPermission.Read),
    validate(listRostersSchema),
    routeHandler(rosterController.listRosters),
);
router.patch(
    '/status',
    verifyToken(authRoles),
    requireAccessPermission(AccessModule.RosterManagement, AccessPermission.Update),
    validate(updateRosterStatusSchema),
    routeHandler(rosterController.updateRosterStatus),
);
router.get(
    '/:id',
    verifyToken(authRoles),
    requireAccessPermission(AccessModule.RosterManagement, AccessPermission.Read),
    validate(rosterIdSchema),
    routeHandler(rosterController.getRosterById),
);
router.delete(
    '/:id',
    verifyToken(authRoles),
    requireAccessPermission(AccessModule.RosterManagement, AccessPermission.Delete),
    validate(rosterIdSchema),
    routeHandler(rosterController.deleteRoster),
);

export default router;
