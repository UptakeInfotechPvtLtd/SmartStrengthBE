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
import { RosterDay, RosterStatus } from '../../../../config/enum';
import { BranchEntity } from './branch.entity';
import { UserEntity } from './users.entity';

@Entity('TrainerRosters')
@Index('IDX_trainer_rosters_branch_id', ['branch'])
@Index('IDX_trainer_rosters_trainer_id', ['trainer'])
@Index('IDX_trainer_rosters_day_of_week', ['day_of_week'])
@Index('IDX_trainer_rosters_status', ['status'])
@Index('IDX_trainer_rosters_time_range', ['start_time', 'end_time'])
@Index('IDX_trainer_rosters_deleted_at', ['deleted_at'])
@Index('IDX_trainer_rosters_created_at', ['created_at'])
export class TrainerRosterEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => BranchEntity, (branch) => branch.trainerRosters, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'branch_id' })
    branch!: BranchEntity;

    @ManyToOne(() => UserEntity, (trainer) => trainer.trainerRosters, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'trainer_id' })
    trainer!: UserEntity;

    @Column({ type: 'varchar', length: 20 })
    day_of_week!: RosterDay;

    @Column({ type: 'time' })
    start_time!: string;

    @Column({ type: 'time' })
    end_time!: string;

    @Column({ type: 'varchar', length: 20, default: RosterStatus.Working })
    status!: RosterStatus;

    @CreateDateColumn({ type: 'timestamp' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at!: Date;

    @DeleteDateColumn({ type: 'timestamp', nullable: true })
    deleted_at!: Date | null;
}
