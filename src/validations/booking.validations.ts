import { z } from 'zod';
import { BookingListFilter, SortOrder } from '../config/enum';
import { validationMessages } from '../lang/api-messages';

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^(0?[1-9]|1[0-2]):[0-5]\d\s?(AM|PM|am|pm)$|^([01]\d|2[0-3]):[0-5]\d$/;

const requiredString = (message: string) =>
    z.string({ error: message }).trim().min(1, { error: message });

const optionalString = (message: string) =>
    z
        .union([z.string({ error: message }).trim(), z.null()])
        .optional()
        .transform((value) => (value === null ? undefined : value));

const uuidSchema = (message: string) =>
    requiredString(message).refine((value) => uuidRegex.test(value), { error: message });

const timeSchema = (message: string) =>
    requiredString(message).refine((value) => timeRegex.test(value), { error: message });

export const createBookingSchema = {
    body: z
        .object({
            date: requiredString(validationMessages.booking.dateRequired).refine(
                (value) => dateRegex.test(value),
                { error: validationMessages.booking.dateInvalid },
            ),
            sessionId: uuidSchema(validationMessages.booking.sessionIdInvalid),
            branchId: uuidSchema(validationMessages.booking.branchIdInvalid),
            packageId: optionalString(validationMessages.package.packageIdInvalid).pipe(
                z
                    .string()
                    .refine((value) => uuidRegex.test(value), {
                        error: validationMessages.package.packageIdInvalid,
                    })
                    .optional(),
            ),
            startTime: timeSchema(validationMessages.booking.startTimeInvalid),
            endTime: timeSchema(validationMessages.booking.endTimeInvalid),
        })
        .strict(),
};

export const listBookingsSchema = {
    query: z
        .object({
            page: z.coerce.number().int().positive().optional(),
            pageSize: z.coerce.number().int().positive().max(100).optional(),
            search: optionalString(validationMessages.booking.searchString).pipe(
                z
                    .string()
                    .max(255, { error: validationMessages.booking.searchMaxLength })
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
            sessionId: optionalString(validationMessages.booking.sessionIdInvalid).pipe(
                z
                    .string()
                    .refine((value) => uuidRegex.test(value), {
                        error: validationMessages.booking.sessionIdInvalid,
                    })
                    .optional(),
            ),
            date: optionalString(validationMessages.booking.dateInvalid).pipe(
                z
                    .string()
                    .refine((value) => dateRegex.test(value), {
                        error: validationMessages.booking.dateInvalid,
                    })
                    .optional(),
            ),
            status: z
                .enum(BookingListFilter, { error: validationMessages.booking.statusFilterInvalid })
                .optional()
                .default(BookingListFilter.All),
            orderBy: z
                .enum([
                    'booking_date',
                    'start_time',
                    'end_time',
                    'status',
                    'created_at',
                    'updated_at',
                ])
                .optional()
                .default('created_at'),
            order: z
                .enum(SortOrder)
                .optional()
                .default(SortOrder.DESC)
                .transform((value) => value.toUpperCase() as 'ASC' | 'DESC'),
        })
        .strict(),
};

export const bookingIdSchema = {
    params: z
        .object({
            id: uuidSchema(validationMessages.booking.bookingIdInvalid),
        })
        .strict(),
};

export const rescheduleBookingSchema = {
    params: bookingIdSchema.params,
    body: z
        .object({
            startTime: timeSchema(validationMessages.booking.startTimeInvalid),
            endTime: timeSchema(validationMessages.booking.endTimeInvalid),
        })
        .strict(),
};

export type CreateBookingBodyPayload = z.infer<typeof createBookingSchema.body>;
export type BookingIdParamsPayload = z.infer<typeof bookingIdSchema.params>;
export type RescheduleBookingBodyPayload = z.infer<typeof rescheduleBookingSchema.body>;
export type FetchBookingsQueryPayload = z.infer<typeof listBookingsSchema.query>;
