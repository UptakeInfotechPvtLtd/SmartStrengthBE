import { z } from 'zod';
import { BranchOrderBy, BranchStatus, SortOrder } from '../config';
import { validationMessages } from '../lang/api-messages';

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const timeRegex = /^(0?[1-9]|1[0-2]):([0-5]\d)\s?(AM|PM)$/i;
const requiredString = (message: string) =>
    z.string({ error: message }).trim().min(1, { error: message });
const optionalString = (message: string) =>
    z
        .union([z.string({ error: message }).trim(), z.null()])
        .optional()
        .transform((value) => (value === null ? undefined : value));
const statusSchema = z.enum(BranchStatus, { error: validationMessages.branch.statusInvalid });
const statusFilterSchema = z
    .preprocess((value) => {
        if (typeof value !== 'string') {
            return value;
        }

        const normalizedStatus = value.toLowerCase();
        if (normalizedStatus === BranchStatus.Active.toLowerCase()) {
            return BranchStatus.Active;
        }
        if (normalizedStatus === BranchStatus.Inactive.toLowerCase()) {
            return BranchStatus.Inactive;
        }

        return value;
    }, statusSchema)
    .optional();
const branchOrderBySchema = z
    .enum(BranchOrderBy)
    .optional()
    .default(BranchOrderBy.CreatedAt)
    .transform((value) => {
        const orderByMap: Record<BranchOrderBy, string> = {
            [BranchOrderBy.BranchName]: 'branch_name',
            [BranchOrderBy.OpeningTime]: 'opening_time',
            [BranchOrderBy.ClosingTime]: 'closing_time',
            [BranchOrderBy.CreatedAt]: 'created_at',
            [BranchOrderBy.UpdatedAt]: 'updated_at',
        };

        return orderByMap[value];
    });
const orderSchema = z.enum(SortOrder).optional().default(SortOrder.DESC);

const formatTimeForDb = (value: string): string => {
    const [, hourValue, minuteValue, suffix] = value.match(timeRegex)!;
    const hour = Number(hourValue);
    const normalizedHour =
        suffix.toUpperCase() === 'PM' ? (hour === 12 ? 12 : hour + 12) : hour === 12 ? 0 : hour;

    return `${String(normalizedHour).padStart(2, '0')}:${minuteValue}`;
};

const timeSchema = (message: string) =>
    requiredString(message)
        .regex(timeRegex, { error: message })
        .transform((value) => formatTimeForDb(value));

const branchBodyObjectSchema = z
    .object({
        branchName: requiredString(validationMessages.branch.branchNameRequired).max(150, {
            error: validationMessages.branch.branchNameMaxLength,
        }),
        address: requiredString(validationMessages.branch.addressRequired).max(500, {
            error: validationMessages.branch.addressMaxLength,
        }),
        mapUrl: optionalString(validationMessages.branch.mapUrlString).pipe(
            z
                .url({ error: validationMessages.branch.mapUrlInvalid })
                .max(1000, { error: validationMessages.branch.mapUrlMaxLength })
                .optional(),
        ),
        openingTime: timeSchema(validationMessages.branch.openingTimeInvalid).optional(),
        closingTime: timeSchema(validationMessages.branch.closingTimeInvalid).optional(),
    })
    .strict();

const validateBranchTimeRange = (payload: { openingTime?: string; closingTime?: string }) =>
    !payload.openingTime || !payload.closingTime || payload.openingTime < payload.closingTime;

const branchBodySchema = branchBodyObjectSchema.refine(validateBranchTimeRange, {
    error: validationMessages.branch.openingTimeBeforeClosingTime,
    path: ['closingTime'],
});

export const createBranchSchema = {
    body: branchBodySchema,
};

export const updateBranchSchema = {
    params: z
        .object({
            id: z.string().refine((value) => uuidRegex.test(value), {
                error: validationMessages.branch.branchIdInvalid,
            }),
        })
        .strict(),
    body: branchBodyObjectSchema.partial().refine(validateBranchTimeRange, {
        error: validationMessages.branch.openingTimeBeforeClosingTime,
        path: ['closingTime'],
    }),
};

export const updateBranchStatusSchema = {
    params: updateBranchSchema.params,
    body: z
        .object({
            status: statusSchema,
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
                z
                    .string()
                    .max(255, { error: validationMessages.branch.searchMaxLength })
                    .optional(),
            ),
            status: statusFilterSchema,
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
