import { IPaginationMeta } from '../../../config';
import { BranchEntity } from '../../../utils';

export class BranchResponseDto {
    id!: string;
    name!: string;
    contactNumber!: string | null;
    mapLink!: string | null;
    address!: string | null;
    openingTime!: string | null;
    closingTime!: string | null;
    branchImages!: string[];
    status!: boolean;
    createdAt!: Date;
    updatedAt!: Date;

    constructor(branch: BranchEntity) {
        this.id = branch.id;
        this.name = branch.name;
        this.contactNumber = branch.contact_number;
        this.mapLink = branch.map_link;
        this.address = branch.address;
        this.openingTime = branch.opening_time;
        this.closingTime = branch.closing_time;
        this.branchImages = branch.branch_images || [];
        this.status = branch.status;
        this.createdAt = branch.created_at;
        this.updatedAt = branch.updated_at;
    }
}

export class BranchListResponseDto {
    results!: BranchResponseDto[];
    pagination!: IPaginationMeta;

    constructor(branches: BranchEntity[], pagination: IPaginationMeta) {
        this.results = branches.map((branch) => new BranchResponseDto(branch));
        this.pagination = pagination;
    }
}
