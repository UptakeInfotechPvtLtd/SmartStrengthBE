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
import { BookingStatus } from '../../../../config/enum';
import { BranchEntity } from './branch.entity';
import { SessionEntity } from './session.entity';
import { UserPackageEntity } from './user-package.entity';
import { UserEntity } from './users.entity';

@Entity('Bookings')
@Index('IDX_bookings_user_id', ['user'])
@Index('IDX_bookings_branch_id', ['branch'])
@Index('IDX_bookings_trainer_id', ['trainer'])
@Index('IDX_bookings_session_id', ['session'])
@Index('IDX_bookings_user_package_id', ['userPackage'])
@Index('IDX_bookings_booking_date', ['booking_date'])
@Index('IDX_bookings_status', ['status'])
@Index('IDX_bookings_time_range', ['start_time', 'end_time'])
@Index('IDX_bookings_deleted_at', ['deleted_at'])
@Index('IDX_bookings_created_at', ['created_at'])
export class BookingEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => UserEntity, (user) => user.bookings, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: UserEntity;

    @ManyToOne(() => SessionEntity, (session) => session.bookings, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'session_id' })
    session!: SessionEntity;

    @ManyToOne(() => BranchEntity, (branch) => branch.bookings, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'branch_id' })
    branch!: BranchEntity;

    @ManyToOne(() => UserEntity, (trainer) => trainer.trainerBookings, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'trainer_id' })
    trainer!: UserEntity;

    @ManyToOne(() => UserPackageEntity, (userPackage) => userPackage.bookings, {
        nullable: true,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'user_package_id' })
    userPackage!: UserPackageEntity | null;

    @Column({ type: 'date' })
    booking_date!: string;

    @Column({ type: 'time' })
    start_time!: string;

    @Column({ type: 'time' })
    end_time!: string;

    @Column({ type: 'varchar', length: 20, default: BookingStatus.Confirmed })
    status!: BookingStatus;

    @Column({ type: 'boolean', default: false })
    is_direct_booking!: boolean;

    @Column({ type: 'timestamp', nullable: true })
    cancelled_at!: Date | null;

    @Column({ type: 'timestamp', nullable: true })
    rescheduled_at!: Date | null;

    @CreateDateColumn({ type: 'timestamp' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at!: Date;

    @DeleteDateColumn({ type: 'timestamp', nullable: true })
    deleted_at!: Date | null;
}
