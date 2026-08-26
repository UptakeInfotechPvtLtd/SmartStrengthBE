import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    Index,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { UserPackageEntity } from './user-package.entity';

@Entity('Packages')
@Index('IDX_packages_type_active_unique', ['package_type'], {
    unique: true,
    where: `"deleted_at" IS NULL`,
})
@Index('IDX_packages_type', ['package_type'])
@Index('IDX_packages_status', ['status'])
@Index('IDX_packages_deleted_at', ['deleted_at'])
@Index('IDX_packages_created_at', ['created_at'])
export class PackageEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 50 })
    package_type!: string;

    @Column({ type: 'numeric', precision: 10, scale: 2 })
    price!: string;

    @Column({ type: 'int' })
    number_of_sessions!: number;

    @Column({ type: 'int' })
    valid_days!: number;

    @Column({ type: 'boolean', default: true })
    status!: boolean;

    @CreateDateColumn({ type: 'timestamp' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at!: Date;

    @DeleteDateColumn({ type: 'timestamp', nullable: true })
    deleted_at!: Date | null;

    @OneToMany(() => UserPackageEntity, (userPackage) => userPackage.package)
    userPackages!: UserPackageEntity[];
}
