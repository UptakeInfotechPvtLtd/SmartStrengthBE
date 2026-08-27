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
import { TestimonialStatus } from '../../../../config/enum';
import { UserEntity } from './users.entity';

@Entity('Testimonials')
@Index('IDX_testimonials_user_id', ['user'])
@Index('IDX_testimonials_status', ['status'])
@Index('IDX_testimonials_deleted_at', ['deleted_at'])
@Index('IDX_testimonials_created_at', ['created_at'])
export class TestimonialEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => UserEntity, (user) => user.testimonials, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'user_id' })
    user!: UserEntity;

    @Column({ type: 'int' })
    rating_count!: number;

    @Column({ type: 'text', nullable: true })
    experience!: string | null;

    @Column({ type: 'varchar', length: 20, default: TestimonialStatus.Pending })
    status!: TestimonialStatus;

    @CreateDateColumn({ type: 'timestamp' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at!: Date;

    @DeleteDateColumn({ type: 'timestamp', nullable: true })
    deleted_at!: Date | null;
}
