import { Router } from 'express';
import { Roles } from '../config/enum';
import { SlotController } from '../controllers';
import { routeHandler, slotService, verifyToken } from '../utils';
import validate from '../utils/middleware/validation.middleware';
import { availableSlotsSchema } from '../validations';

const router = Router();

const slotController = new SlotController(slotService);
const authRoles = [Roles.Admin, Roles.SubAdmin, Roles.Trainer, Roles.User];

router.get(
    '/available',
    verifyToken(authRoles),
    validate(availableSlotsSchema),
    routeHandler(slotController.getAvailableSlots),
);

export default router;
