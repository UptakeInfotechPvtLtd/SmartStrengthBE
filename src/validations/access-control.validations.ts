import { z } from 'zod';
import { AccessModule, AccessPermission } from '../config';
import { validationMessages } from '../lang/api-messages';

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const uuidSchema = (message: string) =>
    z.string().refine((value) => uuidRegex.test(value), { error: message });

const accessEntrySchema = z
    .object({
        moduleKey: z.enum(AccessModule, { error: validationMessages.accessControl.moduleInvalid }),
        permissions: z
            .array(
                z.enum(AccessPermission, {
                    error: validationMessages.accessControl.permissionInvalid,
                }),
            )
            .refine((permissions) => new Set(permissions).size === permissions.length, {
                error: validationMessages.accessControl.permissionsUnique,
            }),
    })
    .strict();

export const getAccessConfigSchema = {
    query: z
        .object({
            roleId: uuidSchema(validationMessages.accessControl.roleIdInvalid),
        })
        .strict(),
};

export const getUserAccessConfigSchema = {
    params: z
        .object({
            userId: uuidSchema(validationMessages.accessControl.userIdInvalid),
        })
        .strict(),
};

export const upsertAccessConfigSchema = {
    body: z
        .object({
            roleId: uuidSchema(validationMessages.accessControl.roleIdInvalid),
            access: z.array(accessEntrySchema),
        })
        .strict(),
};

export const upsertUserAccessConfigSchema = {
    body: z
        .object({
            userId: uuidSchema(validationMessages.accessControl.userIdInvalid),
            access: z.array(accessEntrySchema),
        })
        .strict(),
};

export const roleAccessConfigSchema = {
    params: z
        .object({
            roleId: uuidSchema(validationMessages.accessControl.roleIdInvalid),
        })
        .strict(),
};

export type GetAccessConfigQueryPayload = z.infer<typeof getAccessConfigSchema.query>;
export type GetUserAccessConfigParamsPayload = z.infer<typeof getUserAccessConfigSchema.params>;
export type UpsertAccessConfigBodyPayload = z.infer<typeof upsertAccessConfigSchema.body>;
export type UpsertUserAccessConfigBodyPayload = z.infer<typeof upsertUserAccessConfigSchema.body>;
export type RoleAccessConfigParamsPayload = z.infer<typeof roleAccessConfigSchema.params>;
