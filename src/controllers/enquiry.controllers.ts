import { IAuthenticatedRequest } from '../config';
import { BaseResponseDto } from '../dto';
import { messages } from '../lang/api-messages';
import { EnquiryService } from '../services';
import {
    CreateEnquiryBodyPayload,
    EnquiryIdParamsPayload,
    FetchEnquiriesQueryPayload,
} from '../validations';

export class EnquiryController {
    constructor(private readonly enquiryService: EnquiryService) {
        this.createEnquiry = this.createEnquiry.bind(this);
        this.getEnquiryById = this.getEnquiryById.bind(this);
        this.listEnquiries = this.listEnquiries.bind(this);
    }

    async createEnquiry(req: IAuthenticatedRequest<any, CreateEnquiryBodyPayload>) {
        const result = await this.enquiryService.createEnquiry(req.body);
        return new BaseResponseDto(messages.enquirySentSuccessfully, result);
    }

    async getEnquiryById(req: IAuthenticatedRequest<EnquiryIdParamsPayload>) {
        const result = await this.enquiryService.getEnquiryById(req.params);
        return new BaseResponseDto('', result);
    }

    async listEnquiries(req: IAuthenticatedRequest<any, any, FetchEnquiriesQueryPayload>) {
        const result = await this.enquiryService.listEnquiries(req.query);
        return new BaseResponseDto('', result);
    }
}
