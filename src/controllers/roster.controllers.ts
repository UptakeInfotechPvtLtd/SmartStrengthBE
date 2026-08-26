import { IAuthenticatedRequest } from '../config/interface';
import { BaseResponseDto } from '../dto';
import { messages } from '../lang/api-messages';
import { RosterService } from '../services';
import {
    CreateRosterBodyPayload,
    RosterIdParamsPayload,
    UpdateRosterStatusBodyPayload,
} from '../validations/roster.validations';

export class RosterController {
    constructor(private readonly rosterService: RosterService) {
        this.createRosters = this.createRosters.bind(this);
        this.updateRosterStatus = this.updateRosterStatus.bind(this);
        this.deleteRoster = this.deleteRoster.bind(this);
        this.getRosterById = this.getRosterById.bind(this);
        this.listRosters = this.listRosters.bind(this);
    }

    async createRosters(req: IAuthenticatedRequest<any, CreateRosterBodyPayload>) {
        const result = await this.rosterService.createRosters(req.body, req.user);
        return new BaseResponseDto(messages.rosterSavedSuccessfully, result);
    }

    async updateRosterStatus(
        req: IAuthenticatedRequest<RosterIdParamsPayload, UpdateRosterStatusBodyPayload>,
    ) {
        const result = await this.rosterService.updateRosterStatus(req.params, req.body, req.user);
        return new BaseResponseDto(messages.rosterStatusUpdatedSuccessfully, result);
    }

    async deleteRoster(req: IAuthenticatedRequest<RosterIdParamsPayload>) {
        await this.rosterService.deleteRoster(req.params, req.user);
        return new BaseResponseDto(messages.rosterDeletedSuccessfully);
    }

    async getRosterById(req: IAuthenticatedRequest<RosterIdParamsPayload>) {
        const result = await this.rosterService.getRosterById(req.params, req.user);
        return new BaseResponseDto('', result);
    }

    async listRosters(req: IAuthenticatedRequest) {
        const result = await this.rosterService.listRosters(req.user);
        return new BaseResponseDto('', result);
    }
}
