import { Router } from 'express';
import { Roles } from '../config';
import { EnquiryController } from '../controllers';
import { enquiryService, routeHandler, verifyToken } from '../utils';
import validate from '../utils/middleware/validation.middleware';
import { createEnquirySchema, enquiryIdSchema, listEnquiriesSchema } from '../validations';

const router = Router();

const enquiryController = new EnquiryController(enquiryService);
const masterAdminRoles = [Roles.Admin];

router.post('/', validate(createEnquirySchema), routeHandler(enquiryController.createEnquiry));
router.get(
    '/',
    verifyToken(masterAdminRoles),
    validate(listEnquiriesSchema),
    routeHandler(enquiryController.listEnquiries),
);
router.get(
    '/:id',
    verifyToken(masterAdminRoles),
    validate(enquiryIdSchema),
    routeHandler(enquiryController.getEnquiryById),
);

export default router;
