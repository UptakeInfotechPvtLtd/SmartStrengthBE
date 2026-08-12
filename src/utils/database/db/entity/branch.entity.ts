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
import { SessionBranchEntity } from './session-branch.entity';
import { UserBranchEntity } from './user-branch.entity';

@Entity('Branches')
@Index('IDX_branches_name', ['name'])
@Index('IDX_branches_status', ['status'])
@Index('IDX_branches_deleted_at', ['deleted_at'])
@Index('IDX_branches_created_at', ['created_at'])
export class BranchEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 150 })
    name!: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    contact_number!: string | null;

    @Column({ type: 'text', nullable: true })
    map_link!: string | null;

    @Column({ type: 'text', nullable: true })
    address!: string | null;

    @Column({ type: 'time', nullable: true })
    opening_time!: string | null;

    @Column({ type: 'time', nullable: true })
    closing_time!: string | null;

    @Column({ type: 'jsonb', nullable: true, default: () => "'[]'" })
    branch_images!: string[];

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
}
