import { z } from 'zod';
import { RosterDay, RosterStatus } from '../config/enum';
import { validationMessages } from '../lang/api-messages';

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const timeRegex = /^(0?[1-9]|1[0-2]):([0-5]\d)\s?(AM|PM)$/i;

const requiredString = (message: string) =>
    z.string({ error: message }).trim().min(1, { error: message });

const uuidSchema = (message: string) =>
    requiredString(message).refine((value) => uuidRegex.test(value), { error: message });

const formatTimeForDb = (value: string): string => {
    const [, hourValue, minuteValue, suffix] = value.match(timeRegex)!;
    const hour = Number(hourValue);
    const normalizedHour =
        suffix.toUpperCase() === 'PM' ? (hour === 12 ? 12 : hour + 12) : hour === 12 ? 0 : hour;

    return `${String(normalizedHour).padStart(2, '0')}:${minuteValue}`;
};

const timeSchema = (message: string) =>
    requiredString(message).regex(timeRegex, { error: message }).transform(formatTimeForDb);

const rosterEntryObjectSchema = z
    .object({
        dayOfWeek: z.enum(RosterDay, { error: validationMessages.roster.dayOfWeekInvalid }),
        branchId: uuidSchema(validationMessages.roster.branchIdInvalid),
        trainerId: uuidSchema(validationMessages.roster.trainerIdInvalid),
        startTime: timeSchema(validationMessages.roster.startTimeInvalid),
        endTime: timeSchema(validationMessages.roster.endTimeInvalid),
    })
    .strict();

const rosterEntrySchema = rosterEntryObjectSchema.refine((body) => body.startTime < body.endTime, {
    error: validationMessages.roster.startTimeBeforeEndTime,
    path: ['endTime'],
});

export const createRosterSchema = {
    body: z
        .object({
            rosters: z
                .array(rosterEntrySchema, { error: validationMessages.roster.rostersRequired })
                .min(1, { error: validationMessages.roster.rostersRequired }),
        })
        .strict(),
};

const rosterParamsSchema = z
    .object({
        id: uuidSchema(validationMessages.roster.rosterIdInvalid),
    })
    .strict();

export const updateRosterStatusSchema = {
    body: z
        .object({
            dayOfWeek: z.enum(RosterDay, { error: validationMessages.roster.dayOfWeekInvalid }),
            status: z.enum(RosterStatus, { error: validationMessages.roster.statusInvalid }),
        })
        .strict(),
};

export const rosterIdSchema = {
    params: rosterParamsSchema,
};

export const listRostersSchema = {
    query: z.object({}).strict(),
};

export type CreateRosterBodyPayload = z.infer<typeof createRosterSchema.body>;
export type RosterIdParamsPayload = z.infer<typeof rosterIdSchema.params>;
export type UpdateRosterStatusBodyPayload = z.infer<typeof updateRosterStatusSchema.body>;
