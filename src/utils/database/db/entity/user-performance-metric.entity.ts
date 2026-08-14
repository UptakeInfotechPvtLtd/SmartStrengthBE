import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { PerformanceMetricValues, UserEntity } from './users.entity';

@Entity('UserPerformanceMetrics')
@Index('IDX_user_performance_metrics_user_id', ['user'])
@Index('IDX_user_performance_metrics_metric_date', ['metric_date'])
@Index('IDX_user_performance_metrics_user_date_unique', ['user', 'metric_date'], { unique: true })
export class UserPerformanceMetricEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => UserEntity, (user) => user.performanceMetrics, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: UserEntity;

    @Column({ type: 'date' })
    metric_date!: string;

    @Column({ type: 'jsonb' })
    metrics!: PerformanceMetricValues;

    @CreateDateColumn({ type: 'timestamp' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at!: Date;
}
