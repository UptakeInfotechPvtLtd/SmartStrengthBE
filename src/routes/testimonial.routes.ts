import { Router } from 'express';
import { AccessModule, AccessPermission, Roles } from '../config';
import { TestimonialController } from '../controllers';
import {
    optionalVerifyToken,
    requireAccessPermission,
    routeHandler,
    testimonialService,
    verifyToken,
} from '../utils';
import validate from '../utils/middleware/validation.middleware';
import {
    createTestimonialSchema,
    listTestimonialsSchema,
    testimonialIdSchema,
    updateTestimonialStatusSchema,
} from '../validations';

const router = Router();

const testimonialController = new TestimonialController(testimonialService);
const allRoles = [Roles.Admin, Roles.SubAdmin, Roles.Trainer, Roles.User];
const authRoles = [Roles.Admin, Roles.SubAdmin, Roles.Trainer];

router.post(
    '/',
    verifyToken([Roles.User]),
    validate(createTestimonialSchema),
    routeHandler(testimonialController.createTestimonial),
);
router.get(
    '/public',
    optionalVerifyToken(allRoles),
    validate(listTestimonialsSchema),
    routeHandler(testimonialController.listApprovedTestimonials),
);
router.get(
    '/',
    verifyToken(allRoles),
    requireAccessPermission(AccessModule.TestimonialManagement, AccessPermission.Read),
    validate(listTestimonialsSchema),
    routeHandler(testimonialController.listTestimonials),
);
router.patch(
    '/:id/status',
    verifyToken(authRoles),
    requireAccessPermission(AccessModule.TestimonialManagement, AccessPermission.Update),
    validate(updateTestimonialStatusSchema),
    routeHandler(testimonialController.updateTestimonialStatus),
);
router.delete(
    '/:id',
    verifyToken(authRoles),
    requireAccessPermission(AccessModule.TestimonialManagement, AccessPermission.Delete),
    validate(testimonialIdSchema),
    routeHandler(testimonialController.deleteTestimonial),
);

export default router;
