import { z } from 'zod';
import { validationMessages } from '../lang/api-messages';

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const isValidDate = (value: string): boolean => {
    if (!dateRegex.test(value)) {
        return false;
    }

    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

const slotDurationSchema = z
    .preprocess(
        (value) => {
            if (value === undefined || value === null || value === '') {
                return undefined;
            }

            return value;
        },
        z.coerce
            .number({ error: validationMessages.slot.slotDurationInvalid })
            .int({ error: validationMessages.slot.slotDurationInvalid })
            .positive({ error: validationMessages.slot.slotDurationInvalid })
            .optional(),
    )
    .refine((value) => value === undefined || Number.isFinite(value), {
        error: validationMessages.slot.slotDurationInvalid,
    });

export const availableSlotsSchema = {
    query: z
        .object({
            branchId: z.string().refine((value) => uuidRegex.test(value), {
                error: validationMessages.slot.branchIdInvalid,
            }),
            date: z.string({ error: validationMessages.slot.dateRequired }).refine(isValidDate, {
                error: validationMessages.slot.dateInvalid,
            }),
            slotDuration: slotDurationSchema,
        })
        .strict(),
};

export type AvailableSlotsQueryPayload = z.infer<typeof availableSlotsSchema.query>;
