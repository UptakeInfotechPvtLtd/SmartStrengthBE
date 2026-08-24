import { Router } from 'express';
import { AccessModule, AccessPermission, Roles } from '../config';
import { PackageController } from '../controllers';
import { packageService, requireAccessPermission, routeHandler, verifyToken } from '../utils';
import validate from '../utils/middleware/validation.middleware';
import {
    createPackageSchema,
    listPackagesSchema,
    packageIdSchema,
    updatePackageSchema,
    updatePackageStatusSchema,
} from '../validations';

const router = Router();

const packageController = new PackageController(packageService);
const authRoles = [Roles.Admin, Roles.SubAdmin, Roles.Trainer, Roles.User];

router.post(
    '/',
    verifyToken(authRoles),
    requireAccessPermission(AccessModule.PackageManagement, AccessPermission.Create),
    validate(createPackageSchema),
    routeHandler(packageController.createPackage),
);
router.get(
    '/',
    verifyToken(authRoles),
    requireAccessPermission(AccessModule.PackageManagement, AccessPermission.Read),
    validate(listPackagesSchema),
    routeHandler(packageController.listPackages),
);
router.get(
    '/:id',
    verifyToken(authRoles),
    requireAccessPermission(AccessModule.PackageManagement, AccessPermission.Read),
    validate(packageIdSchema),
    routeHandler(packageController.getPackageById),
);
router.put(
    '/:id',
    verifyToken(authRoles),
    requireAccessPermission(AccessModule.PackageManagement, AccessPermission.Update),
    validate(updatePackageSchema),
    routeHandler(packageController.updatePackage),
);
router.patch(
    '/:id/status',
    verifyToken(authRoles),
    requireAccessPermission(AccessModule.PackageManagement, AccessPermission.Update),
    validate(updatePackageStatusSchema),
    routeHandler(packageController.updatePackageStatus),
);
router.delete(
    '/:id',
    verifyToken(authRoles),
    requireAccessPermission(AccessModule.PackageManagement, AccessPermission.Delete),
    validate(packageIdSchema),
    routeHandler(packageController.deletePackage),
);

export default router;
