import { Request, Response, NextFunction } from 'express';
import { BaseResponseDto } from '../../dto';

export const responseHandler = (_req: Request, res: Response, next: NextFunction) => {
    const oldJson = res.json;

    res.json = function (data: any) {
        if (data && data instanceof BaseResponseDto) {
            return oldJson.call(this, data);
        }
        return oldJson.call(this, data);
    };

    next();
};
