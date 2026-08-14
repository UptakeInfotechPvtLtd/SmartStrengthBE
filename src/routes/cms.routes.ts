import { Router } from 'express';
import { Roles } from '../config';
import { CmsController } from '../controllers';
import { cmsService, routeHandler, verifyToken } from '../utils';
import validate from '../utils/middleware/validation.middleware';
import {
    createVideoLibrarySchema,
    listVideoLibrarySchema,
    updateVideoLibrarySchema,
    videoLibraryIdSchema,
} from '../validations';

const router = Router();

const cmsController = new CmsController(cmsService);
const manageRoles = [Roles.Admin, Roles.SubAdmin];
const viewRoles = [Roles.Admin, Roles.SubAdmin, Roles.Trainer, Roles.User];

router.post(
    '/video-library',
    verifyToken(manageRoles),
    validate(createVideoLibrarySchema),
    routeHandler(cmsController.addVideo),
);
router.get(
    '/video-library',
    verifyToken(viewRoles),
    validate(listVideoLibrarySchema),
    routeHandler(cmsController.listVideos),
);
router.get(
    '/video-library/:id',
    verifyToken(viewRoles),
    validate(videoLibraryIdSchema),
    routeHandler(cmsController.viewVideo),
);
router.put(
    '/video-library/:id',
    verifyToken(manageRoles),
    validate(updateVideoLibrarySchema),
    routeHandler(cmsController.updateVideo),
);
router.delete(
    '/video-library/:id',
    verifyToken(manageRoles),
    validate(videoLibraryIdSchema),
    routeHandler(cmsController.deleteVideo),
);

export default router;
