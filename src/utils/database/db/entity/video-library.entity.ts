import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    Index,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { VideoSource, VideoStatus } from '../../../../config/enum';

@Entity('VideoLibrary')
@Index('IDX_video_library_title', ['title'])
@Index('IDX_video_library_target_muscle_group', ['target_muscle_group'])
@Index('IDX_video_library_status', ['status'])
@Index('IDX_video_library_deleted_at', ['deleted_at'])
@Index('IDX_video_library_created_at', ['created_at'])
export class VideoLibraryEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 150 })
    title!: string;

    @Column({ type: 'varchar', length: 50 })
    video_source!: VideoSource;

    @Column({ type: 'text' })
    video_url!: string;

    @Column({ type: 'varchar', length: 150 })
    target_muscle_group!: string;

    @Column({ type: 'text' })
    description!: string;

    @Column({ type: 'text' })
    guidline!: string;

    @Column({ type: 'varchar', length: 20, default: VideoStatus.Active })
    status!: VideoStatus;

    @Column({ type: 'boolean', default: false })
    active_member_only!: boolean;

    @CreateDateColumn({ type: 'timestamp' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at!: Date;

    @DeleteDateColumn({ type: 'timestamp', nullable: true })
    deleted_at!: Date | null;
}
