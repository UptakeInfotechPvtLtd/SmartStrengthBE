import { Router } from 'express';
import { Roles } from '../config';
import { TestimonialController } from '../controllers';
import {
    optionalVerifyToken,
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
const allRoles = [Roles.Admin, Roles.SubAdmin, Roles.User];
const adminRoles = [Roles.Admin, Roles.SubAdmin];

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
    validate(listTestimonialsSchema),
    routeHandler(testimonialController.listTestimonials),
);
router.patch(
    '/:id/status',
    verifyToken(adminRoles),
    validate(updateTestimonialStatusSchema),
    routeHandler(testimonialController.updateTestimonialStatus),
);
router.delete(
    '/:id',
    verifyToken(adminRoles),
    validate(testimonialIdSchema),
    routeHandler(testimonialController.deleteTestimonial),
);

export default router;
