import { NextFunction, Request, Response } from 'express';

export const APP_TIMEZONE = 'Asia/Kolkata';

/** Format an instant for API output as ISO-8601 in IST (+05:30). */
export const toISTISOString = (date: Date): string => {
    const istOffsetMilliseconds = 5.5 * 60 * 60 * 1000;
    return new Date(date.getTime() + istOffsetMilliseconds)
        .toISOString()
        .replace('Z', '+05:30');
};

const transformDatesToIST = (value: any): any => {
    if (value instanceof Date) {
        return toISTISOString(value);
    }

    if (Array.isArray(value)) {
        return value.map(transformDatesToIST);
    }

    if (value && typeof value === 'object' && !Buffer.isBuffer(value)) {
        const transformed: Record<string, any> = {};
        for (const [key, item] of Object.entries(value)) {
            transformed[key] = transformDatesToIST(item);
        }
        return transformed;
    }

    return value;
};

/** Apply IST serialization uniformly to successful and error JSON responses. */
export const istResponseTimezone = (_req: Request, res: Response, next: NextFunction): void => {
    const originalJson = res.json.bind(res);
    res.json = ((body: any) => originalJson(transformDatesToIST(body))) as Response['json'];
    next();
};
