import { IAuthenticatedRequest } from '../config';
import { BaseResponseDto } from '../dto';
import { messages } from '../lang/api-messages';
import { PackageService } from '../services';
import {
    CreatePackageBodyPayload,
    FetchPackagesQueryPayload,
    PackageIdParamsPayload,
    UpdatePackageBodyPayload,
    UpdatePackageStatusBodyPayload,
} from '../validations';

export class PackageController {
    constructor(private readonly packageService: PackageService) {
        this.createPackage = this.createPackage.bind(this);
        this.updatePackage = this.updatePackage.bind(this);
        this.updatePackageStatus = this.updatePackageStatus.bind(this);
        this.deletePackage = this.deletePackage.bind(this);
        this.getPackageById = this.getPackageById.bind(this);
        this.listPackages = this.listPackages.bind(this);
    }

    async createPackage(req: IAuthenticatedRequest<any, CreatePackageBodyPayload>) {
        const result = await this.packageService.createPackage(req.body);
        return new BaseResponseDto(messages.packageCreatedSuccessfully, result);
    }

    async updatePackage(
        req: IAuthenticatedRequest<PackageIdParamsPayload, UpdatePackageBodyPayload>,
    ) {
        const result = await this.packageService.updatePackage(req.params, req.body);
        return new BaseResponseDto(messages.packageUpdatedSuccessfully, result);
    }

    async updatePackageStatus(
        req: IAuthenticatedRequest<PackageIdParamsPayload, UpdatePackageStatusBodyPayload>,
    ) {
        const result = await this.packageService.updatePackageStatus(req.params, req.body);
        return new BaseResponseDto(messages.packageStatusUpdatedSuccessfully, result);
    }

    async deletePackage(req: IAuthenticatedRequest<PackageIdParamsPayload>) {
        await this.packageService.deletePackage(req.params);
        return new BaseResponseDto(messages.packageDeletedSuccessfully);
    }

    async getPackageById(req: IAuthenticatedRequest<PackageIdParamsPayload>) {
        const result = await this.packageService.getPackageById(req.params);
        return new BaseResponseDto('', result);
    }

    async listPackages(req: IAuthenticatedRequest<any, any, FetchPackagesQueryPayload>) {
        const result = await this.packageService.listPackages(req.query);
        return new BaseResponseDto('', result);
    }
}
