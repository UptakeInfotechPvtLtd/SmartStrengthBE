import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    Index,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Difficulty, MuscleGroup, VideoSource, VideoStatus } from '../../../../config/enum';

@Entity('VideoLibrary')
@Index('IDX_video_library_exercise_name', ['exercise_name'])
@Index('IDX_video_library_muscle_group', ['muscle_group'])
@Index('IDX_video_library_difficulty', ['difficulty'])
@Index('IDX_video_library_status', ['status'])
@Index('IDX_video_library_deleted_at', ['deleted_at'])
@Index('IDX_video_library_created_at', ['created_at'])
export class VideoLibraryEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 150 })
    exercise_name!: string;

    @Column({ type: 'text' })
    video_url!: string;

    @Column({ type: 'varchar', length: 50 })
    muscle_group!: MuscleGroup;

    @Column({ type: 'varchar', length: 50 })
    difficulty!: Difficulty;

    @Column({ type: 'varchar', length: 50 })
    video_source!: VideoSource;

    @Column({ type: 'jsonb', default: [] })
    target_muscle!: string[];

    @Column({ type: 'varchar', length: 20, default: VideoStatus.Draft })
    status!: VideoStatus;

    @Column({ type: 'boolean', default: false })
    members_only!: boolean;

    @CreateDateColumn({ type: 'timestamp' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at!: Date;

    @DeleteDateColumn({ type: 'timestamp', nullable: true })
    deleted_at!: Date | null;
}
