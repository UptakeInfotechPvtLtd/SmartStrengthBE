import { IAuthenticatedRequest } from '../config';
import { BaseResponseDto } from '../dto';
import { messages } from '../lang/api-messages';
import { SessionService } from '../services';
import {
    CreateSessionBodyPayload,
    FetchSessionsQueryPayload,
    SessionIdParamsPayload,
    UpdateSessionBodyPayload,
    UpdateSessionStatusBodyPayload,
} from '../validations';

export class SessionController {
    constructor(private readonly sessionService: SessionService) {
        this.createSession = this.createSession.bind(this);
        this.updateSession = this.updateSession.bind(this);
        this.updateSessionStatus = this.updateSessionStatus.bind(this);
        this.deleteSession = this.deleteSession.bind(this);
        this.getSessionById = this.getSessionById.bind(this);
        this.listSessions = this.listSessions.bind(this);
    }

    async createSession(req: IAuthenticatedRequest<any, CreateSessionBodyPayload>) {
        const result = await this.sessionService.createSession(req.body, req.user);
        return new BaseResponseDto(messages.sessionCreatedSuccessfully, result);
    }

    async updateSession(
        req: IAuthenticatedRequest<SessionIdParamsPayload, UpdateSessionBodyPayload>,
    ) {
        const result = await this.sessionService.updateSession(req.params, req.body, req.user);
        return new BaseResponseDto(messages.sessionUpdatedSuccessfully, result);
    }

    async updateSessionStatus(
        req: IAuthenticatedRequest<SessionIdParamsPayload, UpdateSessionStatusBodyPayload>,
    ) {
        const result = await this.sessionService.updateSessionStatus(req.params, req.body);
        return new BaseResponseDto(messages.sessionStatusUpdatedSuccessfully, result);
    }

    async deleteSession(req: IAuthenticatedRequest<SessionIdParamsPayload>) {
        await this.sessionService.deleteSession(req.params);
        return new BaseResponseDto(messages.sessionDeletedSuccessfully);
    }

    async getSessionById(req: IAuthenticatedRequest<SessionIdParamsPayload>) {
        const result = await this.sessionService.getSessionById(req.params);
        return new BaseResponseDto('', result);
    }

    async listSessions(req: IAuthenticatedRequest<any, any, FetchSessionsQueryPayload>) {
        const result = await this.sessionService.listSessions(req.query);
        return new BaseResponseDto('', result);
    }
}
