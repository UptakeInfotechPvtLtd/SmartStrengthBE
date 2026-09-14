import { Router } from 'express';
import { AccessModule, AccessPermission, Roles } from '../config';
import { UserController } from '../controllers';
import {
    requireAnyAccessPermission,
    routeHandler,
    userService,
    verifyToken,
} from '../utils';
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
    requireAnyAccessPermission([
        { moduleKey: AccessModule.UserManagement, permission: AccessPermission.Create },
        { moduleKey: AccessModule.StaffManagement, permission: AccessPermission.Create },
    ]),
    validate(createManagedUserSchema),
    routeHandler(userController.addUser),
);
router.get(
    '/',
    verifyToken(authRoles),
    requireAnyAccessPermission([
        { moduleKey: AccessModule.UserManagement, permission: AccessPermission.Read },
        { moduleKey: AccessModule.StaffManagement, permission: AccessPermission.Read },
    ]),
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
    requireAnyAccessPermission([
        { moduleKey: AccessModule.UserManagement, permission: AccessPermission.Update },
        { moduleKey: AccessModule.StaffManagement, permission: AccessPermission.Update },
    ]),
    validate(createUserMetricSchema),
    routeHandler(userController.addUserMetric),
);
router.get(
    '/:id',
    verifyToken(authRoles),
    requireAnyAccessPermission([
        { moduleKey: AccessModule.UserManagement, permission: AccessPermission.Read },
        { moduleKey: AccessModule.StaffManagement, permission: AccessPermission.Read },
    ]),
    validate(managedUserIdSchema),
    routeHandler(userController.getUserById),
);
router.put(
    '/:id',
    verifyToken(authRoles),
    requireAnyAccessPermission([
        { moduleKey: AccessModule.UserManagement, permission: AccessPermission.Update },
        { moduleKey: AccessModule.StaffManagement, permission: AccessPermission.Update },
    ]),
    validate(updateManagedUserSchema),
    routeHandler(userController.updateUser),
);
router.patch(
    '/:id/status',
    verifyToken(authRoles),
    requireAnyAccessPermission([
        { moduleKey: AccessModule.UserManagement, permission: AccessPermission.Update },
        { moduleKey: AccessModule.StaffManagement, permission: AccessPermission.Update },
    ]),
    validate(updateManagedUserStatusSchema),
    routeHandler(userController.updateUserStatus),
);
router.delete(
    '/:id',
    verifyToken(authRoles),
    requireAnyAccessPermission([
        { moduleKey: AccessModule.UserManagement, permission: AccessPermission.Delete },
        { moduleKey: AccessModule.StaffManagement, permission: AccessPermission.Delete },
    ]),
    validate(managedUserIdSchema),
    routeHandler(userController.deleteUser),
);

export default router;
