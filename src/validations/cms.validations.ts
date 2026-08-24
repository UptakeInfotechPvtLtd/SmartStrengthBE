import { z } from 'zod';
import { Difficulty, MuscleGroup, VideoSource, VideoStatus } from '../config';
import { validationMessages } from '../lang/api-messages';

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const requiredString = (message: string) =>
    z.string({ error: message }).trim().min(1, { error: message });
const optionalString = (message: string) =>
    z
        .union([z.string({ error: message }).trim(), z.null()])
        .optional()
        .transform((value) => (value === null ? undefined : value));
const booleanSchema = z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .optional()
    .transform((value) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return value;
    });

const targetMuscleSchema = z
    .array(
        requiredString(validationMessages.cms.targetMuscleString).max(100, {
            error: validationMessages.cms.targetMuscleMaxLength,
        }),
    )
    .min(1, { error: validationMessages.cms.targetMuscleRequired });

const videoBodyObjectSchema = z
    .object({
        exerciseName: requiredString(validationMessages.cms.exerciseNameRequired).max(150, {
            error: validationMessages.cms.exerciseNameMaxLength,
        }),
        videoUrl: requiredString(validationMessages.cms.videoUrlRequired).max(1000, {
            error: validationMessages.cms.videoUrlMaxLength,
        }),
        muscleGroup: z.enum(MuscleGroup, { error: validationMessages.cms.muscleGroupInvalid }),
        difficulty: z.enum(Difficulty, { error: validationMessages.cms.difficultyInvalid }),
        videoSource: z.enum(VideoSource, { error: validationMessages.cms.videoSourceInvalid }),
        targetMuscle: targetMuscleSchema,
        status: z.enum(VideoStatus, { error: validationMessages.cms.videoStatusInvalid }),
        membersOnly: z.boolean({ error: validationMessages.cms.membersOnlyBoolean }),
    })
    .strict();

export const createVideoLibrarySchema = {
    body: videoBodyObjectSchema,
};

export const updateVideoLibrarySchema = {
    params: z
        .object({
            id: z.string().refine((value) => uuidRegex.test(value), {
                error: validationMessages.cms.videoIdInvalid,
            }),
        })
        .strict(),
    body: videoBodyObjectSchema.partial().strict(),
};

export const videoLibraryIdSchema = {
    params: updateVideoLibrarySchema.params,
};

export const listVideoLibrarySchema = {
    query: z
        .object({
            page: z.coerce.number().int().positive().optional(),
            pageSize: z.coerce.number().int().positive().max(100).optional(),
            search: optionalString(validationMessages.cms.searchString).pipe(
                z.string().max(255, { error: validationMessages.cms.searchMaxLength }).optional(),
            ),
            muscleGroup: z
                .enum(MuscleGroup, { error: validationMessages.cms.muscleGroupInvalid })
                .optional(),
            difficulty: z
                .enum(Difficulty, { error: validationMessages.cms.difficultyInvalid })
                .optional(),
            status: z
                .enum(VideoStatus, { error: validationMessages.cms.videoStatusInvalid })
                .optional(),
            membersOnly: booleanSchema,
            orderBy: z
                .enum([
                    'exercise_name',
                    'muscle_group',
                    'difficulty',
                    'status',
                    'created_at',
                    'updated_at',
                ])
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

export type CreateVideoLibraryBodyPayload = z.infer<typeof createVideoLibrarySchema.body>;
export type UpdateVideoLibraryBodyPayload = z.infer<typeof updateVideoLibrarySchema.body>;
export type VideoLibraryIdParamsPayload = z.infer<typeof videoLibraryIdSchema.params>;
export type FetchVideoLibraryQueryPayload = z.infer<typeof listVideoLibrarySchema.query>;
