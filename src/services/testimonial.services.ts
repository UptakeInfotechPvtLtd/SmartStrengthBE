import { IJwtPayload, Roles, TestimonialStatus, UserStatus } from '../config';
import { TestimonialListResponseDto, TestimonialResponseDto } from '../dto';
import { messages } from '../lang/api-messages';
import { BadRequestException, NotFoundException, UnauthorizedException } from '../utils/error';
import { TestimonialRepository, UserEntity, UserRepository } from '../utils/database';
import { buildPagination } from '../utils/common.utils';
import {
    CreateTestimonialBodyPayload,
    FetchTestimonialsQueryPayload,
    TestimonialIdParamsPayload,
    UpdateTestimonialStatusBodyPayload,
} from '../validations';

export class TestimonialService {
    constructor(
        private readonly testimonialRepo: TestimonialRepository,
        private readonly userRepo: UserRepository,
    ) {}

    async createTestimonial(
        body: CreateTestimonialBodyPayload,
        authUser: IJwtPayload,
    ): Promise<TestimonialResponseDto> {
        const user = await this.userRepo.findUserByIdWithRole(authUser.userId);
        this.ensureNormalActiveUser(user);

        const testimonial = await this.testimonialRepo.createTestimonial({
            user: user!,
            rating_count: body.ratingCount,
            experience: body.yourExperience || null,
            status: TestimonialStatus.Pending,
        });

        return new TestimonialResponseDto(testimonial);
    }

    async listTestimonials(
        query: FetchTestimonialsQueryPayload,
    ): Promise<TestimonialListResponseDto> {
        const { testimonials, total, page, pageSize, offset } =
            await this.testimonialRepo.listTestimonials(query);

        return new TestimonialListResponseDto(
            testimonials,
            buildPagination({ totalResults: total, page, pageSize, offset }),
        );
    }

    async listApprovedTestimonials(
        query: FetchTestimonialsQueryPayload,
    ): Promise<TestimonialListResponseDto> {
        const { testimonials, total, page, pageSize, offset } =
            await this.testimonialRepo.listTestimonials(query, true);

        return new TestimonialListResponseDto(
            testimonials,
            buildPagination({ totalResults: total, page, pageSize, offset }),
        );
    }

    async updateTestimonialStatus(
        params: TestimonialIdParamsPayload,
        body: UpdateTestimonialStatusBodyPayload,
    ): Promise<TestimonialResponseDto> {
        const testimonial = await this.getTestimonial(params.id);
        testimonial.status = body.status;

        return new TestimonialResponseDto(
            await this.testimonialRepo.updateTestimonial(testimonial),
        );
    }

    async deleteTestimonial(params: TestimonialIdParamsPayload): Promise<void> {
        const testimonial = await this.getTestimonial(params.id);
        await this.testimonialRepo.softDeleteTestimonial(testimonial.id);
    }

    private async getTestimonial(id?: string) {
        const testimonial = await this.testimonialRepo.findTestimonialById(id);
        if (!testimonial) {
            throw new NotFoundException(messages.testimonialNotFound);
        }

        return testimonial;
    }

    private ensureNormalActiveUser(user: UserEntity | null): void {
        if (!user) {
            throw new NotFoundException(messages.userNotFound);
        }

        if (user.status !== UserStatus.Active) {
            throw new BadRequestException(messages.userIsNotActive);
        }

        if (user.role?.name !== Roles.User) {
            throw new UnauthorizedException(messages.onlyNormalUserCanSubmitTestimonial);
        }
    }
}
