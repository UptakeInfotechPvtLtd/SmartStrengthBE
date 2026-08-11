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
import { UserEntity } from './users.entity';

@Entity('UserBranches')
@Index('IDX_user_branches_user_id', ['user'])
@Index('IDX_user_branches_branch_id', ['branch'])
@Index('IDX_user_branches_user_branch_unique', ['user', 'branch'], { unique: true })
export class UserBranchEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => UserEntity, (user) => user.userBranches, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: UserEntity;

    @ManyToOne(() => BranchEntity, (branch) => branch.userBranches, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'branch_id' })
    branch!: BranchEntity;

    @CreateDateColumn({ type: 'timestamp' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at!: Date;
}
