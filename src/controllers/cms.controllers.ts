import { IAuthenticatedRequest } from '../config';
import { BaseResponseDto } from '../dto';
import { messages } from '../lang/api-messages';
import { CmsService } from '../services';
import {
    CreateVideoLibraryBodyPayload,
    FetchVideoLibraryQueryPayload,
    UpdateVideoLibraryBodyPayload,
    VideoLibraryIdParamsPayload,
} from '../validations';

export class CmsController {
    constructor(private readonly cmsService: CmsService) {
        this.addVideo = this.addVideo.bind(this);
        this.listVideos = this.listVideos.bind(this);
        this.viewVideo = this.viewVideo.bind(this);
        this.updateVideo = this.updateVideo.bind(this);
        this.deleteVideo = this.deleteVideo.bind(this);
    }

    async addVideo(req: IAuthenticatedRequest<any, CreateVideoLibraryBodyPayload>) {
        const result = await this.cmsService.addVideo(req.body);
        return new BaseResponseDto(messages.videoCreatedSuccessfully, result);
    }

    async listVideos(req: IAuthenticatedRequest<any, any, FetchVideoLibraryQueryPayload>) {
        const result = await this.cmsService.listVideos(req.query, req.user);
        return new BaseResponseDto(messages.videosFetchedSuccessfully, result);
    }

    async viewVideo(req: IAuthenticatedRequest<VideoLibraryIdParamsPayload>) {
        const result = await this.cmsService.viewVideo(req.params, req.user);
        return new BaseResponseDto(messages.videoFetchedSuccessfully, result);
    }

    async updateVideo(
        req: IAuthenticatedRequest<VideoLibraryIdParamsPayload, UpdateVideoLibraryBodyPayload>,
    ) {
        const result = await this.cmsService.updateVideo(req.params, req.body);
        return new BaseResponseDto(messages.videoUpdatedSuccessfully, result);
    }

    async deleteVideo(req: IAuthenticatedRequest<VideoLibraryIdParamsPayload>) {
        await this.cmsService.deleteVideo(req.params);
        return new BaseResponseDto(messages.videoDeletedSuccessfully);
    }
}
