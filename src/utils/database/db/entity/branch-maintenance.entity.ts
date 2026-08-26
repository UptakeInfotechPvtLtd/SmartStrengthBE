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
import { BranchEntity } from './branch.entity';

@Entity('BranchMaintenances')
@Index('IDX_branch_maintenances_branch_date', ['branch', 'maintenance_date'])
@Index('IDX_branch_maintenances_time_range', ['time_from', 'time_to'])
export class BranchMaintenanceEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => BranchEntity, (branch) => branch.maintenances, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'branch_id' })
    branch!: BranchEntity;

    @Column({ type: 'date' })
    maintenance_date!: string;

    @Column({ type: 'time' })
    time_from!: string;

    @Column({ type: 'time' })
    time_to!: string;

    @Column({ type: 'varchar', length: 500 })
    reason!: string;

    @CreateDateColumn({ type: 'timestamp' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at!: Date;

    @DeleteDateColumn({ type: 'timestamp', nullable: true })
    deleted_at!: Date | null;
}
