import { z } from 'zod';
import { Gender, UserType } from '../config';
import { validationMessages } from '../lang/api-messages';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
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
        if (value === 'true') return true;
        if (value === 'false') return false;
        return value;
    });
const branchIdsSchema = z
    .array(
        z.string().refine((value) => uuidRegex.test(value), {
            message: validationMessages.user.branchIdInvalid,
        }),
    )
    .min(1, validationMessages.user.branchIdsRequired)
    .refine((ids) => new Set(ids).size === ids.length, {
        message: validationMessages.user.branchIdsUnique,
    });
const performanceMetricsSchema = z
    .object({
        sprintTime30m: requiredString(validationMessages.signUp.sprintTime30mRequired).max(
            50,
            validationMessages.signUp.performanceMetricMaxLength,
        ),
        verticalJump: requiredString(validationMessages.signUp.verticalJumpRequired).max(
            50,
            validationMessages.signUp.performanceMetricMaxLength,
        ),
        gripStrength: requiredString(validationMessages.signUp.gripStrengthRequired).max(
            50,
            validationMessages.signUp.performanceMetricMaxLength,
        ),
        vo2MaxEstimate: requiredString(validationMessages.signUp.vo2MaxEstimateRequired).max(
            50,
            validationMessages.signUp.performanceMetricMaxLength,
        ),
        bodyFatPercentage: requiredString(validationMessages.signUp.bodyFatPercentageRequired).max(
            50,
            validationMessages.signUp.performanceMetricMaxLength,
        ),
    })
    .strict();

export const createManagedUserSchema = {
    body: z
        .object({
            roleId: z.string().refine((value) => uuidRegex.test(value), {
                message: validationMessages.user.roleIdInvalid,
            }),
            fullName: requiredString(validationMessages.user.fullNameRequired).max(
                200,
                validationMessages.user.fullNameMaxLength,
            ),
            contactNumber: optionalString(validationMessages.user.contactNumberString).pipe(
                z
                    .string()
                    .max(20, validationMessages.user.contactNumberMaxLength)
                    .regex(/^[+0-9()\-\s]+$/, validationMessages.user.contactNumberInvalid)
                    .optional(),
            ),
            email: requiredString(validationMessages.user.emailRequired)
                .max(255, validationMessages.user.emailMaxLength)
                .refine((value) => emailRegex.test(value), {
                    message: validationMessages.user.emailInvalid,
                })
                .transform((value) => value.toLowerCase()),
            password: requiredString(validationMessages.user.passwordRequired)
                .min(8, validationMessages.signUp.passwordMinLength)
                .max(400, validationMessages.signUp.passwordMaxLength),
            confirmPassword: optionalString(validationMessages.signUp.confirmPasswordRequired),
            branchIds: branchIdsSchema,
            age: z.coerce
                .number({ message: validationMessages.signUp.ageNumber })
                .int(validationMessages.signUp.ageInteger)
                .min(1, validationMessages.signUp.ageMin)
                .max(120, validationMessages.signUp.ageMax)
                .optional(),
            gender: z.enum(Gender, { message: validationMessages.signUp.invalidGender }).optional(),
            userType: z
                .enum(UserType, {
                    message: validationMessages.signUp.invalidUserType,
                })
                .optional(),
            performanceMetrics: performanceMetricsSchema.optional(),
            status: statusSchema,
        })
        .strict(),
};

export const updateManagedUserSchema = {
    params: z
        .object({
            id: z.string().refine((value) => uuidRegex.test(value), {
                message: validationMessages.user.userIdInvalid,
            }),
        })
        .strict(),
    body: z
        .object({
            fullName: optionalString(validationMessages.user.fullNameRequired).pipe(
                z.string().max(200, validationMessages.user.fullNameMaxLength).optional(),
            ),
            contactNumber: optionalString(validationMessages.user.contactNumberString).pipe(
                z
                    .string()
                    .max(20, validationMessages.user.contactNumberMaxLength)
                    .regex(/^[+0-9()\-\s]+$/, validationMessages.user.contactNumberInvalid)
                    .optional(),
            ),
            branchIds: branchIdsSchema.optional(),
            age: z.coerce
                .number({ message: validationMessages.signUp.ageNumber })
                .int(validationMessages.signUp.ageInteger)
                .min(1, validationMessages.signUp.ageMin)
                .max(120, validationMessages.signUp.ageMax)
                .optional(),
            gender: z.enum(Gender, { message: validationMessages.signUp.invalidGender }).optional(),
            userType: z
                .enum(UserType, {
                    message: validationMessages.signUp.invalidUserType,
                })
                .optional(),
            performanceMetrics: performanceMetricsSchema.optional(),
            status: statusSchema,
        })
        .strict(),
};

export const updateManagedUserStatusSchema = {
    params: updateManagedUserSchema.params,
    body: z
        .object({ status: z.boolean({ message: validationMessages.common.statusBoolean }) })
        .strict(),
};

export const updateProfileSchema = {
    body: z
        .object({
            fullName: optionalString(validationMessages.user.fullNameRequired).pipe(
                z.string().max(200, validationMessages.user.fullNameMaxLength).optional(),
            ),
            contactNumber: optionalString(validationMessages.user.contactNumberString).pipe(
                z
                    .string()
                    .max(20, validationMessages.user.contactNumberMaxLength)
                    .regex(/^[+0-9()\-\s]+$/, validationMessages.user.contactNumberInvalid)
                    .optional(),
            ),
            age: z.coerce
                .number({ message: validationMessages.signUp.ageNumber })
                .int(validationMessages.signUp.ageInteger)
                .min(1, validationMessages.signUp.ageMin)
                .max(120, validationMessages.signUp.ageMax)
                .optional(),
            gender: z.enum(Gender, { message: validationMessages.signUp.invalidGender }).optional(),
            userType: z
                .enum(UserType, {
                    message: validationMessages.signUp.invalidUserType,
                })
                .optional(),
            performanceMetrics: performanceMetricsSchema.optional(),
        })
        .strict(),
};

export const managedUserIdSchema = {
    params: updateManagedUserSchema.params,
};

export const listManagedUsersSchema = {
    query: z
        .object({
            page: z.coerce.number().int().positive().optional(),
            pageSize: z.coerce.number().int().positive().max(100).optional(),
            search: optionalString(validationMessages.user.searchString).pipe(
                z.string().max(255, validationMessages.user.searchMaxLength).optional(),
            ),
            roleId: z
                .string()
                .refine((value) => uuidRegex.test(value), {
                    message: validationMessages.user.roleIdInvalid,
                })
                .optional(),
            status: statusSchema,
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
export type UpdateManagedUserStatusBodyPayload = z.infer<typeof updateManagedUserStatusSchema.body>;
export type FetchUsersQueryPayload = z.infer<typeof listManagedUsersSchema.query>;
export type UpdateProfileBodyPayload = z.infer<typeof updateProfileSchema.body>;
