import { Router } from 'express';
import { CommonController } from '../controllers';
import { commonService, routeHandler, uploadSingleFile } from '../utils';

const router = Router();

const commonController = new CommonController(commonService);

router.get('/dropdown', routeHandler(commonController.getDropdown));
router.get('/roles', routeHandler(commonController.getRoleDropdown));
router.post('/upload', uploadSingleFile, routeHandler(commonController.uploadFile));

export default router;
