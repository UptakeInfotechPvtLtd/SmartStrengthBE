import { BranchAvailabilityStatus, TrainerAvailabilityStatus } from '../../../config/enum';
import { IPaginationMeta } from '../../../config/interface';
import {
    BranchMaintenanceEntity,
    BranchAvailabilitySettingEntity,
    TrainerAvailabilityEntity,
    TrainerMaintenanceEntity,
} from '../../../utils/database/db/entity';
import { BranchResponseDto } from '../../branch';

class TrainerSummaryDto {
    id!: string;
    fullName!: string | null;
    email!: string | null;
    branches!: BranchResponseDto[];

    constructor(trainer?: TrainerAvailabilityEntity['trainer']) {
        this.id = trainer?.id || '';
        this.fullName = trainer?.full_name || null;
        this.email = trainer?.email || null;
        this.branches =
            trainer?.userBranches
                ?.map((userBranch) =>
                    userBranch?.branch ? new BranchResponseDto(userBranch.branch) : null,
                )
                .filter((branch): branch is BranchResponseDto => Boolean(branch)) || [];
    }
}

export class BranchAvailabilityStatusResponseDto {
    id!: string;
    branch!: BranchResponseDto;
    status!: BranchAvailabilityStatus;
    createdAt!: Date;
    updatedAt!: Date;

    constructor(availabilitySetting?: BranchAvailabilitySettingEntity) {
        this.id = availabilitySetting?.id || '';
        this.branch = new BranchResponseDto(availabilitySetting?.branch);
        this.status = availabilitySetting?.status || BranchAvailabilityStatus.Open;
        this.createdAt = availabilitySetting?.created_at!;
        this.updatedAt = availabilitySetting?.updated_at!;
    }
}

export class TrainerAvailabilityResponseDto {
    id!: string;
    trainer!: TrainerSummaryDto;
    status!: TrainerAvailabilityStatus;
    createdAt!: Date;
    updatedAt!: Date;

    constructor(availability?: TrainerAvailabilityEntity) {
        this.id = availability?.id || availability?.trainer?.id || '';
        this.trainer = new TrainerSummaryDto(availability?.trainer);
        this.status = availability?.status || TrainerAvailabilityStatus.Available;
        this.createdAt = availability?.created_at!;
        this.updatedAt = availability?.updated_at!;
    }
}

export class MaintenanceResponseDto {
    id!: string;
    date!: string;
    timeFrom!: string;
    timeTo!: string;
    reason!: string;
    createdAt!: Date;
    updatedAt!: Date;

    constructor(maintenance?: BranchMaintenanceEntity | TrainerMaintenanceEntity) {
        this.id = maintenance?.id || '';
        this.date = maintenance?.maintenance_date || '';
        this.timeFrom = this.formatTime(maintenance?.time_from || '');
        this.timeTo = this.formatTime(maintenance?.time_to || '');
        this.reason = maintenance?.reason || '';
        this.createdAt = maintenance?.created_at!;
        this.updatedAt = maintenance?.updated_at!;
    }

    private formatTime(time: string): string {
        if (!time) {
            return '';
        }

        const [hourValue, minuteValue] = time.split(':');
        const hour = Number(hourValue);
        const suffix = hour >= 12 ? 'PM' : 'AM';
        const displayHour = String(hour % 12 || 12).padStart(2, '0');

        return `${displayHour}:${minuteValue} ${suffix}`;
    }
}

export class TrainerAvailabilityListResponseDto {
    results!: TrainerAvailabilityResponseDto[];
    pagination!: IPaginationMeta;

    constructor(rows: TrainerAvailabilityEntity[], pagination: IPaginationMeta) {
        this.results = rows.map((row) => new TrainerAvailabilityResponseDto(row));
        this.pagination = pagination;
    }
}

export class MaintenanceListResponseDto {
    results!: MaintenanceResponseDto[];

    constructor(rows: (BranchMaintenanceEntity | TrainerMaintenanceEntity)[]) {
        this.results = rows.map((row) => new MaintenanceResponseDto(row));
    }
}
