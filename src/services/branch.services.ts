import { BranchStatus, IJwtPayload, Roles } from '../config';
import { BranchListResponseDto, BranchResponseDto } from '../dto';
import { messages } from '../lang/api-messages';
import { BranchRepository, NotFoundException, UserBranchEntity, buildPagination } from '../utils';
import {
    BranchIdParamsPayload,
    CreateBranchBodyPayload,
    FetchBranchesQueryPayload,
    UpdateBranchBodyPayload,
    UpdateBranchStatusBodyPayload,
} from '../validations';

export class BranchService {
    constructor(private readonly branchRepo: BranchRepository) {}

    async createBranch(
        body: CreateBranchBodyPayload,
        authUser: IJwtPayload,
    ): Promise<BranchResponseDto> {
        const branch = await this.branchRepo.createBranch({
            branch_name: body.branchName,
            map_url: body.mapUrl,
            address: body.address,
            opening_time: body.openingTime,
            closing_time: body.closingTime,
            status: BranchStatus.Active,
            userBranches: this.createAssignedUserBranches(authUser),
        });

        return new BranchResponseDto(branch);
    }

    async updateBranch(
        params: BranchIdParamsPayload,
        body: UpdateBranchBodyPayload,
        authUser: IJwtPayload,
    ): Promise<BranchResponseDto> {
        const branch = await this.getActiveBranch(params?.id, authUser);

        if (body.branchName !== undefined) branch.branch_name = body.branchName;
        if (body.mapUrl !== undefined) branch.map_url = body.mapUrl;
        if (body.address !== undefined) branch.address = body.address;
        if (body.openingTime !== undefined) branch.opening_time = body.openingTime;
        if (body.closingTime !== undefined) branch.closing_time = body.closingTime;

        return new BranchResponseDto(await this.branchRepo.updateBranch(branch));
    }

    async updateBranchStatus(
        params: BranchIdParamsPayload,
        body: UpdateBranchStatusBodyPayload,
        authUser: IJwtPayload,
    ): Promise<BranchResponseDto> {
        const branch = await this.getActiveBranch(params?.id, authUser);
        branch.status = body.status;

        return new BranchResponseDto(await this.branchRepo.updateBranch(branch));
    }

    async deleteBranch(params: BranchIdParamsPayload, authUser: IJwtPayload): Promise<void> {
        const branch = await this.getActiveBranch(params?.id, authUser);
        await this.branchRepo.softDeleteBranch(branch);
    }

    async getBranchById(
        params: BranchIdParamsPayload,
        authUser: IJwtPayload,
    ): Promise<BranchResponseDto> {
        return new BranchResponseDto(await this.getActiveBranch(params?.id, authUser));
    }

    async listBranches(
        query: FetchBranchesQueryPayload,
        authUser: IJwtPayload,
    ): Promise<BranchListResponseDto> {
        const assignedUserId = this.getAssignedUserId(authUser);
        const { branches, total, page, pageSize, offset } = await this.branchRepo.listBranches(
            query,
            assignedUserId,
        );

        return new BranchListResponseDto(
            branches,
            buildPagination({ totalResults: total, page, pageSize, offset }),
        );
    }

    private async getActiveBranch(id?: string, authUser?: IJwtPayload) {
        const branch = await this.branchRepo.findBranchById(id, this.getAssignedUserId(authUser));
        if (!branch) {
            throw new NotFoundException(messages.branchNotFound);
        }

        return branch;
    }

    private getAssignedUserId(authUser?: IJwtPayload): string | undefined {
        if (!authUser) {
            return undefined;
        }

        return [Roles.SubAdmin, Roles.Trainer, Roles.User].includes(authUser?.roleName as Roles)
            ? authUser?.userId
            : undefined;
    }

    private createAssignedUserBranches(authUser: IJwtPayload): UserBranchEntity[] {
        if (authUser?.roleName !== Roles.SubAdmin) {
            return [];
        }

        return [
            {
                user: { id: authUser.userId },
            } as UserBranchEntity,
        ];
    }
}
