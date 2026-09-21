import { Router } from 'express';
import { AccessModule, AccessPermission, Roles } from '../config';
import { BookingController } from '../controllers';
import { bookingService, requireAccessPermission, routeHandler, verifyToken } from '../utils';
import validate from '../utils/middleware/validation.middleware';
import {
    bookingIdSchema,
    createBookingSchema,
    listBookingsSchema,
    rescheduleBookingSchema,
} from '../validations';

const router = Router();

const bookingController = new BookingController(bookingService);
const viewRoles = [Roles.Admin, Roles.SubAdmin, Roles.Trainer];
const cancelRoles = [Roles.Admin, Roles.SubAdmin, Roles.Trainer, Roles.User];

const rescheduleRoles = [Roles.Admin, Roles.SubAdmin, Roles.Trainer, Roles.User];

router.post(
    '/',
    verifyToken([Roles.User]),
    validate(createBookingSchema),
    routeHandler(bookingController.createBooking),
);
router.get(
    '/mybooking',
    verifyToken([Roles.User]),
    validate(listBookingsSchema),
    routeHandler(bookingController.listMyBookings),
);
router.patch(
    '/:id/cancel',
    verifyToken(cancelRoles),
    requireAccessPermission(AccessModule.BookingManagement, AccessPermission.Update),
    validate(bookingIdSchema),
    routeHandler(bookingController.cancelBooking),
);
router.patch(
    '/:id/reschedule',
    verifyToken(rescheduleRoles),
    requireAccessPermission(AccessModule.BookingManagement, AccessPermission.Update),
    validate(rescheduleBookingSchema),
    routeHandler(bookingController.rescheduleBooking),
);
router.get(
    '/',
    verifyToken(viewRoles),
    requireAccessPermission(AccessModule.BookingManagement, AccessPermission.Read),
    validate(listBookingsSchema),
    routeHandler(bookingController.listBookings),
);

export default router;
