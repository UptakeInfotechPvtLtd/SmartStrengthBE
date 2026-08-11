import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny } from 'zod';
import { BadRequestException } from '../error';
import { messages } from '../../lang/api-messages';

type Schema = {
    body?: ZodTypeAny;
    params?: ZodTypeAny;
    query?: ZodTypeAny;
    file?: ZodTypeAny;
};

// 👇 extend Express Request
interface CustomRequest extends Request {
    body: any;
    params: any;
    query: any;
    file?: Express.Multer.File;
}

const validate =
    (schema: Schema) => async (req: CustomRequest, _res: Response, next: NextFunction) => {
        try {
            if (schema.body) {
                req.body = schema.body.parse(req.body);
            }

            if (schema.params) {
                const parsedParams = schema.params.parse(req.params);
                Object.assign(req.params, parsedParams);
            }

            if (schema.query) {
                const parsedQuery = schema.query.parse(req.query);
                Object.assign(req.query, parsedQuery);
            }

            if (schema.file) {
                console.log('object', req.file);
                if (!req.file) {
                    throw new BadRequestException(messages.fileRequired);
                }
                schema.file.parse(req.file);
            }

            next();
        } catch (err) {
            next(err);
        }
    };

export default validate;
