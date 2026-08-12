import { PackageListResponseDto, PackageResponseDto } from '../dto';
import { messages } from '../lang/api-messages';
import { ConflictException, NotFoundException, PackageRepository, buildPagination } from '../utils';
import {
    CreatePackageBodyPayload,
    FetchPackagesQueryPayload,
    PackageIdParamsPayload,
    UpdatePackageBodyPayload,
    UpdatePackageStatusBodyPayload,
} from '../validations';

export class PackageService {
    constructor(private readonly packageRepo: PackageRepository) {}

    async createPackage(body: CreatePackageBodyPayload): Promise<PackageResponseDto> {
        await this.ensurePackageNameUnique(body.packageName);

        const packageData = await this.packageRepo.createPackage({
            package_name: body.packageName,
            price: body.price.toFixed(2),
            number_of_sessions: body.numberOfSessions,
            validity_in_days: body.validityInDays,
            best_for: body.bestFor,
            description: body.description || null,
            status: body.status ?? true,
        });

        return new PackageResponseDto(packageData);
    }

    async updatePackage(
        params: PackageIdParamsPayload,
        body: UpdatePackageBodyPayload,
    ): Promise<PackageResponseDto> {
        const packageData = await this.getPackage(params?.id);

        if (body.packageName !== undefined && body.packageName !== packageData.package_name) {
            await this.ensurePackageNameUnique(body.packageName);
            packageData.package_name = body.packageName;
        }
        if (body.price !== undefined) packageData.price = body.price.toFixed(2);
        if (body.numberOfSessions !== undefined) {
            packageData.number_of_sessions = body.numberOfSessions;
        }
        if (body.validityInDays !== undefined) packageData.validity_in_days = body.validityInDays;
        if (body.bestFor !== undefined) packageData.best_for = body.bestFor;
        if (body.description !== undefined) packageData.description = body.description;
        if (body.status !== undefined) packageData.status = body.status;

        return new PackageResponseDto(await this.packageRepo.updatePackage(packageData));
    }

    async updatePackageStatus(
        params: PackageIdParamsPayload,
        body: UpdatePackageStatusBodyPayload,
    ): Promise<PackageResponseDto> {
        const packageData = await this.getPackage(params?.id);
        packageData.status = body.status;

        return new PackageResponseDto(await this.packageRepo.updatePackage(packageData));
    }

    async deletePackage(params: PackageIdParamsPayload): Promise<void> {
        const packageData = await this.getPackage(params?.id);
        await this.packageRepo.softDeletePackage(packageData?.id);
    }

    async getPackageById(params: PackageIdParamsPayload): Promise<PackageResponseDto> {
        return new PackageResponseDto(await this.getPackage(params?.id));
    }

    async listPackages(query: FetchPackagesQueryPayload): Promise<PackageListResponseDto> {
        const { packages, total, page, pageSize, offset } =
            await this.packageRepo.listPackages(query);

        return new PackageListResponseDto(
            packages,
            buildPagination({ totalResults: total, page, pageSize, offset }),
        );
    }

    private async getPackage(id?: string) {
        const packageData = await this.packageRepo.findPackageById(id);
        if (!packageData) {
            throw new NotFoundException(messages.packageNotFound);
        }

        return packageData;
    }

    private async ensurePackageNameUnique(packageName: string): Promise<void> {
        const existingPackage = await this.packageRepo.findPackageByName(packageName);
        if (existingPackage) {
            throw new ConflictException(messages.packageAlreadyExists);
        }
    }
}
