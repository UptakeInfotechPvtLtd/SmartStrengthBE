import { Router } from 'express';
import { BranchController } from '../controllers';
import { Roles } from '../config';
import { branchService, routeHandler, verifyToken } from '../utils';
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

const manageRoles = [Roles.Admin, Roles.SubAdmin];
const viewRoles = [Roles.Admin, Roles.SubAdmin, Roles.Trainer, Roles.User];

router.post(
    '/',
    verifyToken(manageRoles),
    validate(createBranchSchema),
    routeHandler(branchController.createBranch),
);
router.get(
    '/',
    verifyToken(viewRoles),
    validate(listBranchesSchema),
    routeHandler(branchController.listBranches),
);
router.get(
    '/:id',
    verifyToken(viewRoles),
    validate(branchIdSchema),
    routeHandler(branchController.getBranchById),
);
router.put(
    '/:id',
    verifyToken(manageRoles),
    validate(updateBranchSchema),
    routeHandler(branchController.updateBranch),
);
router.patch(
    '/:id/status',
    verifyToken(manageRoles),
    validate(updateBranchStatusSchema),
    routeHandler(branchController.updateBranchStatus),
);
router.delete(
    '/:id',
    verifyToken(manageRoles),
    validate(branchIdSchema),
    routeHandler(branchController.deleteBranch),
);

export default router;
