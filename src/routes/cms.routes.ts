import { Router } from 'express';
import { AccessModule, AccessPermission, Roles } from '../config';
import { CmsController } from '../controllers';
import { cmsService, requireAccessPermission, routeHandler, verifyToken } from '../utils';
import validate from '../utils/middleware/validation.middleware';
import {
    createVideoLibrarySchema,
    listVideoLibrarySchema,
    updateVideoLibrarySchema,
    videoLibraryIdSchema,
} from '../validations';

const router = Router();

const cmsController = new CmsController(cmsService);
const authRoles = [Roles.Admin, Roles.SubAdmin, Roles.Trainer, Roles.User];

router.post(
    '/video-library',
    verifyToken(authRoles),
    requireAccessPermission(AccessModule.VideoManagement, AccessPermission.Create),
    validate(createVideoLibrarySchema),
    routeHandler(cmsController.addVideo),
);
router.get(
    '/video-library',
    verifyToken(authRoles),
    requireAccessPermission(AccessModule.VideoManagement, AccessPermission.Read),
    validate(listVideoLibrarySchema),
    routeHandler(cmsController.listVideos),
);
router.get(
    '/video-library/:id',
    verifyToken(authRoles),
    requireAccessPermission(AccessModule.VideoManagement, AccessPermission.Read),
    validate(videoLibraryIdSchema),
    routeHandler(cmsController.viewVideo),
);
router.put(
    '/video-library/:id',
    verifyToken(authRoles),
    requireAccessPermission(AccessModule.VideoManagement, AccessPermission.Update),
    validate(updateVideoLibrarySchema),
    routeHandler(cmsController.updateVideo),
);
router.delete(
    '/video-library/:id',
    verifyToken(authRoles),
    requireAccessPermission(AccessModule.VideoManagement, AccessPermission.Delete),
    validate(videoLibraryIdSchema),
    routeHandler(cmsController.deleteVideo),
);

export default router;
