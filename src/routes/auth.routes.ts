import { Router } from 'express';
import { AuthController } from '../controllers';
import { routeHandler, authService, verifyToken } from '../utils';
import validate from '../utils/middleware/validation.middleware';
import {
    adminChangePasswordSchema,
    changePasswordSchema,
    forgotPasswordSchema,
    loginSchema,
    logoutSchema,
    refreshTokenSchema,
    resentOtpSchema,
    resetPasswordSchema,
    signUpSchema,
    verifyOtpSchema,
} from '../validations';
import { Roles } from '../config';

const router = Router();

const authController = new AuthController(authService);

router.get('/test', routeHandler(authController.test));
router.post('/signup', validate(signUpSchema), routeHandler(authController.signUp));
router.post('/login', validate(loginSchema), routeHandler(authController.login));   
router.post(
    '/forgot-password',
    validate(forgotPasswordSchema),
    routeHandler(authController.forgotPassword),
);
router.post('/verify-otp', validate(verifyOtpSchema), routeHandler(authController.verifyOtp));
router.post('/resend-otp', validate(resentOtpSchema), routeHandler(authController.resendOtp));
router.post(
    '/reset-password',
    validate(resetPasswordSchema),
    routeHandler(authController.resetPassword),
);
router.post(
    '/refresh-token',
    validate(refreshTokenSchema),
    routeHandler(authController.refreshToken),
);
router.post(
    '/logout',
    verifyToken([Roles.User, Roles.Admin, Roles.SubAdmin, Roles.Trainer]),
    validate(logoutSchema),
    routeHandler(authController.logout),
);
router.post(
    '/change-password',
    verifyToken([Roles.User, Roles.Admin, Roles.SubAdmin, Roles.Trainer]),
    validate(changePasswordSchema),
    routeHandler(authController.changePassword),
);
router.post(
    '/admin/users/:id/change-password',
    verifyToken([Roles.Admin]),
    validate(adminChangePasswordSchema),
    routeHandler(authController.adminChangePassword),
);

export default router;
