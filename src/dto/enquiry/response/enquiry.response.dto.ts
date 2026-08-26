import { IPaginationMeta } from '../../../config';
import { EnquiryEntity } from '../../../utils';

export class EnquiryResponseDto {
    id!: string;
    enquiryType!: string;
    fullName!: string;
    mobileNumber!: string;
    email!: string;
    branch!: { id: string; branchName: string } | null;
    details!: Record<string, string | number>;
    createdAt!: Date;
    updatedAt!: Date;

    constructor(enquiry?: EnquiryEntity) {
        this.id = enquiry?.id || '';
        this.enquiryType = enquiry?.enquiry_type || '';
        this.fullName = enquiry?.full_name || '';
        this.mobileNumber = enquiry?.mobile_number || '';
        this.email = enquiry?.email || '';
        this.branch = enquiry?.branch
            ? {
                  id: enquiry.branch.id,
                  branchName: enquiry.branch.branch_name,
              }
            : null;
        this.details = enquiry?.details || {};
        this.createdAt = enquiry?.created_at!;
        this.updatedAt = enquiry?.updated_at!;
    }
}

export class EnquiryListResponseDto {
    results!: EnquiryResponseDto[];
    pagination!: IPaginationMeta;

    constructor(enquiries: EnquiryEntity[], pagination: IPaginationMeta) {
        this.results = enquiries.map((enquiry) => new EnquiryResponseDto(enquiry));
        this.pagination = pagination;
    }
}
