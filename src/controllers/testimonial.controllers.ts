import { IAuthenticatedRequest } from '../config';
import { BaseResponseDto } from '../dto';
import { messages } from '../lang/api-messages';
import { TestimonialService } from '../services';
import {
    CreateTestimonialBodyPayload,
    FetchTestimonialsQueryPayload,
    TestimonialIdParamsPayload,
    UpdateTestimonialStatusBodyPayload,
} from '../validations';

export class TestimonialController {
    constructor(private readonly testimonialService: TestimonialService) {
        this.createTestimonial = this.createTestimonial.bind(this);
        this.listTestimonials = this.listTestimonials.bind(this);
        this.listApprovedTestimonials = this.listApprovedTestimonials.bind(this);
        this.updateTestimonialStatus = this.updateTestimonialStatus.bind(this);
        this.deleteTestimonial = this.deleteTestimonial.bind(this);
    }

    async createTestimonial(req: IAuthenticatedRequest<any, CreateTestimonialBodyPayload>) {
        const result = await this.testimonialService.createTestimonial(req.body, req.user);
        return new BaseResponseDto(messages.testimonialSubmittedSuccessfully, result);
    }

    async listTestimonials(req: IAuthenticatedRequest<any, any, FetchTestimonialsQueryPayload>) {
        const result = await this.testimonialService.listTestimonials(req.query);
        return new BaseResponseDto(messages.testimonialsFetchedSuccessfully, result);
    }

    async listApprovedTestimonials(
        req: IAuthenticatedRequest<any, any, FetchTestimonialsQueryPayload>,
    ) {
        const result = await this.testimonialService.listApprovedTestimonials(req.query);
        return new BaseResponseDto(messages.testimonialsFetchedSuccessfully, result);
    }

    async updateTestimonialStatus(
        req: IAuthenticatedRequest<
            TestimonialIdParamsPayload,
            UpdateTestimonialStatusBodyPayload
        >,
    ) {
        const result = await this.testimonialService.updateTestimonialStatus(
            req.params,
            req.body,
        );
        return new BaseResponseDto(messages.testimonialStatusUpdatedSuccessfully, result);
    }

    async deleteTestimonial(req: IAuthenticatedRequest<TestimonialIdParamsPayload>) {
        await this.testimonialService.deleteTestimonial(req.params);
        return new BaseResponseDto(messages.testimonialDeletedSuccessfully);
    }
}
