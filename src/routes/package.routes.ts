import { Router } from 'express';
import { Roles } from '../config';
import { PackageController } from '../controllers';
import { packageService, routeHandler, verifyToken } from '../utils';
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
const manageRoles = [Roles.Admin];
const viewRoles = [Roles.Admin, Roles.SubAdmin, Roles.Trainer, Roles.User];

router.post(
    '/',
    verifyToken(manageRoles),
    validate(createPackageSchema),
    routeHandler(packageController.createPackage),
);
router.get(
    '/',
    verifyToken(viewRoles),
    validate(listPackagesSchema),
    routeHandler(packageController.listPackages),
);
router.get(
    '/:id',
    verifyToken(viewRoles),
    validate(packageIdSchema),
    routeHandler(packageController.getPackageById),
);
router.put(
    '/:id',
    verifyToken(manageRoles),
    validate(updatePackageSchema),
    routeHandler(packageController.updatePackage),
);
router.patch(
    '/:id/status',
    verifyToken(manageRoles),
    validate(updatePackageStatusSchema),
    routeHandler(packageController.updatePackageStatus),
);
router.delete(
    '/:id',
    verifyToken(manageRoles),
    validate(packageIdSchema),
    routeHandler(packageController.deletePackage),
);

export default router;
