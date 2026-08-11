import { Router } from 'express';

import authRoutes from './auth.routes';
import branchRoutes from './branch.routes';

const router = Router();
const defaultRoutes: { path: string; route: Router }[] = [
    { path: '/auth', route: authRoutes },
    { path: '/branch', route: branchRoutes },
];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

export default router;
