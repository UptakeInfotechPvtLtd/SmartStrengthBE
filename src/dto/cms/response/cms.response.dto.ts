import { IPaginationMeta, VideoSource, VideoStatus } from '../../../config';
import { VideoLibraryEntity } from '../../../utils/database';

export class VideoLibraryResponseDto {
    id!: string;
    title!: string;
    targetMuscleGroup!: string;
    description!: string;
    guidline!: string;
    videoSource!: VideoSource;
    videoUrl!: string;
    status!: VideoStatus;
    activeMemberOnly!: boolean;
    createdAt!: Date;
    updatedAt!: Date;

    constructor(video?: VideoLibraryEntity) {
        this.id = video?.id || '';
        this.title = video?.title || '';
        this.targetMuscleGroup = video?.target_muscle_group || '';
        this.description = video?.description || '';
        this.guidline = video?.guidline || '';
        this.videoSource = video?.video_source!;
        this.videoUrl = video?.video_url || '';
        this.status = video?.status || VideoStatus.Active;
        this.activeMemberOnly = video?.active_member_only ?? false;
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
