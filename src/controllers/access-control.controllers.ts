import { IAuthenticatedRequest } from '../config';
import { BaseResponseDto } from '../dto';
import { messages } from '../lang/api-messages';
import { AccessControlService } from '../services';
import {
    GetAccessConfigQueryPayload,
    GetUserAccessConfigParamsPayload,
    RoleAccessConfigParamsPayload,
    UpsertAccessConfigBodyPayload,
    UpsertUserAccessConfigBodyPayload,
} from '../validations';

export class AccessControlController {
    constructor(private readonly accessControlService: AccessControlService) {
        this.getModules = this.getModules.bind(this);
        this.getAccessConfig = this.getAccessConfig.bind(this);
        this.getRoleAccessConfig = this.getRoleAccessConfig.bind(this);
        this.getUserAccessConfig = this.getUserAccessConfig.bind(this);
        this.getMyAccessConfig = this.getMyAccessConfig.bind(this);
        this.upsertAccessConfig = this.upsertAccessConfig.bind(this);
        this.upsertUserAccessConfig = this.upsertUserAccessConfig.bind(this);
    }

    async getModules(req: IAuthenticatedRequest) {
        const result = await this.accessControlService.getModules(req.user);
        return new BaseResponseDto('', result);
    }

    async getAccessConfig(req: IAuthenticatedRequest<any, any, GetAccessConfigQueryPayload>) {
        const result = await this.accessControlService.getAccessConfig(req.query, req.user);
        return new BaseResponseDto('', result);
    }

    async getRoleAccessConfig(req: IAuthenticatedRequest<RoleAccessConfigParamsPayload>) {
        const result = await this.accessControlService.getRoleAccessConfig(req.params, req.user);
        return new BaseResponseDto('', result);
    }

    async getUserAccessConfig(req: IAuthenticatedRequest<GetUserAccessConfigParamsPayload>) {
        const result = await this.accessControlService.getUserAccessConfig(req.params, req.user);
        return new BaseResponseDto('', result);
    }

    async getMyAccessConfig(req: IAuthenticatedRequest) {
        const result = await this.accessControlService.getMyAccessConfig(req.user);
        return new BaseResponseDto('', result);
    }

    async upsertAccessConfig(req: IAuthenticatedRequest<any, UpsertAccessConfigBodyPayload>) {
        const result = await this.accessControlService.upsertAccessConfig(req.body, req.user);
        return new BaseResponseDto(messages.accessConfigSavedSuccessfully, result);
    }

    async upsertUserAccessConfig(
        req: IAuthenticatedRequest<any, UpsertUserAccessConfigBodyPayload>,
    ) {
        const result = await this.accessControlService.upsertUserAccessConfig(req.body, req.user);
        return new BaseResponseDto(messages.accessConfigSavedSuccessfully, result);
    }
}
