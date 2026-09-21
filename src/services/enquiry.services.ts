import { BranchStatus } from '../config';
import { EnquiryListResponseDto, EnquiryResponseDto } from '../dto';
import { messages } from '../lang/api-messages';
import { BadRequestException, NotFoundException } from '../utils/error';
import { BranchRepository, EnquiryEntity, EnquiryRepository } from '../utils/database';
import { EmailService } from '../utils/email.service';
import { buildPagination } from '../utils/common.utils';
import { getEnv } from '../utils/env.utils';
import { EmailQueue } from '../utils/rabbitmq';
import {
    CreateEnquiryBodyPayload,
    EnquiryIdParamsPayload,
    FetchEnquiriesQueryPayload,
} from '../validations';

export class EnquiryService {
    constructor(
        private readonly enquiryRepo: EnquiryRepository,
        private readonly branchRepo: BranchRepository,
    ) {}

    async createEnquiry(body: CreateEnquiryBodyPayload): Promise<EnquiryResponseDto> {
        const branch = await this.branchRepo.findBranchById(body.branchId);
        if (!branch) {
            throw new NotFoundException(messages.branchNotFound);
        }
        if (branch.status !== BranchStatus.Active) {
            throw new BadRequestException(messages.enquiryBranchNotActive);
        }

        const { enquiryType, fullName, mobileNumber, email, branchId, ...details } = body;
        const enquiry = await this.enquiryRepo.createEnquiry({
            enquiry_type: enquiryType,
            full_name: fullName,
            email,
            mobile_number: mobileNumber,
            branch,
            details,
        });

        this.publishEnquiryEmail(enquiry);

        return new EnquiryResponseDto(enquiry);
    }

    async getEnquiryById(params: EnquiryIdParamsPayload): Promise<EnquiryResponseDto> {
        const enquiry = await this.enquiryRepo.findEnquiryById(params.id);
        if (!enquiry) {
            throw new NotFoundException(messages.enquiryNotFound);
        }

        return new EnquiryResponseDto(enquiry);
    }

    async listEnquiries(query: FetchEnquiriesQueryPayload): Promise<EnquiryListResponseDto> {
        const { enquiries, total, page, pageSize, offset } =
            await this.enquiryRepo.listEnquiries(query);

        return new EnquiryListResponseDto(
            enquiries,
            buildPagination({ totalResults: total, page, pageSize, offset }),
        );
    }

    private publishEnquiryEmail(enquiry: EnquiryEntity): void {
        const fullName = this.escapeHtml(enquiry.full_name);
        const email = this.escapeHtml(enquiry.email);
        const mobileNumber = this.escapeHtml(enquiry.mobile_number);
        const enquiryType = this.escapeHtml(enquiry.enquiry_type);
        const branchName = this.escapeHtml(enquiry.branch?.branch_name || '');
        const detailsRows = this.buildDetailsRows(enquiry.details || {});
        const html = EmailService.prepareHtml('../templates/email/enquiry.html', {
            enquiryType,
            fullName,
            email,
            mobileNumber,
            branchName,
            detailsRows,
        });

        EmailQueue.publishInBackground({
            to: getEnv('ENQUIRY_EMAIL'),
            subject: `New ${enquiry.enquiry_type} Enquiry`,
            text: this.buildTextEmail(enquiry),
            html,
        });
    }

    private buildDetailsRows(details: Record<string, string | number>): string {
        return Object.entries(details)
            .map(([key, value]) => {
                const label = this.escapeHtml(this.toTitleLabel(key));
                const safeValue = this.escapeHtml(String(value)).replace(/\n/g, '<br />');
                return `<tr><td>${label}</td><td>${safeValue}</td></tr>`;
            })
            .join('');
    }

    private buildTextEmail(enquiry: EnquiryEntity): string {
        const details = Object.entries(enquiry.details || {})
            .map(([key, value]) => `${this.toTitleLabel(key)}: ${value}`)
            .join('\n');

        return [
            `Type: ${enquiry.enquiry_type}`,
            `Name: ${enquiry.full_name}`,
            `Mobile: ${enquiry.mobile_number}`,
            `Email: ${enquiry.email}`,
            `Preferred Center: ${enquiry.branch?.branch_name || ''}`,
            details,
        ]
            .filter(Boolean)
            .join('\n');
    }

    private toTitleLabel(value: string): string {
        return value
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (char) => char.toUpperCase())
            .trim();
    }

    private escapeHtml(value: string): string {
        return value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}
