import { Request } from 'express';
import { IAuthenticatedRequest } from '../config';
import { BaseResponseDto } from '../dto';
import { messages } from '../lang/api-messages';
import { BranchService } from '../services';
import {
    BranchIdParamsPayload,
    CreateBranchBodyPayload,
    FetchBranchesQueryPayload,
    UpdateBranchBodyPayload,
    UpdateBranchStatusBodyPayload,
} from '../validations';

export class BranchController {
    constructor(private readonly branchService: BranchService) {
        this.createBranch = this.createBranch.bind(this);
        this.updateBranch = this.updateBranch.bind(this);
        this.updateBranchStatus = this.updateBranchStatus.bind(this);
        this.deleteBranch = this.deleteBranch.bind(this);
        this.getBranchById = this.getBranchById.bind(this);
        this.listBranches = this.listBranches.bind(this);
    }

    async createBranch(req: IAuthenticatedRequest<any, CreateBranchBodyPayload>) {
        const result = await this.branchService.createBranch(req.body);
        return new BaseResponseDto(messages.branchCreatedSuccessfully, result);
    }

    async updateBranch(req: IAuthenticatedRequest<BranchIdParamsPayload, UpdateBranchBodyPayload>) {
        const result = await this.branchService.updateBranch(req.params, req.body);
        return new BaseResponseDto(messages.branchUpdatedSuccessfully, result);
    }

    async updateBranchStatus(
        req: IAuthenticatedRequest<BranchIdParamsPayload, UpdateBranchStatusBodyPayload>,
    ) {
        const result = await this.branchService.updateBranchStatus(req.params, req.body);
        return new BaseResponseDto(messages.branchStatusUpdatedSuccessfully, result);
    }

    async deleteBranch(req: IAuthenticatedRequest<BranchIdParamsPayload>) {
        const result = await this.branchService.deleteBranch(req.params);
        return new BaseResponseDto(messages.branchDeletedSuccessfully, result);
    }

    async getBranchById(req: IAuthenticatedRequest<BranchIdParamsPayload>) {
        const result = await this.branchService.getBranchById(req.params);
        return new BaseResponseDto(messages.branchFetchedSuccessfully, result);
    }

    async listBranches(req: Request<any, any, any, FetchBranchesQueryPayload>) {
        const result = await this.branchService.listBranches(req.query);
        return new BaseResponseDto(messages.branchesFetchedSuccessfully, result);
    }
}
