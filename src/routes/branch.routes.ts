import { Router } from 'express';
import { BranchController } from '../controllers';
import { AccessModule, AccessPermission, Roles } from '../config';
import {
    branchService,
    optionalVerifyToken,
    requireAccessPermission,
    routeHandler,
    verifyToken,
} from '../utils';
import validate from '../utils/middleware/validation.middleware';
import {
    branchIdSchema,
    createBranchSchema,
    listBranchesSchema,
    updateBranchSchema,
    updateBranchStatusSchema,
} from '../validations';

const router = Router();

const branchController = new BranchController(branchService);

const authRoles = [Roles.Admin, Roles.SubAdmin, Roles.Trainer, Roles.User];

router.post(
    '/',
    verifyToken(authRoles),
    requireAccessPermission(AccessModule.BranchManagement, AccessPermission.Create),
    validate(createBranchSchema),
    routeHandler(branchController.createBranch),
);
router.get(
    '/',
    optionalVerifyToken(authRoles),
    validate(listBranchesSchema),
    routeHandler(branchController.listBranches),
);
router.get(
    '/:id',
    verifyToken(authRoles),
    requireAccessPermission(AccessModule.BranchManagement, AccessPermission.Read),
    validate(branchIdSchema),
    routeHandler(branchController.getBranchById),
);
router.put(
    '/:id',
    verifyToken(authRoles),
    requireAccessPermission(AccessModule.BranchManagement, AccessPermission.Update),
    validate(updateBranchSchema),
    routeHandler(branchController.updateBranch),
);
router.patch(
    '/:id/status',
    verifyToken(authRoles),
    requireAccessPermission(AccessModule.BranchManagement, AccessPermission.Update),
    validate(updateBranchStatusSchema),
    routeHandler(branchController.updateBranchStatus),
);
router.delete(
    '/:id',
    verifyToken(authRoles),
    requireAccessPermission(AccessModule.BranchManagement, AccessPermission.Delete),
    validate(branchIdSchema),
    routeHandler(branchController.deleteBranch),
);

export default router;
