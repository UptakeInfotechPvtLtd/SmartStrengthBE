import { Router } from 'express';

import authRoutes from './auth.routes';
import branchRoutes from './branch.routes';
import commonRoutes from './common.routes';
import sessionRoutes from './session.routes';
import userRoutes from './user.routes';

const router = Router();
const defaultRoutes: { path: string; route: Router }[] = [
    { path: '/auth', route: authRoutes },
    { path: '/branch', route: branchRoutes },
    { path: '/common', route: commonRoutes },
    { path: '/session', route: sessionRoutes },
    { path: '/user', route: userRoutes },
];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

export default router;
