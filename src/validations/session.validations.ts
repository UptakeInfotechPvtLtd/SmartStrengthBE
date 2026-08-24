import { z } from 'zod';
import { validationMessages } from '../lang/api-messages';

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const requiredString = (message: string) =>
    z.string({ error: message }).trim().min(1, { error: message });
const optionalString = (message: string) =>
    z
        .union([z.string({ error: message }).trim(), z.null()])
        .optional()
        .transform((value) => (value === null ? undefined : value));
const statusSchema = z.preprocess(
    (value) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return value;
    },
    z.boolean({ error: validationMessages.common.statusBoolean }).optional(),
);
const isSachinStatusSchema = z
    .boolean({ error: validationMessages.session.isSachinStatusBoolean })
    .optional();
const isSachinStatusQuerySchema = z.preprocess(
    (value) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return value;
    },
    z.boolean({ error: validationMessages.session.isSachinStatusBoolean }).optional(),
);
const branchIdsSchema = z
    .array(
        z.string().refine((value) => uuidRegex.test(value), {
            error: validationMessages.session.branchIdInvalid,
        }),
    )
    .min(1, { error: validationMessages.session.branchIdsRequired })
    .refine((ids) => new Set(ids).size === ids.length, {
        error: validationMessages.session.branchIdsUnique,
    });

const sessionBodyObjectSchema = z
    .object({
        sessionName: requiredString(validationMessages.session.sessionNameRequired).max(150, {
            error: validationMessages.session.sessionNameMaxLength,
        }),
        price: z.coerce
            .number({ error: validationMessages.session.priceNumber })
            .min(0, { error: validationMessages.session.priceMin }),
        description: optionalString(validationMessages.session.descriptionString).pipe(
            z
                .string()
                .max(1000, { error: validationMessages.session.descriptionMaxLength })
                .optional(),
        ),
        isSachinStatus: isSachinStatusSchema.default(false),
        branchIds: branchIdsSchema,
    })
    .strict();

const updateSessionBodyObjectSchema = sessionBodyObjectSchema
    .omit({ isSachinStatus: true })
    .extend({ isSachinStatus: isSachinStatusSchema })
    .partial()
    .strict();

export const createSessionSchema = {
    body: sessionBodyObjectSchema,
};

export const updateSessionSchema = {
    params: z
        .object({
            id: z.string().refine((value) => uuidRegex.test(value), {
                error: validationMessages.session.sessionIdInvalid,
            }),
        })
        .strict(),
    body: updateSessionBodyObjectSchema,
};

export const updateSessionStatusSchema = {
    params: updateSessionSchema.params,
    body: z
        .object({ status: z.boolean({ error: validationMessages.common.statusBoolean }) })
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
                z
                    .string()
                    .max(255, { error: validationMessages.session.searchMaxLength })
                    .optional(),
            ),
            branchId: z
                .string()
                .refine((value) => uuidRegex.test(value), {
                    error: validationMessages.session.branchIdInvalid,
                })
                .optional(),
            status: statusSchema,
            isSachinStatus: isSachinStatusQuerySchema,
            orderBy: z
                .enum(['session_name', 'price', 'is_sachin_status', 'created_at', 'updated_at'])
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
