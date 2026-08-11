import { Request, Response, NextFunction } from 'express';

export const routeHandler =
    (controllerFn: Function) => async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await controllerFn(req, res, next);

            if (result !== undefined) {
                return res.json(result);
            }

            next();
        } catch (err) {
            next(err);
        }
    };
