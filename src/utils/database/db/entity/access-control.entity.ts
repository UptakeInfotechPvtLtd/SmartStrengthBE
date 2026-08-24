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
import { AccessPermission } from '../../../../config/enum';
import { AccessModuleEntity } from './access-module.entity';
import { RoleEntity } from './roles.entity';
import { UserEntity } from './users.entity';

@Entity('AccessControls')
@Index('IDX_access_controls_module_id', ['module'])
@Index('IDX_access_controls_role_id', ['role'])
@Index('IDX_access_controls_user_id', ['user'])
@Index('IDX_access_controls_permission', ['permission'])
@Index('IDX_access_controls_unique_role', ['module', 'role', 'permission'], {
    unique: true,
    where: `"user_id" IS NULL AND "deleted_at" IS NULL`,
})
@Index('IDX_access_controls_unique_user', ['module', 'user', 'permission'], {
    unique: true,
    where: `"role_id" IS NULL AND "deleted_at" IS NULL`,
})
export class AccessControlEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => AccessModuleEntity, (module) => module.accessControls, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'module_id' })
    module!: AccessModuleEntity;

    @ManyToOne(() => RoleEntity, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'role_id' })
    role!: RoleEntity | null;

    @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: UserEntity | null;

    @Column({ type: 'varchar', length: 20 })
    permission!: AccessPermission;

    @CreateDateColumn({ type: 'timestamp' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at!: Date;

    @DeleteDateColumn({ type: 'timestamp', nullable: true })
    deleted_at!: Date | null;
}
