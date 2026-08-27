import { IPaginationMeta, TestimonialStatus } from '../../../config';
import { TestimonialEntity } from '../../../utils';

export class TestimonialResponseDto {
    id!: string;
    user!: { id: string; fullName: string; email: string } | null;
    ratingCount!: number;
    yourExperience!: string | null;
    status!: TestimonialStatus;
    createdAt!: Date;
    updatedAt!: Date;

    constructor(testimonial?: TestimonialEntity) {
        this.id = testimonial?.id || '';
        this.user = testimonial?.user
            ? {
                  id: testimonial.user.id,
                  fullName: testimonial.user.full_name || '',
                  email: testimonial.user.email || '',
              }
            : null;
        this.ratingCount = testimonial?.rating_count || 0;
        this.yourExperience = testimonial?.experience || null;
        this.status = testimonial?.status || TestimonialStatus.Pending;
        this.createdAt = testimonial?.created_at!;
        this.updatedAt = testimonial?.updated_at!;
    }
}

export class TestimonialListResponseDto {
    results!: TestimonialResponseDto[];
    pagination!: IPaginationMeta;

    constructor(testimonials: TestimonialEntity[], pagination: IPaginationMeta) {
        this.results = testimonials.map((testimonial) => new TestimonialResponseDto(testimonial));
        this.pagination = pagination;
    }
}
