import { IJwtPayload, Roles, VideoStatus } from '../config';
import { VideoLibraryListResponseDto, VideoLibraryResponseDto } from '../dto';
import { messages } from '../lang/api-messages';
import { NotFoundException, UnauthorizedException } from '../utils/error';
import { CmsRepository } from '../utils/database';
import { buildPagination } from '../utils/common.utils';
import {
    CreateVideoLibraryBodyPayload,
    FetchVideoLibraryQueryPayload,
    UpdateVideoLibraryBodyPayload,
    UpdateVideoLibraryStatusBodyPayload,
    VideoLibraryIdParamsPayload,
} from '../validations';

export class CmsService {
    constructor(private readonly cmsRepo: CmsRepository) {}

    async addVideo(body: CreateVideoLibraryBodyPayload): Promise<VideoLibraryResponseDto> {
        const video = await this.cmsRepo.createVideo({
            title: body.title,
            target_muscle_group: body.targetMuscleGroup,
            description: body.description,
            guidline: body.guidline,
            video_source: body.videoSource,
            video_url: body.videoUrl,
            active_member_only: body.activeMemberOnly,
            status: VideoStatus.Active,
        });

        return new VideoLibraryResponseDto(video);
    }

    async updateVideo(
        params: VideoLibraryIdParamsPayload,
        body: UpdateVideoLibraryBodyPayload,
    ): Promise<VideoLibraryResponseDto> {
        const video = await this.getVideo(params.id);

        if (body.title !== undefined) video.title = body.title;
        if (body.targetMuscleGroup !== undefined) {
            video.target_muscle_group = body.targetMuscleGroup;
        }
        if (body.description !== undefined) video.description = body.description;
        if (body.guidline !== undefined) video.guidline = body.guidline;
        if (body.videoSource !== undefined) video.video_source = body.videoSource;
        if (body.videoUrl !== undefined) video.video_url = body.videoUrl;
        if (body.activeMemberOnly !== undefined) {
            video.active_member_only = body.activeMemberOnly;
        }

        return new VideoLibraryResponseDto(await this.cmsRepo.updateVideo(video));
    }

    async updateVideoStatus(
        params: VideoLibraryIdParamsPayload,
        body: UpdateVideoLibraryStatusBodyPayload,
    ): Promise<VideoLibraryResponseDto> {
        const video = await this.getVideo(params.id);
        video.status = body.status;

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
        if (status === VideoStatus.Active) {
            return;
        }

        if ([Roles.Admin, Roles.SubAdmin, Roles.Trainer].includes(roleName)) {
            return;
        }

        throw new UnauthorizedException(messages.cannotViewInactiveVideo);
    }
}
