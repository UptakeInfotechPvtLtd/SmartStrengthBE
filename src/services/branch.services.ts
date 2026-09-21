import { BranchStatus, IJwtPayload, Roles } from '../config';
import { BranchListResponseDto, BranchResponseDto } from '../dto';
import { messages } from '../lang/api-messages';
import { BadRequestException, NotFoundException } from '../utils/error';
import { BranchRepository, UserBranchEntity } from '../utils/database';
import { buildPagination } from '../utils/common.utils';
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
        authUser?: IJwtPayload,
    ): Promise<BranchListResponseDto> {
        const assignedBranchIds = await this.getListAssignedBranchIds(query.userId, authUser);
        const { branches, total, page, pageSize, offset } = await this.branchRepo.listBranches(
            query,
            assignedBranchIds,
            this.shouldShowOnlyActiveBranches(authUser),
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

    private async getListAssignedBranchIds(
        userId: string | undefined,
        authUser?: IJwtPayload,
    ): Promise<string[] | undefined> {
        const authAssignedBranchIds = await this.getUserAssignedBranchIds(
            this.getListAssignedUserId(authUser),
        );
        const filterAssignedBranchIds = await this.getFilterUserAssignedBranchIds(userId);

        if (!authAssignedBranchIds) {
            return filterAssignedBranchIds;
        }

        if (!filterAssignedBranchIds) {
            return authAssignedBranchIds;
        }

        return authAssignedBranchIds.filter((branchId) =>
            filterAssignedBranchIds.includes(branchId),
        );
    }

    private async getFilterUserAssignedBranchIds(userId?: string): Promise<string[] | undefined> {
        if (!userId) {
            return undefined;
        }

        const user = await this.branchRepo.findUserByIdWithRoleAndBranches(userId);
        if (!user) {
            throw new BadRequestException(messages.userNotFound);
        }

        if (user.role?.name === Roles.Admin) {
            return undefined;
        }

        if (user.role?.name === Roles.SubAdmin || user.role?.name === Roles.Trainer) {
            return this.extractAssignedBranchIds(user);
        }

        return [];
    }

    private async getUserAssignedBranchIds(userId?: string): Promise<string[] | undefined> {
        if (!userId) {
            return undefined;
        }

        const user = await this.branchRepo.findUserByIdWithRoleAndBranches(userId);
        if (!user) {
            return [];
        }

        return this.extractAssignedBranchIds(user);
    }

    private getListAssignedUserId(authUser?: IJwtPayload): string | undefined {
        return [Roles.SubAdmin, Roles.Trainer, Roles.User].includes(authUser?.roleName as Roles)
            ? authUser?.userId
            : undefined;
    }

    private extractAssignedBranchIds(user: { userBranches?: UserBranchEntity[] }): string[] {
        return (
            user.userBranches
                ?.map((userBranch) => userBranch.branch?.id)
                .filter((branchId): branchId is string => Boolean(branchId)) || []
        );
    }

    private createAssignedUserBranches(authUser: IJwtPayload): UserBranchEntity[] {
        if (![Roles.SubAdmin, Roles.Trainer].includes(authUser?.roleName as Roles)) {
            return [];
        }

        return [
            {
                user: { id: authUser.userId },
            } as UserBranchEntity,
        ];
    }

    private shouldShowOnlyActiveBranches(authUser?: IJwtPayload): boolean {
        return ![Roles.Admin, Roles.SubAdmin, Roles.Trainer].includes(authUser?.roleName as Roles);
    }
}
