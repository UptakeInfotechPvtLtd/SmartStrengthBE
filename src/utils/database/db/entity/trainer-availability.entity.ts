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
import { TrainerAvailabilityStatus } from '../../../../config/enum';
import { UserEntity } from './users.entity';

@Entity('TrainerAvailabilities')
@Index('IDX_trainer_availabilities_trainer_unique', ['trainer'], {
    unique: true,
    where: `"deleted_at" IS NULL`,
})
@Index('IDX_trainer_availabilities_status', ['status'])
export class TrainerAvailabilityEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'trainer_id' })
    trainer!: UserEntity;

    @Column({ type: 'varchar', length: 20, default: TrainerAvailabilityStatus.Available })
    status!: TrainerAvailabilityStatus;

    @CreateDateColumn({ type: 'timestamp' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at!: Date;

    @DeleteDateColumn({ type: 'timestamp', nullable: true })
    deleted_at!: Date | null;
}
