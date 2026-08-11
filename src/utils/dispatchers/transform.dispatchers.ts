import { Request, Response, NextFunction } from 'express';

export interface ResponseDTO<T> {
    data: T;
    message: string;
    success: boolean;
}

export function transformResponse(_req: Request, res: Response, next: NextFunction) {
    const oldJson = res.json;

    res.json = function (data: any) {
        // If already in correct format, don't wrap again
        if (
            data &&
            typeof data === 'object' &&
            'success' in data &&
            'message' in data &&
            'data' in data
        ) {
            return oldJson.call(this, data);
        }

        // If error format from service (success:false)
        if (data && data.success === false) {
            return oldJson.call(this, data);
        }

        // Normal success response
        const response: ResponseDTO<any> = {
            success: true,
            message: data?.message || '',
            data: data?.data ?? data,
        };

        return oldJson.call(this, response);
    };

    next();
}
