import { z } from 'zod';
import { PackageType } from '../config';
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

const packageBodyObjectSchema = z
    .object({
        packageType: z.enum(PackageType, { error: validationMessages.package.packageTypeInvalid }),
        price: z.coerce
            .number({ error: validationMessages.package.priceNumber })
            .min(0, { error: validationMessages.package.priceMin }),
        numberOfSessions: z.coerce
            .number({ error: validationMessages.package.numberOfSessionsNumber })
            .int({ error: validationMessages.package.numberOfSessionsInteger })
            .min(1, { error: validationMessages.package.numberOfSessionsMin }),
        validDays: z.coerce
            .number({ error: validationMessages.package.validityInDaysNumber })
            .int({ error: validationMessages.package.validityInDaysInteger })
            .min(1, { error: validationMessages.package.validityInDaysMin }),
    })
    .strict();

export const createPackageSchema = {
    body: packageBodyObjectSchema,
};

export const updatePackageSchema = {
    params: z
        .object({
            id: z.string().refine((value) => uuidRegex.test(value), {
                error: validationMessages.package.packageIdInvalid,
            }),
        })
        .strict(),
    body: packageBodyObjectSchema.partial().strict(),
};

export const updatePackageStatusSchema = {
    params: updatePackageSchema.params,
    body: z
        .object({ status: z.boolean({ error: validationMessages.common.statusBoolean }) })
        .strict(),
};

export const packageIdSchema = {
    params: updatePackageSchema.params,
};

export const purchasePackageSchema = {
    body: z
        .object({
            packageId: z.string().refine((value) => uuidRegex.test(value), {
                error: validationMessages.package.packageIdInvalid,
            }),
        })
        .strict(),
};

export const listPackagesSchema = {
    query: z
        .object({
            page: z.coerce.number().int().positive().optional(),
            pageSize: z.coerce.number().int().positive().max(100).optional(),
            search: optionalString(validationMessages.package.searchString).pipe(
                z
                    .string()
                    .max(255, { error: validationMessages.package.searchMaxLength })
                    .optional(),
            ),
            packageType: z
                .enum(PackageType, { error: validationMessages.package.packageTypeInvalid })
                .optional(),
            status: statusSchema,
            orderBy: z
                .enum([
                    'package_type',
                    'price',
                    'number_of_sessions',
                    'valid_days',
                    'created_at',
                    'updated_at',
                ])
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

export const listPackagePurchasesSchema = {
    query: z
        .object({
            page: z.coerce.number().int().positive().optional(),
            pageSize: z.coerce.number().int().positive().max(100).optional(),
            search: optionalString(validationMessages.package.searchString).pipe(
                z
                    .string()
                    .max(255, { error: validationMessages.package.searchMaxLength })
                    .optional(),
            ),
            userId: optionalString(validationMessages.users.userIdInvalid).pipe(
                z
                    .string()
                    .refine((value) => uuidRegex.test(value), {
                        error: validationMessages.users.userIdInvalid,
                    })
                    .optional(),
            ),
            packageId: optionalString(validationMessages.package.packageIdInvalid).pipe(
                z
                    .string()
                    .refine((value) => uuidRegex.test(value), {
                        error: validationMessages.package.packageIdInvalid,
                    })
                    .optional(),
            ),
            orderBy: z
                .enum([
                    'package_type',
                    'price',
                    'number_of_sessions',
                    'valid_days',
                    'purchased_at',
                    'expired_at',
                    'created_at',
                    'updated_at',
                ])
                .optional()
                .default('purchased_at'),
            order: z
                .enum(['ASC', 'DESC', 'asc', 'desc'])
                .optional()
                .default('DESC')
                .transform((value) => value.toUpperCase() as 'ASC' | 'DESC'),
        })
        .strict(),
};

export type CreatePackageBodyPayload = z.infer<typeof createPackageSchema.body>;
export type UpdatePackageBodyPayload = z.infer<typeof updatePackageSchema.body>;
export type PackageIdParamsPayload = z.infer<typeof packageIdSchema.params>;
export type PurchasePackageBodyPayload = z.infer<typeof purchasePackageSchema.body>;
export type UpdatePackageStatusBodyPayload = z.infer<typeof updatePackageStatusSchema.body>;
export type FetchPackagesQueryPayload = z.infer<typeof listPackagesSchema.query>;
export type FetchPackagePurchasesQueryPayload = z.infer<typeof listPackagePurchasesSchema.query>;
