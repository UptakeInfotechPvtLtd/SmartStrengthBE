import { Router } from 'express';
import { AccessModule, AccessPermission, Roles } from '../config';
import { AvailabilityManagementController } from '../controllers';
import {
    requireAccessPermission,
    routeHandler,
    availabilityManagementService,
    verifyToken,
} from '../utils';
import validate from '../utils/middleware/validation.middleware';
import {
    branchAvailabilityParamsSchema,
    createBranchMaintenanceSchema,
    createTrainerMaintenanceSchema,
    deleteBranchMaintenanceSchema,
    deleteTrainerMaintenanceSchema,
    listTrainerAvailabilitiesSchema,
    trainerAvailabilityParamsSchema,
    updateBranchAvailabilityStatusSchema,
    updateTrainerAvailabilityStatusSchema,
} from '../validations';

const router = Router();

const availabilityController = new AvailabilityManagementController(availabilityManagementService);
const authRoles = [Roles.Admin, Roles.SubAdmin, Roles.Trainer, Roles.User];

router.patch(
    '/branches/:branchId/status',
    verifyToken(authRoles),
    requireAccessPermission(AccessModule.SlotMaintenance, AccessPermission.Update),
    validate(updateBranchAvailabilityStatusSchema),
    routeHandler(availabilityController.updateBranchAvailabilityStatus),
);
router.post(
    '/branches/:branchId/maintenance',
    verifyToken(authRoles),
    requireAccessPermission(AccessModule.SlotMaintenance, AccessPermission.Create),
    validate(createBranchMaintenanceSchema),
    routeHandler(availabilityController.createBranchMaintenance),
);
router.get(
    '/branches/:branchId/maintenance',
    verifyToken(authRoles),
    requireAccessPermission(AccessModule.SlotMaintenance, AccessPermission.Read),
    validate(branchAvailabilityParamsSchema),
    routeHandler(availabilityController.listBranchMaintenances),
);
router.delete(
    '/branches/:branchId/maintenance/:maintenanceId',
    verifyToken(authRoles),
    requireAccessPermission(AccessModule.SlotMaintenance, AccessPermission.Delete),
    validate(deleteBranchMaintenanceSchema),
    routeHandler(availabilityController.deleteBranchMaintenance),
);
router.get(
    '/trainers',
    verifyToken(authRoles),
    requireAccessPermission(AccessModule.SlotMaintenance, AccessPermission.Read),
    validate(listTrainerAvailabilitiesSchema),
    routeHandler(availabilityController.listTrainerAvailabilities),
);
router.patch(
    '/trainers/:trainerId/status',
    verifyToken(authRoles),
    requireAccessPermission(AccessModule.SlotMaintenance, AccessPermission.Update),
    validate(updateTrainerAvailabilityStatusSchema),
    routeHandler(availabilityController.updateTrainerAvailability),
);
router.post(
    '/trainers/:trainerId/maintenance',
    verifyToken(authRoles),
    requireAccessPermission(AccessModule.SlotMaintenance, AccessPermission.Create),
    validate(createTrainerMaintenanceSchema),
    routeHandler(availabilityController.createTrainerMaintenance),
);
router.get(
    '/trainers/:trainerId/maintenance',
    verifyToken(authRoles),
    requireAccessPermission(AccessModule.SlotMaintenance, AccessPermission.Read),
    validate(trainerAvailabilityParamsSchema),
    routeHandler(availabilityController.listTrainerMaintenances),
);
router.delete(
    '/trainers/:trainerId/maintenance/:maintenanceId',
    verifyToken(authRoles),
    requireAccessPermission(AccessModule.SlotMaintenance, AccessPermission.Delete),
    validate(deleteTrainerMaintenanceSchema),
    routeHandler(availabilityController.deleteTrainerMaintenance),
);

export default router;
