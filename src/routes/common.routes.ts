import { Router } from 'express';
import { CommonController } from '../controllers';
import { commonService, routeHandler } from '../utils';

const router = Router();

const commonController = new CommonController(commonService);

router.get('/dropdown', routeHandler(commonController.getDropdown));
router.get('/roles', routeHandler(commonController.getRoleDropdown));

export default router;
