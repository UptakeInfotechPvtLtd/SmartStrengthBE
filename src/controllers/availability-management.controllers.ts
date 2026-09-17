import { IAuthenticatedRequest } from '../config';
import { BaseResponseDto } from '../dto';
import { messages } from '../lang/api-messages';
import { AvailabilityManagementService } from '../services';
import {
    CreateBranchMaintenanceParamsPayload,
    CreateMaintenanceBodyPayload,
    CreateTrainerMaintenanceParamsPayload,
    DeleteBranchMaintenanceParamsPayload,
    DeleteTrainerMaintenanceParamsPayload,
    FetchTrainerAvailabilityQueryPayload,
    UpdateBranchAvailabilityStatusBodyPayload,
    UpdateBranchAvailabilityStatusParamsPayload,
    UpdateTrainerAvailabilityStatusBodyPayload,
    UpdateTrainerAvailabilityStatusParamsPayload,
} from '../validations';

export class AvailabilityManagementController {
    constructor(private readonly availabilityService: AvailabilityManagementService) {
        this.updateBranchAvailabilityStatus = this.updateBranchAvailabilityStatus.bind(this);
        this.createBranchMaintenance = this.createBranchMaintenance.bind(this);
        this.listBranchMaintenances = this.listBranchMaintenances.bind(this);
        this.deleteBranchMaintenance = this.deleteBranchMaintenance.bind(this);
        this.updateTrainerAvailability = this.updateTrainerAvailability.bind(this);
        this.listTrainerAvailabilities = this.listTrainerAvailabilities.bind(this);
        this.createTrainerMaintenance = this.createTrainerMaintenance.bind(this);
        this.listTrainerMaintenances = this.listTrainerMaintenances.bind(this);
        this.deleteTrainerMaintenance = this.deleteTrainerMaintenance.bind(this);
    }

    async updateBranchAvailabilityStatus(
        req: IAuthenticatedRequest<
            UpdateBranchAvailabilityStatusParamsPayload,
            UpdateBranchAvailabilityStatusBodyPayload
        >,
    ) {
        const result = await this.availabilityService.updateBranchAvailabilityStatus(
            req.params,
            req.body,
            req.user,
        );
        return new BaseResponseDto(messages.branchAvailabilityStatusUpdatedSuccessfully, result);
    }

    async createBranchMaintenance(
        req: IAuthenticatedRequest<
            CreateBranchMaintenanceParamsPayload,
            CreateMaintenanceBodyPayload
        >,
    ) {
        const result = await this.availabilityService.createBranchMaintenance(
            req.params,
            req.body,
            req.user,
        );
        return new BaseResponseDto(messages.branchMaintenanceCreatedSuccessfully, result);
    }

    async listBranchMaintenances(req: IAuthenticatedRequest<CreateBranchMaintenanceParamsPayload>) {
        const result = await this.availabilityService.listBranchMaintenances(req.params, req.user);
        return new BaseResponseDto('', result);
    }

    async deleteBranchMaintenance(
        req: IAuthenticatedRequest<DeleteBranchMaintenanceParamsPayload>,
    ) {
        await this.availabilityService.deleteBranchMaintenance(req.params, req.user);
        return new BaseResponseDto(messages.branchMaintenanceDeletedSuccessfully);
    }

    async updateTrainerAvailability(
        req: IAuthenticatedRequest<
            UpdateTrainerAvailabilityStatusParamsPayload,
            UpdateTrainerAvailabilityStatusBodyPayload
        >,
    ) {
        const result = await this.availabilityService.updateTrainerAvailability(
            req.params,
            req.body,
        );
        return new BaseResponseDto(messages.trainerAvailabilityUpdatedSuccessfully, result);
    }

    async listTrainerAvailabilities(
        req: IAuthenticatedRequest<any, any, FetchTrainerAvailabilityQueryPayload>,
    ) {
        const result = await this.availabilityService.listTrainerAvailabilities(
            req.query,
            req.user,
        );
        return new BaseResponseDto('', result);
    }

    async createTrainerMaintenance(
        req: IAuthenticatedRequest<
            CreateTrainerMaintenanceParamsPayload,
            CreateMaintenanceBodyPayload
        >,
    ) {
        const result = await this.availabilityService.createTrainerMaintenance(
            req.params,
            req.body,
        );
        return new BaseResponseDto(messages.trainerMaintenanceCreatedSuccessfully, result);
    }

    async listTrainerMaintenances(
        req: IAuthenticatedRequest<CreateTrainerMaintenanceParamsPayload>,
    ) {
        const result = await this.availabilityService.listTrainerMaintenances(req.params);
        return new BaseResponseDto(messages.trainerMaintenanceFetchedSuccessfully, result);
    }

    async deleteTrainerMaintenance(
        req: IAuthenticatedRequest<DeleteTrainerMaintenanceParamsPayload>,
    ) {
        await this.availabilityService.deleteTrainerMaintenance(req.params);
        return new BaseResponseDto(messages.trainerMaintenanceDeletedSuccessfully);
    }
}
