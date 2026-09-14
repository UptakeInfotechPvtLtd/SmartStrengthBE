import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { BookingEntity } from './booking.entity';
import { PackageEntity } from './package.entity';
import { UserEntity } from './users.entity';

@Entity('UserPackages')
@Index('IDX_user_packages_user_id', ['user'])
@Index('IDX_user_packages_package_id', ['package'])
@Index('IDX_user_packages_purchased_at', ['purchased_at'])
@Index('IDX_user_packages_expired_at', ['expired_at'])
@Index('IDX_user_packages_deleted_at', ['deleted_at'])
@Index('IDX_user_packages_created_at', ['created_at'])
export class UserPackageEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => UserEntity, (user) => user.userPackages, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: UserEntity;

    @ManyToOne(() => PackageEntity, (packageData) => packageData.userPackages, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'package_id' })
    package!: PackageEntity;

    @Column({ type: 'varchar', length: 50 })
    package_type!: string;

    @Column({ type: 'numeric', precision: 10, scale: 2 })
    price!: string;

    @Column({ type: 'int' })
    number_of_sessions!: number;

    @Column({ type: 'int' })
    remaining_sessions!: number;

    @Column({ type: 'int' })
    valid_days!: number;

    @Column({ type: 'timestamp' })
    purchased_at!: Date;

    @Column({ type: 'timestamp' })
    expired_at!: Date;

    @CreateDateColumn({ type: 'timestamp' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at!: Date;

    @DeleteDateColumn({ type: 'timestamp', nullable: true })
    deleted_at!: Date | null;

    @OneToMany(() => BookingEntity, (booking) => booking.userPackage)
    bookings!: BookingEntity[];
}
