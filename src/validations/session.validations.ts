import { z } from 'zod';
import { validationMessages } from '../lang/api-messages';

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const requiredString = (message: string) => z.string({ message }).trim().min(1, { message });
const optionalString = (message: string) =>
    z
        .union([z.string({ message }).trim(), z.null()])
        .optional()
        .transform((value) => (value === null ? undefined : value));
const statusSchema = z.preprocess((value) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
}, z.boolean({ message: validationMessages.common.statusBoolean }).optional());
const branchIdsSchema = z
    .array(
        z.string().refine((value) => uuidRegex.test(value), {
            message: validationMessages.session.branchIdInvalid,
        }),
    )
    .min(1, validationMessages.session.branchIdsRequired)
    .refine((ids) => new Set(ids).size === ids.length, {
        message: validationMessages.session.branchIdsUnique,
    });

const sessionBodyObjectSchema = z
    .object({
        sessionName: requiredString(validationMessages.session.sessionNameRequired).max(
            150,
            validationMessages.session.sessionNameMaxLength,
        ),
        price: z.coerce
            .number({ message: validationMessages.session.priceNumber })
            .min(0, validationMessages.session.priceMin),
        duration: z.coerce
            .number({ message: validationMessages.session.durationNumber })
            .int(validationMessages.session.durationInteger)
            .min(1, validationMessages.session.durationMin),
        description: optionalString(validationMessages.session.descriptionString).pipe(
            z.string().max(1000, validationMessages.session.descriptionMaxLength).optional(),
        ),
        branchIds: branchIdsSchema,
        status: statusSchema,
    })
    .strict();

export const createSessionSchema = {
    body: sessionBodyObjectSchema,
};

export const updateSessionSchema = {
    params: z
        .object({
            id: z.string().refine((value) => uuidRegex.test(value), {
                message: validationMessages.session.sessionIdInvalid,
            }),
        })
        .strict(),
    body: sessionBodyObjectSchema.partial().strict(),
};

export const updateSessionStatusSchema = {
    params: updateSessionSchema.params,
    body: z
        .object({ status: z.boolean({ message: validationMessages.common.statusBoolean }) })
        .strict(),
};

export const sessionIdSchema = {
    params: updateSessionSchema.params,
};

export const listSessionsSchema = {
    query: z
        .object({
            page: z.coerce.number().int().positive().optional(),
            pageSize: z.coerce.number().int().positive().max(100).optional(),
            search: optionalString(validationMessages.session.searchString).pipe(
                z.string().max(255, validationMessages.session.searchMaxLength).optional(),
            ),
            branchId: z
                .string()
                .refine((value) => uuidRegex.test(value), {
                    message: validationMessages.session.branchIdInvalid,
                })
                .optional(),
            status: statusSchema,
            orderBy: z
                .enum(['session_name', 'price', 'duration', 'created_at', 'updated_at'])
                .optional()
                .default('created_at'),
            order: z
                .enum(['ASC', 'DESC', 'asc', 'desc'])
                .optional()
                .default('DESC')
                .transform((value) => value.toUpperCase() as 'ASC' | 'DESC'),
        })
        .strict(),
};

export type CreateSessionBodyPayload = z.infer<typeof createSessionSchema.body>;
export type UpdateSessionBodyPayload = z.infer<typeof updateSessionSchema.body>;
export type SessionIdParamsPayload = z.infer<typeof sessionIdSchema.params>;
export type UpdateSessionStatusBodyPayload = z.infer<typeof updateSessionStatusSchema.body>;
export type FetchSessionsQueryPayload = z.infer<typeof listSessionsSchema.query>;
