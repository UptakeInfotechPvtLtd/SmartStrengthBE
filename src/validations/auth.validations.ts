import { z } from 'zod';
import { Gender, OtpPurpose, UserType } from '../config';
import { validationMessages } from '../lang/api-messages';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const { common, email, profile } = validationMessages;
const requiredString = (message: string) =>
    z.string({ error: message }).trim().min(1, { error: message });
const optionalString = (message: string) =>
    z
        .union([z.string({ error: message }).trim(), z.null()])
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
export const loginSchema = {
    body: z
        .object({
            email: z
                .string({ error: email.email_str })
                .min(1, { error: email.email_empty })
                .refine((val) => emailRegex.test(val), { error: email.email_valid })
                .transform((val) => val.toLowerCase()),

            password: z.string({ error: validationMessages.password.password_str }),
        })
        .strict(),
};

export const signUpSchema = {
    body: z
        .object({
            profilePicUrl: optionalString(validationMessages.user.profileImageUrlString).pipe(
                z
                    .string()
                    .max(500, { error: validationMessages.user.profileImageUrlMaxLength })
                    .optional(),
            ),
            fullName: requiredString(validationMessages.signUp.fullNameRequired).max(200, {
                error: validationMessages.signUp.fullNameMaxLength,
            }),
            email: z
                .string({ error: email.email_str })
                .min(1, { error: email.email_empty })
                .refine((val) => emailRegex.test(val), { error: email.email_valid })
                .transform((val) => val.toLowerCase()),
            phoneNumber: requiredString(validationMessages.signUp.mobileNumberRequired)
                .max(20, { error: validationMessages.signUp.phoneNumberMaxLength })
                .regex(/^[+0-9()\-\s]+$/, { error: validationMessages.signUp.phoneNumberInvalid }),
            gender: z.enum(Gender, { error: validationMessages.signUp.invalidGender }),
            userType: z.enum(UserType, { error: validationMessages.signUp.invalidUserType }),
            branchId: z.string().refine((val) => uuidRegex.test(val), {
                error: validationMessages.signUp.branchIdInvalid,
            }),
            password: requiredString(validationMessages.signUp.passwordRequired)
                .min(8, { error: validationMessages.signUp.passwordMinLength })
                .max(400, { error: validationMessages.signUp.passwordMaxLength }),
            confirmPassword: requiredString(validationMessages.signUp.confirmPasswordRequired),
        })
        .refine((payload) => payload.password === payload.confirmPassword, {
            error: validationMessages.signUp.passwordsDoNotMatch,
            path: ['confirmPassword'],
        })
        .strict(),
};

export const addUserSchema = {
    body: z
        .object({
            fullName: optionalString(validationMessages.signUp.fullNameRequired).pipe(
                z
                    .string()
                    .max(200, { error: validationMessages.signUp.fullNameMaxLength })
                    .optional(),
            ),
            mobileNumber: optionalString(profile.mobileNumberString).pipe(
                z.string().max(20, { error: profile.mobileNumberMaxLength }).optional(),
            ),
            email: requiredString(profile.emailRequired)
                .max(255, { error: profile.emailMaxLength })
                .refine((value) => emailRegex.test(value), { error: common.invalidEmail })
                .transform((value) => value.toLowerCase()),
            password: requiredString(profile.passwordRequired).max(400, {
                error: profile.passwordMaxLength400,
            }),
            status: statusSchema,
        })
        .strict(),
};

export const updateUserSchema = {
    params: z
        .object({
            id: z.string().refine((val) => uuidRegex.test(val), { error: profile.userIdInvalid }),
        })
        .strict(),
    body: z
        .object({
            fullName: optionalString(validationMessages.signUp.fullNameRequired).pipe(
                z
                    .string()
                    .max(200, { error: validationMessages.signUp.fullNameMaxLength })
                    .optional(),
            ),
            mobileNumber: optionalString(profile.mobileNumberString).pipe(
                z.string().max(20, { error: profile.mobileNumberMaxLength }).optional(),
            ),
            password: optionalString(profile.passwordString).pipe(
                z.string().max(400, { error: profile.passwordMaxLength400 }).optional(),
            ),
            status: statusSchema,
        })
        .strict(),
};

export const validateTempUserEmailSchema = {
    body: z.object({
        email: z
            .string({ error: email.email_str })
            .min(1, { error: email.email_empty })
            .refine((val) => emailRegex.test(val), { error: email.email_valid })
            .transform((val) => val.toLowerCase()),
    }),
};

export const forgotPasswordSchema = {
    body: z.object({
        email: z
            .string({ error: email.email_str })
            .min(1, { error: email.email_empty })
            .refine((val) => emailRegex.test(val), { error: email.email_valid })
            .transform((val) => val.toLowerCase()),
    }),
};

export const verifyOtpSchema = {
    body: z.object({
        email: z
            .string({ error: email.email_str })
            .min(1, { error: email.email_empty })
            .refine((val) => emailRegex.test(val), { error: email.email_valid })
            .transform((val) => val.toLowerCase()),
        otp: z.string({ error: common.otpString }),
        purpose: z.enum(OtpPurpose, { error: common.otpPurposeInvalid }),
    }),
};

export const resetPasswordSchema = {
    body: z
        .object({
            email: z
                .string({ error: email.email_str })
                .min(1, { error: email.email_empty })
                .refine((val) => emailRegex.test(val), { error: email.email_valid })
                .transform((val) => val.toLowerCase()),
            password: requiredString(common.passwordRequired),
            confirmPassword: requiredString(common.confirmPasswordRequired),
        })
        .refine((payload) => payload?.password === payload?.confirmPassword, {
            error: common.passwordsDoNotMatch,
            path: ['confirmPassword'],
        }),
};

export const resentOtpSchema = {
    body: z.object({
        email: z
            .string({ error: email.email_str })
            .min(1, { error: email.email_empty })
            .refine((val) => emailRegex.test(val), { error: email.email_valid })
            .transform((val) => val.toLowerCase()),
        purpose: z.enum(OtpPurpose, { error: common.otpPurposeInvalid }),
    }),
};

export const refreshTokenSchema = {
    body: z.object({
        refreshToken: z.string({ error: common.refreshTokenString }),
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
            error: common.newPasswordsDoNotMatch,
            path: ['confirmPassword'],
        }),
};

export const adminUpdateUserSchema = {
    params: z
        .object({
            id: z.string().refine((val) => uuidRegex.test(val), { error: profile.userIdInvalid }),
        })
        .strict(),
    body: z
        .object({
            roleId: z
                .string()
                .refine((val) => uuidRegex.test(val), { error: profile.roleIdInvalid })
                .optional(),
            fullName: optionalString(validationMessages.signUp.fullNameRequired).pipe(
                z
                    .string()
                    .max(200, { error: validationMessages.signUp.fullNameMaxLength })
                    .optional(),
            ),
            mobileNumber: optionalString(profile.mobileNumberString).pipe(
                z.string().max(20, { error: profile.mobileNumberMaxLength }).optional(),
            ),
            status: statusSchema,
        })
        .strict(),
};

export const adminChangePasswordSchema = {
    params: z
        .object({
            id: z.string().refine((val) => uuidRegex.test(val), { error: profile.userIdInvalid }),
        })
        .strict(),
    body: z
        .object({
            password: requiredString(common.passwordRequired),
            confirmPassword: requiredString(common.confirmPasswordRequired),
        })
        .refine((payload) => payload.password === payload.confirmPassword, {
            error: common.passwordsDoNotMatch,
            path: ['confirmPassword'],
        })
        .strict(),
};

export const updateUserStatusSchema = {
    params: z
        .object({
            id: z.string().refine((val) => uuidRegex.test(val), { error: profile.userIdInvalid }),
        })
        .strict(),
    body: z
        .object({
            status: z.boolean({ error: common.statusBoolean }),
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
