import { z } from 'zod';
import { Gender, OtpPurpose, UserType } from '../config';
import { validationMessages } from '../lang/api-messages';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const dateRegex = /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
const { common, email, profile } = validationMessages;
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
const performanceMetricValueSchema = z.union([
    z.string().trim().max(50, validationMessages.signUp.performanceMetricMaxLength),
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
    .regex(dateRegex, validationMessages.signUp.performanceMetricDateInvalid)
    .refine((value) => parseMetricDate(value) !== null, {
        message: validationMessages.signUp.performanceMetricDateInvalid,
    })
    .transform((value) => parseMetricDate(value)!);
const performanceMetricEntrySchema = z
    .object({
        date: performanceMetricDateSchema,
        metrics: performanceMetricsSchema,
    })
    .strict();

export const loginSchema = {
    body: z
        .object({
            email: z
                .string({ message: email.email_str })
                .min(1, { message: email.email_empty })
                .refine((val) => emailRegex.test(val), {
                    message: email.email_valid,
                })
                .transform((val) => val.toLowerCase()),

            password: z.string({ message: validationMessages.password.password_str }),
        })
        .strict(),
};

export const signUpSchema = {
    body: z
        .object({
            fullName: requiredString(validationMessages.signUp.fullNameRequired).max(
                200,
                validationMessages.signUp.fullNameMaxLength,
            ),
            email: z
                .string({ message: email.email_str })
                .min(1, { message: email.email_empty })
                .refine((val) => emailRegex.test(val), {
                    message: email.email_valid,
                })
                .transform((val) => val.toLowerCase()),
            mobileNumber: requiredString(validationMessages.signUp.mobileNumberRequired)
                .max(20, validationMessages.signUp.phoneNumberMaxLength)
                .regex(/^[+0-9()\-\s]+$/, validationMessages.signUp.phoneNumberInvalid),
            age: z.coerce
                .number({ message: validationMessages.signUp.ageNumber })
                .int(validationMessages.signUp.ageInteger)
                .min(1, validationMessages.signUp.ageMin)
                .max(120, validationMessages.signUp.ageMax),
            gender: z.enum(Gender, {
                message: validationMessages.signUp.invalidGender,
            }),
            userType: z.enum(UserType, {
                message: validationMessages.signUp.invalidUserType,
            }),
            branchId: z.string().refine((val) => uuidRegex.test(val), {
                message: validationMessages.signUp.branchIdInvalid,
            }),
            performanceMetrics: performanceMetricEntrySchema,
            password: requiredString(validationMessages.signUp.passwordRequired)
                .min(8, validationMessages.signUp.passwordMinLength)
                .max(400, validationMessages.signUp.passwordMaxLength),
            confirmPassword: requiredString(validationMessages.signUp.confirmPasswordRequired),
        })
        .refine((payload) => payload.password === payload.confirmPassword, {
            message: validationMessages.signUp.passwordsDoNotMatch,
            path: ['confirmPassword'],
        })
        .strict(),
};

export const addUserSchema = {
    body: z
        .object({
            fullName: optionalString(validationMessages.signUp.fullNameRequired).pipe(
                z.string().max(200, validationMessages.signUp.fullNameMaxLength).optional(),
            ),
            mobileNumber: optionalString(profile.mobileNumberString).pipe(
                z.string().max(20, profile.mobileNumberMaxLength).optional(),
            ),
            email: requiredString(profile.emailRequired)
                .max(255, profile.emailMaxLength)
                .refine((value) => emailRegex.test(value), {
                    message: common.invalidEmail,
                })
                .transform((value) => value.toLowerCase()),
            password: requiredString(profile.passwordRequired).max(
                400,
                profile.passwordMaxLength400,
            ),
            status: statusSchema,
        })
        .strict(),
};

export const updateUserSchema = {
    params: z
        .object({
            id: z.string().refine((val) => uuidRegex.test(val), {
                message: profile.userIdInvalid,
            }),
        })
        .strict(),
    body: z
        .object({
            fullName: optionalString(validationMessages.signUp.fullNameRequired).pipe(
                z.string().max(200, validationMessages.signUp.fullNameMaxLength).optional(),
            ),
            mobileNumber: optionalString(profile.mobileNumberString).pipe(
                z.string().max(20, profile.mobileNumberMaxLength).optional(),
            ),
            password: optionalString(profile.passwordString).pipe(
                z.string().max(400, profile.passwordMaxLength400).optional(),
            ),
            status: statusSchema,
        })
        .strict(),
};

export const validateTempUserEmailSchema = {
    body: z.object({
        email: z
            .string({ message: email.email_str })
            .min(1, { message: email.email_empty })
            .refine((val) => emailRegex.test(val), {
                message: email.email_valid,
            })
            .transform((val) => val.toLowerCase()),
    }),
};

export const forgotPasswordSchema = {
    body: z.object({
        email: z
            .string({ message: email.email_str })
            .min(1, { message: email.email_empty })
            .refine((val) => emailRegex.test(val), {
                message: email.email_valid,
            })
            .transform((val) => val.toLowerCase()),
    }),
};

export const verifyOtpSchema = {
    body: z.object({
        email: z
            .string({ message: email.email_str })
            .min(1, { message: email.email_empty })
            .refine((val) => emailRegex.test(val), {
                message: email.email_valid,
            })
            .transform((val) => val.toLowerCase()),
        otp: z.string({ message: common.otpString }),
        purpose: z.enum(OtpPurpose, {
            message: common.otpPurposeInvalid,
        }),
    }),
};

export const resetPasswordSchema = {
    body: z
        .object({
            email: z
                .string({ message: email.email_str })
                .min(1, { message: email.email_empty })
                .refine((val) => emailRegex.test(val), {
                    message: email.email_valid,
                })
                .transform((val) => val.toLowerCase()),
            password: requiredString(common.passwordRequired),
            confirmPassword: requiredString(common.confirmPasswordRequired),
        })
        .refine((payload) => payload?.password === payload?.confirmPassword, {
            message: common.passwordsDoNotMatch,
            path: ['confirmPassword'],
        }),
};

export const resentOtpSchema = {
    body: z.object({
        email: z
            .string({ message: email.email_str })
            .min(1, { message: email.email_empty })
            .refine((val) => emailRegex.test(val), {
                message: email.email_valid,
            })
            .transform((val) => val.toLowerCase()),
        purpose: z.enum(OtpPurpose, {
            message: common.otpPurposeInvalid,
        }),
    }),
};

export const refreshTokenSchema = {
    body: z.object({
        refreshToken: z.string({ message: common.refreshTokenString }),
    }),
};

export const logoutSchema = {
    body: z.object({
        refreshToken: requiredString(common.refreshTokenRequired),
    }),
};

export const changePasswordSchema = {
    body: z
        .object({
            oldPassword: requiredString(common.passwordRequired),
            newPassword: requiredString(common.passwordRequired),
            confirmPassword: requiredString(common.confirmPasswordRequired),
        })
        .refine((payload) => payload?.newPassword === payload?.confirmPassword, {
            message: common.newPasswordsDoNotMatch,
            path: ['confirmPassword'],
        }),
};

export const adminUpdateUserSchema = {
    params: z
        .object({
            id: z.string().refine((val) => uuidRegex.test(val), {
                message: profile.userIdInvalid,
            }),
        })
        .strict(),
    body: z
        .object({
            roleId: z
                .string()
                .refine((val) => uuidRegex.test(val), {
                    message: profile.roleIdInvalid,
                })
                .optional(),
            fullName: optionalString(validationMessages.signUp.fullNameRequired).pipe(
                z.string().max(200, validationMessages.signUp.fullNameMaxLength).optional(),
            ),
            mobileNumber: optionalString(profile.mobileNumberString).pipe(
                z.string().max(20, profile.mobileNumberMaxLength).optional(),
            ),
            status: statusSchema,
        })
        .strict(),
};

export const adminChangePasswordSchema = {
    params: z
        .object({
            id: z.string().refine((val) => uuidRegex.test(val), {
                message: profile.userIdInvalid,
            }),
        })
        .strict(),
    body: z
        .object({
            password: requiredString(common.passwordRequired),
            confirmPassword: requiredString(common.confirmPasswordRequired),
        })
        .refine((payload) => payload.password === payload.confirmPassword, {
            message: common.passwordsDoNotMatch,
            path: ['confirmPassword'],
        })
        .strict(),
};

export const updateUserStatusSchema = {
    params: z
        .object({
            id: z.string().refine((val) => uuidRegex.test(val), {
                message: profile.userIdInvalid,
            }),
        })
        .strict(),
    body: z
        .object({
            status: z.boolean({ message: common.statusBoolean }),
        })
        .strict(),
};

export type LoginBodyPayload = z.infer<typeof loginSchema.body>;
export type SignUpBodyPayload = z.infer<typeof signUpSchema.body>;
export type ForgotPasswordBodyPayload = z.infer<typeof forgotPasswordSchema.body>;
export type VerifyOtpBodyPayload = z.infer<typeof verifyOtpSchema.body>;
export type ResetPasswordBodyPayload = z.infer<typeof resetPasswordSchema.body>;
export type ResentOtpBodyPayload = z.infer<typeof resentOtpSchema.body>;
export type RefreshTokenBodyPayload = z.infer<typeof refreshTokenSchema.body>;
export type LogoutBodyPayload = z.infer<typeof logoutSchema.body>;
export type ChangePasswordBodyPayload = z.infer<typeof changePasswordSchema.body>;
export type ValidateTempUserEmailBodyPayload = z.infer<typeof validateTempUserEmailSchema.body>;
export type AddUserBodyPayload = z.infer<typeof addUserSchema.body>;
export type UpdateUserBodyPayload = z.infer<typeof updateUserSchema.body>;
export type UpdateUserParamsPayload = z.infer<typeof updateUserSchema.params>;
export type AdminUpdateUserBodyPayload = z.infer<typeof adminUpdateUserSchema.body>;
export type AdminUpdateUserParamsPayload = z.infer<typeof adminUpdateUserSchema.params>;
export type UpdateUserStatusBodyPayload = z.infer<typeof updateUserStatusSchema.body>;
export type UpdateUserStatusParamsPayload = z.infer<typeof updateUserStatusSchema.params>;
export type AdminChangePasswordBodyPayload = z.infer<typeof adminChangePasswordSchema.body>;
export type AdminChangePasswordParamsPayload = z.infer<typeof adminChangePasswordSchema.params>;
