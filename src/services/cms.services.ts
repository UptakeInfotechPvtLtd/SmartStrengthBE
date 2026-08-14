import { IJwtPayload, Roles, VideoStatus } from '../config';
import { VideoLibraryListResponseDto, VideoLibraryResponseDto } from '../dto';
import { messages } from '../lang/api-messages';
import { CmsRepository, NotFoundException, UnauthorizedException, buildPagination } from '../utils';
import {
    CreateVideoLibraryBodyPayload,
    FetchVideoLibraryQueryPayload,
    UpdateVideoLibraryBodyPayload,
    VideoLibraryIdParamsPayload,
} from '../validations';

export class CmsService {
    constructor(private readonly cmsRepo: CmsRepository) {}

    async addVideo(body: CreateVideoLibraryBodyPayload): Promise<VideoLibraryResponseDto> {
        const video = await this.cmsRepo.createVideo({
            exercise_name: body.exerciseName,
            video_url: body.videoUrl,
            muscle_group: body.muscleGroup,
            difficulty: body.difficulty,
            video_source: body.videoSource,
            target_muscle: body.targetMuscle,
            status: body.status,
            members_only: body.membersOnly,
        });

        return new VideoLibraryResponseDto(video);
    }

    async updateVideo(
        params: VideoLibraryIdParamsPayload,
        body: UpdateVideoLibraryBodyPayload,
    ): Promise<VideoLibraryResponseDto> {
        const video = await this.getVideo(params.id);

        if (body.exerciseName !== undefined) video.exercise_name = body.exerciseName;
        if (body.videoUrl !== undefined) video.video_url = body.videoUrl;
        if (body.muscleGroup !== undefined) video.muscle_group = body.muscleGroup;
        if (body.difficulty !== undefined) video.difficulty = body.difficulty;
        if (body.videoSource !== undefined) video.video_source = body.videoSource;
        if (body.targetMuscle !== undefined) video.target_muscle = body.targetMuscle;
        if (body.status !== undefined) video.status = body.status;
        if (body.membersOnly !== undefined) video.members_only = body.membersOnly;

        return new VideoLibraryResponseDto(await this.cmsRepo.updateVideo(video));
    }

    async deleteVideo(params: VideoLibraryIdParamsPayload): Promise<void> {
        const video = await this.getVideo(params.id);
        await this.cmsRepo.softDeleteVideo(video.id);
    }

    async viewVideo(
        params: VideoLibraryIdParamsPayload,
        authUser: IJwtPayload,
    ): Promise<VideoLibraryResponseDto> {
        const video = await this.getVideo(params.id);
        this.ensureCanViewVideo(video.status, authUser?.roleName as Roles);

        return new VideoLibraryResponseDto(video);
    }

    async listVideos(
        query: FetchVideoLibraryQueryPayload,
        authUser: IJwtPayload,
    ): Promise<VideoLibraryListResponseDto> {
        const { videos, total, page, pageSize, offset } = await this.cmsRepo.listVideos(
            query,
            authUser?.roleName as Roles,
        );

        return new VideoLibraryListResponseDto(
            videos,
            buildPagination({ totalResults: total, page, pageSize, offset }),
        );
    }

    private async getVideo(id?: string) {
        const video = await this.cmsRepo.findVideoById(id);
        if (!video) {
            throw new NotFoundException(messages.videoNotFound);
        }

        return video;
    }

    private ensureCanViewVideo(status: VideoStatus, roleName: Roles): void {
        if (status === VideoStatus.Published) {
            return;
        }

        if ([Roles.Admin, Roles.SubAdmin].includes(roleName)) {
            return;
        }

        throw new UnauthorizedException(messages.cannotViewDraftVideo);
    }
}
