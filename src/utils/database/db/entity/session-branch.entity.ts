import {
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { BranchEntity } from './branch.entity';
import { SessionEntity } from './session.entity';

@Entity('SessionBranches')
@Index('IDX_session_branches_session_id', ['session'])
@Index('IDX_session_branches_branch_id', ['branch'])
@Index('IDX_session_branches_session_branch_unique', ['session', 'branch'], { unique: true })
export class SessionBranchEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => SessionEntity, (session) => session.sessionBranches, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'session_id' })
    session!: SessionEntity;

    @ManyToOne(() => BranchEntity, (branch) => branch.sessionBranches, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'branch_id' })
    branch!: BranchEntity;

    @CreateDateColumn({ type: 'timestamp' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at!: Date;
}
