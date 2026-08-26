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
import { UserEntity } from './users.entity';

@Entity('TrainerMaintenances')
@Index('IDX_trainer_maintenances_trainer_date', ['trainer', 'maintenance_date'])
@Index('IDX_trainer_maintenances_time_range', ['time_from', 'time_to'])
export class TrainerMaintenanceEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'trainer_id' })
    trainer!: UserEntity;

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
