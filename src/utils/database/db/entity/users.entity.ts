import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    OneToMany,
    Index,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
} from 'typeorm';
import { Gender, UserType } from '../../../../config';
import { RoleEntity } from './roles.entity';
import { BackListTokenEntity } from './back.list.token.entity';
import { UserBranchEntity } from './user-branch.entity';

export interface PerformanceMetrics {
    sprintTime30m: string;
    verticalJump: string;
    gripStrength: string;
    vo2MaxEstimate: string;
    bodyFatPercentage: string;
}

@Entity('Users')
@Index('IDX_users_email_active_unique', ['email'], {
    unique: true,
    where: `"deleted_at" IS NULL`,
})
@Index('IDX_users_status', ['status'])
@Index('IDX_users_deleted_at', ['deleted_at'])
@Index('IDX_users_role', ['role'])
@Index('IDX_users_full_name', ['full_name'])
@Index('IDX_users_phone_no', ['phone_no'])
@Index('IDX_users_created_at', ['created_at'])
export class UserEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 200, nullable: true })
    full_name!: string | null;

    @Column({ type: 'varchar', length: 255 })
    email!: string;

    @Column({ type: 'varchar', length: 400, nullable: true })
    password!: string | null;

    @Column({ type: 'int', nullable: true })
    age!: number | null;

    @Column({ type: 'varchar', length: 10, nullable: true })
    gender!: Gender | null;

    @Column({ type: 'varchar', length: 20, nullable: true })
    phone_no!: string | null;

    @Column({ type: 'varchar', length: 20, nullable: true })
    user_type!: UserType | null;

    @Column({ type: 'jsonb', nullable: true })
    performance_metrics!: PerformanceMetrics | null;

    @Column({ type: 'boolean', default: false })
    is_terms_agreed!: boolean;

    @Column({ type: 'varchar', length: 10, nullable: true })
    signup_otp!: string | null;

    @Column({ type: 'timestamp', nullable: true })
    signup_otp_expires_at!: Date | null;

    @Column({ type: 'int', default: 0 })
    signup_otp_resend_attempts!: number;

    @Column({ type: 'timestamp', nullable: true })
    signup_otp_locked_until!: Date | null;

    @Column({ type: 'boolean', default: false })
    is_email_verified!: boolean;

    @Column({ type: 'boolean', default: true })
    status!: boolean;

    @Column({ type: 'varchar', length: 10, nullable: true })
    forgot_password_otp!: string | null;

    @Column({ type: 'timestamp', nullable: true })
    forgot_password_otp_expires_at!: Date | null;

    @Column({ type: 'int', default: 0 })
    forgot_password_otp_attempts!: number;

    @Column({ type: 'timestamp', nullable: true })
    forgot_password_otp_locked_until!: Date | null;

    @Column({ type: 'boolean', default: false })
    is_forgot_password_otp_verified!: boolean;

    @Column({ type: 'timestamp', nullable: true })
    forgot_password_otp_verified_until!: Date | null;

    // timestamps
    @CreateDateColumn({ type: 'timestamp' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at!: Date;

    @DeleteDateColumn({ type: 'timestamp', nullable: true })
    deleted_at!: Date | null;

    @OneToMany(() => BackListTokenEntity, (backListToken) => backListToken.user)
    backListTokens!: BackListTokenEntity[];

    @ManyToOne(() => RoleEntity, (role) => role.users, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'role_id' })
    role!: RoleEntity | null;

    @OneToMany(() => UserBranchEntity, (userBranch) => userBranch.user, { cascade: true })
    userBranches!: UserBranchEntity[];
}
