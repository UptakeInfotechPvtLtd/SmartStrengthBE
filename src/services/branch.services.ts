import { BranchStatus, IJwtPayload, Roles } from '../config';
import { BranchListResponseDto, BranchResponseDto } from '../dto';
import { messages } from '../lang/api-messages';
import { BranchRepository, NotFoundException, buildPagination } from '../utils';
import {
    BranchIdParamsPayload,
    CreateBranchBodyPayload,
    FetchBranchesQueryPayload,
    UpdateBranchBodyPayload,
    UpdateBranchStatusBodyPayload,
} from '../validations';

export class BranchService {
    constructor(private readonly branchRepo: BranchRepository) {}

    async createBranch(body: CreateBranchBodyPayload): Promise<BranchResponseDto> {
        const branch = await this.branchRepo.createBranch({
            name: body.name,
            contact_number: body.contactNumber,
            map_link: body.mapLink,
            address: body.address,
            opening_time: body.openingTime,
            closing_time: body.closingTime,
            branch_images: body.branchImages || [],
            status: body.status ?? BranchStatus.Active,
        });

        return new BranchResponseDto(branch);
    }

    async updateBranch(
        params: BranchIdParamsPayload,
        body: UpdateBranchBodyPayload,
    ): Promise<BranchResponseDto> {
        const branch = await this.getActiveBranch(params?.id);

        if (body.name !== undefined) branch.name = body.name;
        if (body.contactNumber !== undefined) branch.contact_number = body.contactNumber;
        if (body.mapLink !== undefined) branch.map_link = body.mapLink;
        if (body.address !== undefined) branch.address = body.address;
        if (body.openingTime !== undefined) branch.opening_time = body.openingTime;
        if (body.closingTime !== undefined) branch.closing_time = body.closingTime;
        if (body.branchImages !== undefined) branch.branch_images = body.branchImages;
        if (body.status !== undefined) branch.status = body.status;

        return new BranchResponseDto(await this.branchRepo.updateBranch(branch));
    }

    async updateBranchStatus(
        params: BranchIdParamsPayload,
        body: UpdateBranchStatusBodyPayload,
    ): Promise<BranchResponseDto> {
        const branch = await this.getActiveBranch(params?.id);
        branch.status = body.status;

        return new BranchResponseDto(await this.branchRepo.updateBranch(branch));
    }

    async deleteBranch(params: BranchIdParamsPayload): Promise<void> {
        const branch = await this.getActiveBranch(params?.id);
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

        return [Roles.SubAdmin, Roles.Trainer].includes(authUser?.roleName as Roles)
            ? authUser?.userId
            : undefined;
    }
}
