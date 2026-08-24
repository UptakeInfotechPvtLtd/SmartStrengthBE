import { BranchStatus, IPaginationMeta } from '../../../config';
import { BranchEntity } from '../../../utils';

export class BranchResponseDto {
    id!: string;
    branchName!: string;
    mapUrl!: string | null;
    address!: string | null;
    openingTime!: string | null;
    closingTime!: string | null;
    status!: BranchStatus;
    createdAt!: Date;
    updatedAt!: Date;

    constructor(branch?: BranchEntity) {
        this.id = branch?.id || '';
        this.branchName = branch?.branch_name || '';
        this.mapUrl = branch?.map_url || null;
        this.address = branch?.address || null;
        this.openingTime = this.formatTime(branch?.opening_time || null);
        this.closingTime = this.formatTime(branch?.closing_time || null);
        this.status = branch?.status || BranchStatus.Active;
        this.createdAt = branch?.created_at!;
        this.updatedAt = branch?.updated_at!;
    }

    private formatTime(time: string | null): string | null {
        if (!time) {
            return null;
        }

        const [hourValue, minuteValue] = time.split(':');
        const hour = Number(hourValue);
        const suffix = hour >= 12 ? 'PM' : 'AM';
        const displayHour = String(hour % 12 || 12).padStart(2, '0');

        return `${displayHour}:${minuteValue} ${suffix}`;
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
