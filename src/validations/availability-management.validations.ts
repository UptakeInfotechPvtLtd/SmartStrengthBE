import { z } from 'zod';
import { BranchAvailabilityStatus, TrainerAvailabilityStatus } from '../config';
import { validationMessages } from '../lang/api-messages';

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^(0?[1-9]|1[0-2]):([0-5]\d)\s?(AM|PM)$/i;

const requiredString = (message: string) =>
    z.string({ error: message }).trim().min(1, { error: message });
const optionalString = (message: string) =>
    z
        .union([z.string({ error: message }).trim(), z.null()])
        .optional()
        .transform((value) => (value === null ? undefined : value));

const formatTimeForDb = (value: string): string => {
    const [, hourValue, minuteValue, suffix] = value.match(timeRegex)!;
    const hour = Number(hourValue);
    const normalizedHour =
        suffix.toUpperCase() === 'PM' ? (hour === 12 ? 12 : hour + 12) : hour === 12 ? 0 : hour;

    return `${String(normalizedHour).padStart(2, '0')}:${minuteValue}`;
};

const isValidDate = (value: string): boolean => {
    if (!dateRegex.test(value)) {
        return false;
    }

    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

const uuidParamSchema = (key: 'branchId' | 'trainerId' | 'maintenanceId') =>
    z
        .object({
            [key]: z.string().refine((value) => uuidRegex.test(value), {
                error: getUuidParamMessage(key),
            }),
        })
        .strict();

const getUuidParamMessage = (key: 'branchId' | 'trainerId' | 'maintenanceId'): string => {
    if (key === 'branchId') {
        return validationMessages.availabilityManagement.branchIdInvalid;
    }
    if (key === 'trainerId') {
        return validationMessages.availabilityManagement.trainerIdInvalid;
    }

    return validationMessages.availabilityManagement.maintenanceIdInvalid;
};

const branchMaintenanceParamsSchema = z
    .object({
        branchId: z.string().refine((value) => uuidRegex.test(value), {
            error: validationMessages.availabilityManagement.branchIdInvalid,
        }),
        maintenanceId: z.string().refine((value) => uuidRegex.test(value), {
            error: validationMessages.availabilityManagement.maintenanceIdInvalid,
        }),
    })
    .strict();

const trainerMaintenanceParamsSchema = z
    .object({
        trainerId: z.string().refine((value) => uuidRegex.test(value), {
            error: validationMessages.availabilityManagement.trainerIdInvalid,
        }),
        maintenanceId: z.string().refine((value) => uuidRegex.test(value), {
            error: validationMessages.availabilityManagement.maintenanceIdInvalid,
        }),
    })
    .strict();

const maintenanceBodySchema = z
    .object({
        date: requiredString(validationMessages.availabilityManagement.dateInvalid).refine(
            isValidDate,
            {
                error: validationMessages.availabilityManagement.dateInvalid,
            },
        ),
        timeFrom: requiredString(validationMessages.availabilityManagement.timeFromInvalid)
            .regex(timeRegex, { error: validationMessages.availabilityManagement.timeFromInvalid })
            .transform(formatTimeForDb),
        timeTo: requiredString(validationMessages.availabilityManagement.timeToInvalid)
            .regex(timeRegex, { error: validationMessages.availabilityManagement.timeToInvalid })
            .transform(formatTimeForDb),
        reason: requiredString(validationMessages.availabilityManagement.reasonRequired).max(500, {
            error: validationMessages.availabilityManagement.reasonMaxLength,
        }),
    })
    .strict()
    .refine((body) => body.timeFrom < body.timeTo, {
        error: validationMessages.availabilityManagement.timeRangeInvalid,
        path: ['timeTo'],
    });

export const updateBranchAvailabilityStatusSchema = {
    params: uuidParamSchema('branchId'),
    body: z
        .object({
            status: z.enum(BranchAvailabilityStatus, {
                error: validationMessages.availabilityManagement.branchAvailabilityStatusInvalid,
            }),
        })
        .strict(),
};

export const updateTrainerAvailabilityStatusSchema = {
    params: uuidParamSchema('trainerId'),
    body: z
        .object({
            status: z.enum(TrainerAvailabilityStatus, {
                error: validationMessages.availabilityManagement.trainerAvailabilityStatusInvalid,
            }),
        })
        .strict(),
};

export const createBranchMaintenanceSchema = {
    params: uuidParamSchema('branchId'),
    body: maintenanceBodySchema,
};

export const createTrainerMaintenanceSchema = {
    params: uuidParamSchema('trainerId'),
    body: maintenanceBodySchema,
};

export const branchAvailabilityParamsSchema = {
    params: uuidParamSchema('branchId'),
};

export const trainerAvailabilityParamsSchema = {
    params: uuidParamSchema('trainerId'),
};

export const deleteBranchMaintenanceSchema = {
    params: branchMaintenanceParamsSchema,
};

export const deleteTrainerMaintenanceSchema = {
    params: trainerMaintenanceParamsSchema,
};

const listSlotQueryObjectSchema = z.object({
    page: z.coerce.number().int().positive().optional(),
    pageSize: z.coerce.number().int().positive().max(100).optional(),
    search: optionalString(validationMessages.availabilityManagement.searchString).pipe(
        z
            .string()
            .max(255, { error: validationMessages.availabilityManagement.searchMaxLength })
            .optional(),
    ),
});

export const listTrainerAvailabilitiesSchema = {
    query: z
        .object({
            ...listSlotQueryObjectSchema.shape,
            status: z
                .enum(TrainerAvailabilityStatus, {
                    error: validationMessages.availabilityManagement
                        .trainerAvailabilityStatusInvalid,
                })
                .optional(),
        })
        .strict(),
};

export type UpdateBranchAvailabilityStatusParamsPayload = z.infer<
    typeof updateBranchAvailabilityStatusSchema.params
>;
export type UpdateBranchAvailabilityStatusBodyPayload = z.infer<
    typeof updateBranchAvailabilityStatusSchema.body
>;
export type UpdateTrainerAvailabilityStatusParamsPayload = z.infer<
    typeof updateTrainerAvailabilityStatusSchema.params
>;
export type UpdateTrainerAvailabilityStatusBodyPayload = z.infer<
    typeof updateTrainerAvailabilityStatusSchema.body
>;
export type CreateBranchMaintenanceParamsPayload = z.infer<
    typeof createBranchMaintenanceSchema.params
>;
export type CreateTrainerMaintenanceParamsPayload = z.infer<
    typeof createTrainerMaintenanceSchema.params
>;
export type DeleteBranchMaintenanceParamsPayload = z.infer<typeof branchMaintenanceParamsSchema>;
export type DeleteTrainerMaintenanceParamsPayload = z.infer<typeof trainerMaintenanceParamsSchema>;
export type CreateMaintenanceBodyPayload = z.infer<typeof maintenanceBodySchema>;
export type FetchTrainerAvailabilityQueryPayload = z.infer<
    typeof listTrainerAvailabilitiesSchema.query
>;
