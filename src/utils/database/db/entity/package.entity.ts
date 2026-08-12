import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    Index,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('Packages')
@Index('IDX_packages_name_active_unique', ['package_name'], {
    unique: true,
    where: `"deleted_at" IS NULL`,
})
@Index('IDX_packages_name', ['package_name'])
@Index('IDX_packages_status', ['status'])
@Index('IDX_packages_deleted_at', ['deleted_at'])
@Index('IDX_packages_created_at', ['created_at'])
export class PackageEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 150 })
    package_name!: string;

    @Column({ type: 'numeric', precision: 10, scale: 2 })
    price!: string;

    @Column({ type: 'int' })
    number_of_sessions!: number;

    @Column({ type: 'int' })
    validity_in_days!: number;

    @Column({ type: 'varchar', length: 255 })
    best_for!: string;

    @Column({ type: 'text', nullable: true })
    description!: string | null;

    @Column({ type: 'boolean', default: true })
    status!: boolean;

    @CreateDateColumn({ type: 'timestamp' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at!: Date;

    @DeleteDateColumn({ type: 'timestamp', nullable: true })
    deleted_at!: Date | null;
}
