import {
    Difficulty,
    IPaginationMeta,
    MuscleGroup,
    VideoSource,
    VideoStatus,
} from '../../../config';
import { VideoLibraryEntity } from '../../../utils';

export class VideoLibraryResponseDto {
    id!: string;
    exerciseName!: string;
    videoUrl!: string;
    muscleGroup!: MuscleGroup;
    difficulty!: Difficulty;
    videoSource!: VideoSource;
    targetMuscle!: string[];
    status!: VideoStatus;
    membersOnly!: boolean;
    createdAt!: Date;
    updatedAt!: Date;

    constructor(video?: VideoLibraryEntity) {
        this.id = video?.id || '';
        this.exerciseName = video?.exercise_name || '';
        this.videoUrl = video?.video_url || '';
        this.muscleGroup = video?.muscle_group!;
        this.difficulty = video?.difficulty!;
        this.videoSource = video?.video_source!;
        this.targetMuscle = video?.target_muscle || [];
        this.status = video?.status || VideoStatus.Draft;
        this.membersOnly = video?.members_only ?? false;
        this.createdAt = video?.created_at!;
        this.updatedAt = video?.updated_at!;
    }
}

export class VideoLibraryListResponseDto {
    results!: VideoLibraryResponseDto[];
    pagination!: IPaginationMeta;

    constructor(videos: VideoLibraryEntity[], pagination: IPaginationMeta) {
        this.results = videos.map((video) => new VideoLibraryResponseDto(video));
        this.pagination = pagination;
    }
}
