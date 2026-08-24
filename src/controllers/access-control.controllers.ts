import { IAuthenticatedRequest } from '../config';
import { BaseResponseDto } from '../dto';
import { messages } from '../lang/api-messages';
import { AccessControlService } from '../services';
import { GetAccessConfigQueryPayload, UpsertAccessConfigBodyPayload } from '../validations';

export class AccessControlController {
    constructor(private readonly accessControlService: AccessControlService) {
        this.getModules = this.getModules.bind(this);
        this.getAccessConfig = this.getAccessConfig.bind(this);
        this.getMyAccessConfig = this.getMyAccessConfig.bind(this);
        this.upsertAccessConfig = this.upsertAccessConfig.bind(this);
    }

    async getModules(req: IAuthenticatedRequest) {
        const result = await this.accessControlService.getModules(req.user);
        return new BaseResponseDto('', result);
    }

    async getAccessConfig(req: IAuthenticatedRequest<any, any, GetAccessConfigQueryPayload>) {
        const result = await this.accessControlService.getAccessConfig(req.query, req.user);
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
}
