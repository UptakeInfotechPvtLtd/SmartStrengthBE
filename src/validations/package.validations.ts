import { z } from 'zod';
import { validationMessages } from '../lang/api-messages';

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const requiredString = (message: string) => z.string({ message }).trim().min(1, { message });
const optionalString = (message: string) =>
    z
        .union([z.string({ message }).trim(), z.null()])
        .optional()
        .transform((value) => (value === null ? undefined : value));
const statusSchema = z.preprocess(
    (value) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return value;
    },
    z.boolean({ message: validationMessages.common.statusBoolean }).optional(),
);

const packageBodyObjectSchema = z
    .object({
        packageName: requiredString(validationMessages.package.packageNameRequired).max(
            150,
            validationMessages.package.packageNameMaxLength,
        ),
        price: z.coerce
            .number({ message: validationMessages.package.priceNumber })
            .min(0, validationMessages.package.priceMin),
        numberOfSessions: z.coerce
            .number({ message: validationMessages.package.numberOfSessionsNumber })
            .int(validationMessages.package.numberOfSessionsInteger)
            .min(1, validationMessages.package.numberOfSessionsMin),
        validityInDays: z.coerce
            .number({ message: validationMessages.package.validityInDaysNumber })
            .int(validationMessages.package.validityInDaysInteger)
            .min(1, validationMessages.package.validityInDaysMin),
        bestFor: requiredString(validationMessages.package.bestForRequired).max(
            255,
            validationMessages.package.bestForMaxLength,
        ),
        description: optionalString(validationMessages.package.descriptionString).pipe(
            z.string().max(1000, validationMessages.package.descriptionMaxLength).optional(),
        ),
        status: statusSchema,
    })
    .strict();

export const createPackageSchema = {
    body: packageBodyObjectSchema,
};

export const updatePackageSchema = {
    params: z
        .object({
            id: z.string().refine((value) => uuidRegex.test(value), {
                message: validationMessages.package.packageIdInvalid,
            }),
        })
        .strict(),
    body: packageBodyObjectSchema.partial().strict(),
};

export const updatePackageStatusSchema = {
    params: updatePackageSchema.params,
    body: z
        .object({ status: z.boolean({ message: validationMessages.common.statusBoolean }) })
        .strict(),
};

export const packageIdSchema = {
    params: updatePackageSchema.params,
};

export const listPackagesSchema = {
    query: z
        .object({
            page: z.coerce.number().int().positive().optional(),
            pageSize: z.coerce.number().int().positive().max(100).optional(),
            search: optionalString(validationMessages.package.searchString).pipe(
                z.string().max(255, validationMessages.package.searchMaxLength).optional(),
            ),
            status: statusSchema,
            orderBy: z
                .enum([
                    'package_name',
                    'price',
                    'number_of_sessions',
                    'validity_in_days',
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

export type CreatePackageBodyPayload = z.infer<typeof createPackageSchema.body>;
export type UpdatePackageBodyPayload = z.infer<typeof updatePackageSchema.body>;
export type PackageIdParamsPayload = z.infer<typeof packageIdSchema.params>;
export type UpdatePackageStatusBodyPayload = z.infer<typeof updatePackageStatusSchema.body>;
export type FetchPackagesQueryPayload = z.infer<typeof listPackagesSchema.query>;
