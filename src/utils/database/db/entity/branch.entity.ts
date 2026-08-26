import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    Index,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { BranchStatus } from '../../../../config/enum';
import { BranchAvailabilitySettingEntity } from './branch-availability-setting.entity';
import { BranchMaintenanceEntity } from './branch-maintenance.entity';
import { EnquiryEntity } from './enquiry.entity';
import { SessionBranchEntity } from './session-branch.entity';
import { TrainerRosterEntity } from './trainer-roster.entity';
import { UserBranchEntity } from './user-branch.entity';

@Entity('Branches')
@Index('IDX_branches_branch_name', ['branch_name'])
@Index('IDX_branches_status', ['status'])
@Index('IDX_branches_deleted_at', ['deleted_at'])
@Index('IDX_branches_created_at', ['created_at'])
export class BranchEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 150 })
    branch_name!: string;

    @Column({ type: 'text', nullable: true })
    map_url!: string | null;

    @Column({ type: 'text', nullable: true })
    address!: string | null;

    @Column({ type: 'time', nullable: true })
    opening_time!: string | null;

    @Column({ type: 'time', nullable: true })
    closing_time!: string | null;

    @Column({ type: 'varchar', length: 30, default: BranchStatus.Active })
    status!: BranchStatus;

    @CreateDateColumn({ type: 'timestamp' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at!: Date;

    @DeleteDateColumn({ type: 'timestamp', nullable: true })
    deleted_at!: Date | null;

    @OneToMany(() => UserBranchEntity, (userBranch) => userBranch.branch, { cascade: true })
    userBranches!: UserBranchEntity[];

    @OneToMany(() => SessionBranchEntity, (sessionBranch) => sessionBranch.branch, {
        cascade: true,
    })
    sessionBranches!: SessionBranchEntity[];

    @OneToMany(
        () => BranchAvailabilitySettingEntity,
        (availabilitySetting) => availabilitySetting.branch,
    )
    availabilitySettings!: BranchAvailabilitySettingEntity[];

    @OneToMany(() => BranchMaintenanceEntity, (maintenance) => maintenance.branch)
    maintenances!: BranchMaintenanceEntity[];

    @OneToMany(() => TrainerRosterEntity, (trainerRoster) => trainerRoster.branch)
    trainerRosters!: TrainerRosterEntity[];

    @OneToMany(() => EnquiryEntity, (enquiry) => enquiry.branch)
    enquiries!: EnquiryEntity[];
}
