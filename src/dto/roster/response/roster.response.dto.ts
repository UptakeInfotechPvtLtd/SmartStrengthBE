import { RosterDay, RosterStatus } from '../../../config/enum';
import { TrainerRosterEntity } from '../../../utils/database/db/entity';

class RosterBranchResponseDto {
    id!: string;
    branchName!: string;

    constructor(branch?: TrainerRosterEntity['branch']) {
        this.id = branch?.id || '';
        this.branchName = branch?.branch_name || '';
    }
}

class RosterTrainerResponseDto {
    id!: string;
    fullName!: string | null;
    email!: string | null;

    constructor(trainer?: TrainerRosterEntity['trainer']) {
        this.id = trainer?.id || '';
        this.fullName = trainer?.full_name || null;
        this.email = trainer?.email || null;
    }
}

export class RosterResponseDto {
    id!: string;
    dayOfWeek!: RosterDay;
    branch!: RosterBranchResponseDto;
    trainer!: RosterTrainerResponseDto;
    startTime!: string;
    endTime!: string;
    status!: RosterStatus;
    createdAt!: Date;
    updatedAt!: Date;

    constructor(roster?: TrainerRosterEntity) {
        this.id = roster?.id || '';
        this.dayOfWeek = roster?.day_of_week || RosterDay.Monday;
        this.branch = new RosterBranchResponseDto(roster?.branch);
        this.trainer = new RosterTrainerResponseDto(roster?.trainer);
        this.startTime = this.formatTime(roster?.start_time || '');
        this.endTime = this.formatTime(roster?.end_time || '');
        this.status = roster?.status || RosterStatus.Working;
        this.createdAt = roster?.created_at!;
        this.updatedAt = roster?.updated_at!;
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

export class RosterListResponseDto {
    monday!: RosterResponseDto[];
    tuesday!: RosterResponseDto[];
    wednesday!: RosterResponseDto[];
    thursday!: RosterResponseDto[];
    friday!: RosterResponseDto[];
    saturday!: RosterResponseDto[];

    constructor(rosters: TrainerRosterEntity[]) {
        const grouped: Record<RosterDay, RosterResponseDto[]> = {
            [RosterDay.Monday]: [],
            [RosterDay.Tuesday]: [],
            [RosterDay.Wednesday]: [],
            [RosterDay.Thursday]: [],
            [RosterDay.Friday]: [],
            [RosterDay.Saturday]: [],
        };

        rosters.forEach((roster) => {
            grouped[roster.day_of_week].push(new RosterResponseDto(roster));
        });

        this.monday = grouped[RosterDay.Monday];
        this.tuesday = grouped[RosterDay.Tuesday];
        this.wednesday = grouped[RosterDay.Wednesday];
        this.thursday = grouped[RosterDay.Thursday];
        this.friday = grouped[RosterDay.Friday];
        this.saturday = grouped[RosterDay.Saturday];
    }
}
