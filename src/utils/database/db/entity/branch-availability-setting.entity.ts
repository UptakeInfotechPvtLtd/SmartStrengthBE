import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { BranchAvailabilityStatus } from '../../../../config/enum';
import { BranchEntity } from './branch.entity';

@Entity('BranchAvailabilitySettings')
@Index('IDX_branch_availability_settings_branch_unique', ['branch'], {
    unique: true,
    where: `"deleted_at" IS NULL`,
})
@Index('IDX_branch_availability_settings_status', ['status'])
export class BranchAvailabilitySettingEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => BranchEntity, (branch) => branch.availabilitySettings, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'branch_id' })
    branch!: BranchEntity;

    @Column({ type: 'varchar', length: 20, default: BranchAvailabilityStatus.Open })
    status!: BranchAvailabilityStatus;

    @CreateDateColumn({ type: 'timestamp' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at!: Date;

    @DeleteDateColumn({ type: 'timestamp', nullable: true })
    deleted_at!: Date | null;
}
