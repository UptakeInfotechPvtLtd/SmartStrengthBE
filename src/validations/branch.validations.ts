import { z } from 'zod';
import { validationMessages } from '../lang/api-messages';

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
const requiredString = (message: string) => z.string({ message }).trim().min(1, { message });
const optionalString = (message: string) =>
    z
        .union([z.string({ message }).trim(), z.null()])
        .optional()
        .transform((value) => (value === null ? undefined : value));
const statusSchema = z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .optional()
    .transform((value) => {
        if (value === 'true') {
            return true;
        }

        if (value === 'false') {
            return false;
        }

        return value;
    });
const branchOrderBySchema = z
    .enum(['name', 'opening_time', 'closing_time', 'created_at', 'updated_at'])
    .optional()
    .default('created_at');
const orderSchema = z.enum(['ASC', 'DESC', 'asc', 'desc']).optional().default('DESC');
const branchImagesSchema = z
    .array(
        requiredString(validationMessages.branch.branchImageString).max(
            500,
            validationMessages.branch.branchImageMaxLength,
        ),
    )
    .max(10, validationMessages.branch.branchImagesMaxItems)
    .optional();

const branchBodyObjectSchema = z.object({
        name: requiredString(validationMessages.branch.nameRequired).max(
            150,
            validationMessages.branch.nameMaxLength,
        ),
        contactNumber: optionalString(validationMessages.branch.contactNumberString).pipe(
            z
                .string()
                .max(20, validationMessages.branch.contactNumberMaxLength)
                .regex(/^[+0-9()\-\s]+$/, validationMessages.branch.contactNumberInvalid)
                .optional(),
        ),
        mapLink: optionalString(validationMessages.branch.mapLinkString).pipe(
            z
                .string()
                .max(1000, validationMessages.branch.mapLinkMaxLength)
                .url(validationMessages.branch.mapLinkInvalid)
                .optional(),
        ),
        address: requiredString(validationMessages.branch.addressRequired).max(
            500,
            validationMessages.branch.addressMaxLength,
        ),
        openingTime: optionalString(validationMessages.branch.openingTimeString).pipe(
            z
                .string()
                .regex(timeRegex, validationMessages.branch.openingTimeInvalid)
                .optional(),
        ),
        closingTime: optionalString(validationMessages.branch.closingTimeString).pipe(
            z
                .string()
                .regex(timeRegex, validationMessages.branch.closingTimeInvalid)
                .optional(),
        ),
        branchImages: branchImagesSchema,
        status: statusSchema,
    })
    .strict();

const validateBranchTimeRange = (payload: {
    openingTime?: string;
    closingTime?: string;
}) => !payload.openingTime || !payload.closingTime || payload.openingTime < payload.closingTime;

const branchBodySchema = branchBodyObjectSchema
    .refine(
        validateBranchTimeRange,
        {
            message: validationMessages.branch.openingTimeBeforeClosingTime,
            path: ['closingTime'],
        },
    );

export const createBranchSchema = {
    body: branchBodySchema,
};

export const updateBranchSchema = {
    params: z
        .object({
            id: z.string().refine((value) => uuidRegex.test(value), {
                message: validationMessages.branch.branchIdInvalid,
            }),
        })
        .strict(),
    body: branchBodyObjectSchema.partial().refine(validateBranchTimeRange, {
        message: validationMessages.branch.openingTimeBeforeClosingTime,
        path: ['closingTime'],
    }),
};

export const updateBranchStatusSchema = {
    params: updateBranchSchema.params,
    body: z
        .object({
            status: z.boolean({ message: validationMessages.common.statusBoolean }),
        })
        .strict(),
};

export const branchIdSchema = {
    params: updateBranchSchema.params,
};

export const listBranchesSchema = {
    query: z
        .object({
            page: z.coerce.number().int().positive().optional(),
            pageSize: z.coerce.number().int().positive().max(100).optional(),
            search: optionalString(validationMessages.branch.searchString).pipe(
                z.string().max(255, validationMessages.branch.searchMaxLength).optional(),
            ),
            status: statusSchema,
            orderBy: branchOrderBySchema,
            order: orderSchema.transform((value) => value.toUpperCase() as 'ASC' | 'DESC'),
        })
        .strict(),
};

export type CreateBranchBodyPayload = z.infer<typeof createBranchSchema.body>;
export type UpdateBranchBodyPayload = z.infer<typeof updateBranchSchema.body>;
export type BranchIdParamsPayload = z.infer<typeof branchIdSchema.params>;
export type UpdateBranchStatusBodyPayload = z.infer<typeof updateBranchStatusSchema.body>;
export type FetchBranchesQueryPayload = z.infer<typeof listBranchesSchema.query>;
