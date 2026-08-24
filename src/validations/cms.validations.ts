import { z } from 'zod';
import { VideoSource, VideoStatus } from '../config';
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

const videoBodyObjectSchema = z
    .object({
        title: requiredString(validationMessages.cms.titleRequired).max(150, {
            error: validationMessages.cms.titleMaxLength,
        }),
        targetMuscleGroup: requiredString(validationMessages.cms.targetMuscleGroupRequired).max(
            150,
            {
                error: validationMessages.cms.targetMuscleGroupMaxLength,
            },
        ),
        description: requiredString(validationMessages.cms.descriptionRequired).max(5000, {
            error: validationMessages.cms.descriptionMaxLength,
        }),
        guidline: requiredString(validationMessages.cms.guidlineRequired).max(5000, {
            error: validationMessages.cms.guidlineMaxLength,
        }),
        videoSource: z.enum(VideoSource, { error: validationMessages.cms.videoSourceInvalid }),
        videoUrl: z
            .url({ error: validationMessages.cms.videoUrlInvalid })
            .max(1000, { error: validationMessages.cms.videoUrlMaxLength }),
        activeMemberOnly: z.boolean({ error: validationMessages.cms.activeMemberOnlyBoolean }),
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

export const updateVideoLibraryStatusSchema = {
    params: updateVideoLibrarySchema.params,
    body: z
        .object({
            status: z.enum(VideoStatus, { error: validationMessages.cms.videoStatusInvalid }),
        })
        .strict(),
};

export const listVideoLibrarySchema = {
    query: z
        .object({
            page: z.coerce.number().int().positive().optional(),
            pageSize: z.coerce.number().int().positive().max(100).optional(),
            search: optionalString(validationMessages.cms.searchString).pipe(
                z.string().max(255, { error: validationMessages.cms.searchMaxLength }).optional(),
            ),
            targetMuscleGroup: optionalString(validationMessages.cms.targetMuscleGroupString).pipe(
                z
                    .string()
                    .max(150, { error: validationMessages.cms.targetMuscleGroupMaxLength })
                    .optional(),
            ),
            status: z
                .enum(VideoStatus, { error: validationMessages.cms.videoStatusInvalid })
                .optional(),
            activeMemberOnly: booleanSchema,
            orderBy: z
                .enum(['title', 'target_muscle_group', 'status', 'created_at', 'updated_at'])
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
export type UpdateVideoLibraryStatusBodyPayload = z.infer<
    typeof updateVideoLibraryStatusSchema.body
>;
export type VideoLibraryIdParamsPayload = z.infer<typeof videoLibraryIdSchema.params>;
export type FetchVideoLibraryQueryPayload = z.infer<typeof listVideoLibrarySchema.query>;
