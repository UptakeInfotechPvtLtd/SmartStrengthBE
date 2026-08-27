import { z } from 'zod';
import { TestimonialStatus } from '../config';
import { validationMessages } from '../lang/api-messages';

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const optionalString = (message: string) =>
    z
        .union([z.string({ error: message }).trim(), z.null()])
        .optional()
        .transform((value) => (value === null || value === '' ? undefined : value));

export const createTestimonialSchema = {
    body: z
        .object({
            ratingCount: z.coerce
                .number({ error: validationMessages.testimonial.ratingCountNumber })
                .int({ error: validationMessages.testimonial.ratingCountInteger })
                .min(1, { error: validationMessages.testimonial.ratingCountMin })
                .max(5, { error: validationMessages.testimonial.ratingCountMax }),
            yourExperience: optionalString(
                validationMessages.testimonial.yourExperienceString,
            ).pipe(
                z
                    .string()
                    .max(5000, {
                        error: validationMessages.testimonial.yourExperienceMaxLength,
                    })
                    .optional(),
            ),
        })
        .strict(),
};

export const testimonialIdSchema = {
    params: z
        .object({
            id: z.string().refine((value) => uuidRegex.test(value), {
                error: validationMessages.testimonial.testimonialIdInvalid,
            }),
        })
        .strict(),
};

export const updateTestimonialStatusSchema = {
    params: testimonialIdSchema.params,
    body: z
        .object({
            status: z.enum([TestimonialStatus.Approved, TestimonialStatus.Rejected], {
                error: validationMessages.testimonial.statusInvalid,
            }),
        })
        .strict(),
};

export const listTestimonialsSchema = {
    query: z
        .object({
            page: z.coerce.number().int().positive().optional(),
            pageSize: z.coerce.number().int().positive().max(100).optional(),
            search: optionalString(validationMessages.testimonial.searchString).pipe(
                z
                    .string()
                    .max(255, { error: validationMessages.testimonial.searchMaxLength })
                    .optional(),
            ),
            status: z
                .enum(TestimonialStatus, { error: validationMessages.testimonial.statusInvalid })
                .optional(),
            orderBy: z
                .enum(['rating_count', 'status', 'created_at', 'updated_at'])
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

export type CreateTestimonialBodyPayload = z.infer<typeof createTestimonialSchema.body>;
export type TestimonialIdParamsPayload = z.infer<typeof testimonialIdSchema.params>;
export type UpdateTestimonialStatusBodyPayload = z.infer<
    typeof updateTestimonialStatusSchema.body
>;
export type FetchTestimonialsQueryPayload = z.infer<typeof listTestimonialsSchema.query>;
