import { Router } from 'express';

import authRoutes from './auth.routes';
import branchRoutes from './branch.routes';
import commonRoutes from './common.routes';
import sessionRoutes from './session.routes';
import packageRoutes from './package.routes';
import userRoutes from './user.routes';
import cmsRoutes from './cms.routes';
import accessControlRoutes from './access-control.routes';
import availabilityManagementRoutes from './availability-management.routes';
import slotRoutes from './slot.routes';
import rosterRoutes from './roster.routes';
import enquiryRoutes from './enquiry.routes';

const router = Router();
const defaultRoutes: { path: string; route: Router }[] = [
    { path: '/auth', route: authRoutes },
    { path: '/branch', route: branchRoutes },
    { path: '/common', route: commonRoutes },
    { path: '/session', route: sessionRoutes },
    { path: '/package', route: packageRoutes },
    { path: '/user', route: userRoutes },
    { path: '/cms', route: cmsRoutes },
    { path: '/access-control', route: accessControlRoutes },
    { path: '/availability-management', route: availabilityManagementRoutes },
    { path: '/slot', route: slotRoutes },
    { path: '/roster', route: rosterRoutes },
    { path: '/enquiry', route: enquiryRoutes },
];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

export default router;
