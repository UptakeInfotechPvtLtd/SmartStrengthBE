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
import { AccessModule } from '../../../../config/enum';
import { AccessControlEntity } from './access-control.entity';

@Entity('AccessModules')
@Index('IDX_access_modules_key_unique', ['key'], { unique: true, where: `"deleted_at" IS NULL` })
@Index('IDX_access_modules_sort_order', ['sort_order'])
export class AccessModuleEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 100 })
    key!: AccessModule;

    @Column({ type: 'varchar', length: 150 })
    name!: string;

    @Column({ type: 'int', default: 0 })
    sort_order!: number;

    @CreateDateColumn({ type: 'timestamp' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at!: Date;

    @DeleteDateColumn({ type: 'timestamp', nullable: true })
    deleted_at!: Date | null;

    @OneToMany(() => AccessControlEntity, (accessControl) => accessControl.module)
    accessControls!: AccessControlEntity[];
}
