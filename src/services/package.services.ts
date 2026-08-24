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
        await this.ensurePackageNameUnique(body.packageType);

        const packageData = await this.packageRepo.createPackage({
            package_type: body.packageType,
            price: body.price.toFixed(2),
            number_of_sessions: body.numberOfSessions,
            valid_days: body.validDays,
            status: true,
        });

        return new PackageResponseDto(packageData);
    }

    async updatePackage(
        params: PackageIdParamsPayload,
        body: UpdatePackageBodyPayload,
    ): Promise<PackageResponseDto> {
        const packageData = await this.getPackage(params?.id);

        if (body.packageType !== undefined && body.packageType !== packageData.package_type) {
            await this.ensurePackageNameUnique(body.packageType);
            packageData.package_type = body.packageType;
        }
        if (body.price !== undefined) packageData.price = body.price.toFixed(2);
        if (body.numberOfSessions !== undefined) {
            packageData.number_of_sessions = body.numberOfSessions;
        }
        if (body.validDays !== undefined) packageData.valid_days = body.validDays;

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
