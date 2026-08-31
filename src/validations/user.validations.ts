import { z } from 'zod';
import { Gender, UserStatus, UserType } from '../config';
import { validationMessages } from '../lang/api-messages';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const dateRegex = /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
const requiredString = (message: string) =>
    z.string({ error: message }).trim().min(1, { error: message });
const optionalString = (message: string) =>
    z
        .union([z.string({ error: message }).trim(), z.null()])
        .optional()
        .transform((value) => (value === null ? undefined : value));
const removableUrlString = (message: string) =>
    z
        .union([z.string({ error: message }).trim(), z.null()])
        .optional()
        .pipe(
            z
                .string()
                .max(500, { error: validationMessages.user.profileImageUrlMaxLength })
                .nullable()
                .optional(),
        );
const optionalPasswordSchema = z
    .union([z.string({ error: validationMessages.user.passwordString }).trim(), z.null()])
    .optional()
    .transform((value) => {
        if (value === null || value === '') return undefined;
        return value;
    })
    .pipe(
        z
            .string()
            .min(8, { error: validationMessages.signUp.passwordMinLength })
            .max(400, { error: validationMessages.signUp.passwordMaxLength })
            .optional(),
    );
const statusSchema = z.enum(UserStatus, { error: validationMessages.user.statusInvalid });
const branchIdsSchema = z
    .array(
        z.string().refine((value) => uuidRegex.test(value), {
            error: validationMessages.user.branchIdInvalid,
        }),
    )
    .min(1, { error: validationMessages.user.branchIdsRequired })
    .refine((ids) => new Set(ids).size === ids.length, {
        error: validationMessages.user.branchIdsUnique,
    });
const branchIdsQuerySchema = z
    .preprocess((value) => {
        if (Array.isArray(value)) return value;
        if (typeof value === 'string') return value.split(',').map((item) => item.trim());
        return value;
    }, branchIdsSchema)
    .optional();
const performanceMetricValueSchema = z.union([
    z.string().trim().max(50, { error: validationMessages.signUp.performanceMetricMaxLength }),
    z.number(),
    z.boolean(),
    z.null(),
]);
const performanceMetricsSchema = z.record(
    requiredString(validationMessages.signUp.performanceMetricLabelRequired),
    performanceMetricValueSchema,
);
const parseMetricDate = (value: string): string | null => {
    const [day, month, year] = value.split('/').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));

    if (
        date.getUTCFullYear() !== year ||
        date.getUTCMonth() !== month - 1 ||
        date.getUTCDate() !== day
    ) {
        return null;
    }

    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};
const performanceMetricDateSchema = requiredString(
    validationMessages.signUp.performanceMetricDateRequired,
)
    .regex(dateRegex, { error: validationMessages.signUp.performanceMetricDateInvalid })
    .refine((value) => parseMetricDate(value) !== null, {
        error: validationMessages.signUp.performanceMetricDateInvalid,
    })
    .transform((value) => parseMetricDate(value)!);
const performanceMetricEntrySchema = z
    .object({
        date: performanceMetricDateSchema,
        metrics: performanceMetricsSchema,
    })
    .strict();
const userMetricBodySchema = z
    .object({
        metricName: requiredString(validationMessages.user.metricNameRequired).max(100, {
            error: validationMessages.user.metricNameMaxLength,
        }),
        resultValue: requiredString(validationMessages.user.resultValueRequired).max(100, {
            error: validationMessages.user.resultValueMaxLength,
        }),
        date: performanceMetricDateSchema,
    })
    .strict();

export const createManagedUserSchema = {
    body: z
        .object({
            roleId: z.string().refine((value) => uuidRegex.test(value), {
                error: validationMessages.user.roleIdInvalid,
            }),
            fullName: optionalString(validationMessages.user.fullNameRequired).pipe(
                z
                    .string()
                    .max(200, { error: validationMessages.user.fullNameMaxLength })
                    .optional(),
            ),
            phoneNumber: optionalString(validationMessages.user.phoneNumberString).pipe(
                z
                    .string()
                    .max(20, { error: validationMessages.user.phoneNumberMaxLength })
                    .regex(/^[+0-9()\-\s]+$/, { error: validationMessages.user.phoneNumberInvalid })
                    .optional(),
            ),
            email: optionalString(validationMessages.user.emailRequired)
                .pipe(
                    z
                        .string()
                        .max(255, { error: validationMessages.user.emailMaxLength })
                        .refine((value) => emailRegex.test(value), {
                            error: validationMessages.user.emailInvalid,
                        })
                        .optional(),
                )
                .transform((value) => value?.toLowerCase()),
            password: optionalString(validationMessages.user.passwordRequired).pipe(
                z
                    .string()
                    .min(8, { error: validationMessages.signUp.passwordMinLength })
                    .max(400, { error: validationMessages.signUp.passwordMaxLength })
                    .optional(),
            ),
            confirmPassword: optionalString(validationMessages.signUp.confirmPasswordRequired),
            branchIds: branchIdsSchema.optional(),
            dob: optionalString(validationMessages.user.dobRequired).optional(),
            gender: z.enum(Gender, { error: validationMessages.signUp.invalidGender }).optional(),
            userType: z
                .enum(UserType, { error: validationMessages.signUp.invalidUserType })
                .optional(),
            profileImageUrl: removableUrlString(validationMessages.user.profileImageUrlString),
            description: optionalString(validationMessages.user.descriptionString).pipe(
                z
                    .string()
                    .max(1000, { error: validationMessages.user.descriptionMaxLength })
                    .optional(),
            ),
            experienceInYears: z.coerce
                .number({ error: validationMessages.user.experienceInYearsNumber })
                .min(0, { error: validationMessages.user.experienceInYearsMin })
                .max(99.99, { error: validationMessages.user.experienceInYearsMax })
                .optional(),
            performanceMetrics: performanceMetricEntrySchema.optional(),
            status: statusSchema.optional(),
        })
        .strict(),
};

export const updateManagedUserSchema = {
    params: z
        .object({
            id: z.string().refine((value) => uuidRegex.test(value), {
                error: validationMessages.user.userIdInvalid,
            }),
        })
        .strict(),
    body: z
        .object({
            roleId: z.string().refine((value) => uuidRegex.test(value), {
                error: validationMessages.user.roleIdInvalid,
            }),
            fullName: optionalString(validationMessages.user.fullNameRequired).pipe(
                z
                    .string()
                    .max(200, { error: validationMessages.user.fullNameMaxLength })
                    .optional(),
            ),
            phoneNumber: optionalString(validationMessages.user.phoneNumberString).pipe(
                z
                    .string()
                    .max(20, { error: validationMessages.user.phoneNumberMaxLength })
                    .regex(/^[+0-9()\-\s]+$/, { error: validationMessages.user.phoneNumberInvalid })
                    .optional(),
            ),
            email: optionalString(validationMessages.user.emailRequired)
                .pipe(
                    z
                        .string()
                        .max(255, { error: validationMessages.user.emailMaxLength })
                        .refine((value) => emailRegex.test(value), {
                            error: validationMessages.user.emailInvalid,
                        })
                        .optional(),
                )
                .transform((value) => value?.toLowerCase()),
            branchIds: branchIdsSchema.optional(),
            dob: optionalString(validationMessages.user.dobRequired).optional(),
            gender: z.enum(Gender, { error: validationMessages.signUp.invalidGender }).optional(),
            userType: z
                .enum(UserType, { error: validationMessages.signUp.invalidUserType })
                .optional(),
            profileImageUrl: removableUrlString(validationMessages.user.profileImageUrlString),
            description: optionalString(validationMessages.user.descriptionString).pipe(
                z
                    .string()
                    .max(1000, { error: validationMessages.user.descriptionMaxLength })
                    .optional(),
            ),
            experienceInYears: z.coerce
                .number({ error: validationMessages.user.experienceInYearsNumber })
                .min(0, { error: validationMessages.user.experienceInYearsMin })
                .max(99.99, { error: validationMessages.user.experienceInYearsMax })
                .optional(),
            performanceMetrics: performanceMetricEntrySchema.optional(),
            password: optionalPasswordSchema,
            confirmPassword: optionalString(validationMessages.signUp.confirmPasswordRequired),
            status: statusSchema.optional(),
        })
        .strict(),
};

export const updateManagedUserStatusSchema = {
    params: updateManagedUserSchema.params,
    body: z.object({ status: statusSchema }).strict(),
};

export const updateProfileSchema = {
    body: z
        .object({
            fullName: optionalString(validationMessages.user.fullNameRequired).pipe(
                z
                    .string()
                    .max(200, { error: validationMessages.user.fullNameMaxLength })
                    .optional(),
            ),
            phoneNumber: optionalString(validationMessages.user.phoneNumberString).pipe(
                z
                    .string()
                    .max(20, { error: validationMessages.user.phoneNumberMaxLength })
                    .regex(/^[+0-9()\-\s]+$/, { error: validationMessages.user.phoneNumberInvalid })
                    .optional(),
            ),
            age: z.coerce
                .number({ error: validationMessages.signUp.ageNumber })
                .int({ error: validationMessages.signUp.ageInteger })
                .min(1, { error: validationMessages.signUp.ageMin })
                .max(120, { error: validationMessages.signUp.ageMax })
                .optional(),
            gender: z.enum(Gender, { error: validationMessages.signUp.invalidGender }).optional(),
            userType: z
                .enum(UserType, { error: validationMessages.signUp.invalidUserType })
                .optional(),
            profileImageUrl: optionalString(validationMessages.user.profileImageUrlString).pipe(
                z
                    .string()
                    .max(500, { error: validationMessages.user.profileImageUrlMaxLength })
                    .optional(),
            ),
            performanceMetrics: performanceMetricEntrySchema.optional(),
            password: optionalPasswordSchema,
        })
        .strict(),
};

export const managedUserIdSchema = {
    params: updateManagedUserSchema.params,
};

export const createUserMetricSchema = {
    params: updateManagedUserSchema.params,
    body: userMetricBodySchema,
};

export const listManagedUsersSchema = {
    query: z
        .object({
            page: z.coerce.number().int().positive().optional(),
            pageSize: z.coerce.number().int().positive().max(100).optional(),
            search: optionalString(validationMessages.user.searchString).pipe(
                z.string().max(255, { error: validationMessages.user.searchMaxLength }).optional(),
            ),
            roleId: z
                .string()
                .refine((value) => uuidRegex.test(value), {
                    error: validationMessages.user.roleIdInvalid,
                })
                .optional(),
            status: statusSchema.optional(),
            branchId: z
                .string()
                .refine((value) => uuidRegex.test(value), {
                    error: validationMessages.user.branchIdInvalid,
                })
                .optional(),
            branchIds: branchIdsQuerySchema,
            userType: z
                .enum(UserType, { error: validationMessages.signUp.invalidUserType })
                .optional(),
            orderBy: z
                .enum(['full_name', 'email', 'phone_no', 'created_at', 'updated_at'])
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

export type CreateManagedUserBodyPayload = z.infer<typeof createManagedUserSchema.body>;
export type UpdateManagedUserBodyPayload = z.infer<typeof updateManagedUserSchema.body>;
export type ManagedUserIdParamsPayload = z.infer<typeof managedUserIdSchema.params>;
export type CreateUserMetricBodyPayload = z.infer<typeof createUserMetricSchema.body>;
export type UpdateManagedUserStatusBodyPayload = z.infer<typeof updateManagedUserStatusSchema.body>;
export type FetchUsersQueryPayload = z.infer<typeof listManagedUsersSchema.query>;
export type UpdateProfileBodyPayload = z.infer<typeof updateProfileSchema.body>;
