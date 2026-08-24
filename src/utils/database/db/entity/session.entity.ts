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
import { SessionBranchEntity } from './session-branch.entity';

@Entity('Sessions')
@Index('IDX_sessions_name', ['session_name'])
@Index('IDX_sessions_status', ['status'])
@Index('IDX_sessions_is_sachin_status', ['is_sachin_status'])
@Index('IDX_sessions_deleted_at', ['deleted_at'])
@Index('IDX_sessions_created_at', ['created_at'])
export class SessionEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 150 })
    session_name!: string;

    @Column({ type: 'numeric', precision: 10, scale: 2 })
    price!: string;

    @Column({ type: 'text', nullable: true })
    description!: string | null;

    @Column({ type: 'boolean', default: true })
    status!: boolean;

    @Column({ type: 'boolean', default: false })
    is_sachin_status!: boolean;

    @CreateDateColumn({ type: 'timestamp' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at!: Date;

    @DeleteDateColumn({ type: 'timestamp', nullable: true })
    deleted_at!: Date | null;

    @OneToMany(() => SessionBranchEntity, (sessionBranch) => sessionBranch.session, {
        cascade: true,
    })
    sessionBranches!: SessionBranchEntity[];
}
