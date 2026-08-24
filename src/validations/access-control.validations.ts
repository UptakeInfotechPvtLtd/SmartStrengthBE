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

export const upsertAccessConfigSchema = {
    body: z
        .object({
            roleId: uuidSchema(validationMessages.accessControl.roleIdInvalid),
            access: z.array(accessEntrySchema),
        })
        .strict(),
};

export type GetAccessConfigQueryPayload = z.infer<typeof getAccessConfigSchema.query>;
export type UpsertAccessConfigBodyPayload = z.infer<typeof upsertAccessConfigSchema.body>;
