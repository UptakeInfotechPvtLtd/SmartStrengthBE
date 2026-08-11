import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UserEntity } from './users.entity';

@Entity('Roles')
export class RoleEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 100, unique: true })
    name!: string;

    @Column({ type: 'text', nullable: true })
    description!: string | null;

    @OneToMany(() => UserEntity, (user) => user.role, { cascade: true })
    users!: UserEntity[];
}
