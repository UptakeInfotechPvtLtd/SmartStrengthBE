import { Router } from 'express';
import { Roles } from '../config';
import { UserController } from '../controllers';
import { routeHandler, userService, verifyToken } from '../utils';
import validate from '../utils/middleware/validation.middleware';
import {
    createManagedUserSchema,
    listManagedUsersSchema,
    managedUserIdSchema,
    updateProfileSchema,
    updateManagedUserSchema,
    updateManagedUserStatusSchema,
} from '../validations';

const router = Router();

const userController = new UserController(userService);
const manageRoles = [Roles.Admin, Roles.SubAdmin];
const authRoles = [Roles.Admin, Roles.SubAdmin, Roles.Trainer, Roles.User];

router.post(
    '/',
    verifyToken(manageRoles),
    validate(createManagedUserSchema),
    routeHandler(userController.addUser),
);
router.get(
    '/',
    verifyToken(manageRoles),
    validate(listManagedUsersSchema),
    routeHandler(userController.listUsers),
);
router.get('/profile', verifyToken(authRoles), routeHandler(userController.viewProfile));
router.put(
    '/profile',
    verifyToken(authRoles),
    validate(updateProfileSchema),
    routeHandler(userController.updateProfile),
);
router.get(
    '/:id',
    verifyToken(manageRoles),
    validate(managedUserIdSchema),
    routeHandler(userController.getUserById),
);
router.put(
    '/:id',
    verifyToken(manageRoles),
    validate(updateManagedUserSchema),
    routeHandler(userController.updateUser),
);
router.patch(
    '/:id/status',
    verifyToken(manageRoles),
    validate(updateManagedUserStatusSchema),
    routeHandler(userController.updateUserStatus),
);

export default router;
