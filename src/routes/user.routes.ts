import { Router } from 'express';
import { AccessModule, AccessPermission, Roles } from '../config';
import { UserController } from '../controllers';
import { requireAccessPermission, routeHandler, userService, verifyToken } from '../utils';
import validate from '../utils/middleware/validation.middleware';
import {
    createManagedUserSchema,
    createUserMetricSchema,
    listLoggedInUserPerformanceMetricsSchema,
    listManagedUsersSchema,
    managedUserIdSchema,
    updateProfileSchema,
    updateManagedUserSchema,
    updateManagedUserStatusSchema,
} from '../validations';

const router = Router();

const userController = new UserController(userService);
const authRoles = [Roles.Admin, Roles.SubAdmin, Roles.Trainer, Roles.User];

router.post(
    '/',
    verifyToken(authRoles),
    requireAccessPermission(AccessModule.UserManagement, AccessPermission.Create),
    validate(createManagedUserSchema),
    routeHandler(userController.addUser),
);
router.get(
    '/',
    verifyToken(authRoles),
    requireAccessPermission(AccessModule.UserManagement, AccessPermission.Read),
    validate(listManagedUsersSchema),
    routeHandler(userController.listUsers),
);
router.get('/profile', verifyToken(authRoles), routeHandler(userController.viewProfile));
router.get(
    '/profile/performance-metrics',
    verifyToken([Roles.User]),
    validate(listLoggedInUserPerformanceMetricsSchema),
    routeHandler(userController.listLoggedInUserPerformanceMetrics),
);
router.put(
    '/profile',
    verifyToken(authRoles),
    validate(updateProfileSchema),
    routeHandler(userController.updateProfile),
);
router.post(
    '/:id/metrics',
    verifyToken([Roles.Admin, Roles.SubAdmin]),
    requireAccessPermission(AccessModule.UserManagement, AccessPermission.Update),
    validate(createUserMetricSchema),
    routeHandler(userController.addUserMetric),
);
router.get(
    '/:id',
    verifyToken(authRoles),
    requireAccessPermission(AccessModule.UserManagement, AccessPermission.Read),
    validate(managedUserIdSchema),
    routeHandler(userController.getUserById),
);
router.put(
    '/:id',
    verifyToken(authRoles),
    requireAccessPermission(AccessModule.UserManagement, AccessPermission.Update),
    validate(updateManagedUserSchema),
    routeHandler(userController.updateUser),
);
router.patch(
    '/:id/status',
    verifyToken(authRoles),
    requireAccessPermission(AccessModule.UserManagement, AccessPermission.Update),
    validate(updateManagedUserStatusSchema),
    routeHandler(userController.updateUserStatus),
);
router.delete(
    '/:id',
    verifyToken(authRoles),
    requireAccessPermission(AccessModule.UserManagement, AccessPermission.Delete),
    validate(managedUserIdSchema),
    routeHandler(userController.deleteUser),
);

export default router;
