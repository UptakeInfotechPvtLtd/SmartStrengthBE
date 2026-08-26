import { BranchAvailabilityStatus, BranchStatus } from '../../../config/enum';
import { IPaginationMeta } from '../../../config/interface';
import { BranchEntity } from '../../../utils/database/db/entity';

export class BranchMaintenanceResponseDto {
    id!: string;
    date!: string;
    timeFrom!: string | null;
    timeTo!: string | null;
    reason!: string;
    createdAt!: Date;
    updatedAt!: Date;

    constructor(maintenance?: BranchEntity['maintenances'][number]) {
        this.id = maintenance?.id || '';
        this.date = maintenance?.maintenance_date || '';
        this.timeFrom = this.formatTime(maintenance?.time_from || null);
        this.timeTo = this.formatTime(maintenance?.time_to || null);
        this.reason = maintenance?.reason || '';
        this.createdAt = maintenance?.created_at!;
        this.updatedAt = maintenance?.updated_at!;
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

export class BranchResponseDto {
    id!: string;
    branchName!: string;
    mapUrl!: string | null;
    address!: string | null;
    openingTime!: string | null;
    closingTime!: string | null;
    status!: BranchStatus;
    branchAvailabilityStatus!: BranchAvailabilityStatus;
    futureMaintenances!: BranchMaintenanceResponseDto[];
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
        this.branchAvailabilityStatus =
            branch?.availabilitySettings?.[0]?.status || BranchAvailabilityStatus.Open;
        this.futureMaintenances =
            branch?.maintenances?.map(
                (maintenance) => new BranchMaintenanceResponseDto(maintenance),
            ) || [];
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
