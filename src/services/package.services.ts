import { IJwtPayload, UserStatus } from '../config';
import {
    PackageListResponseDto,
    PackagePurchaseListResponseDto,
    PackagePurchaseResponseDto,
    PackageResponseDto,
} from '../dto';
import { messages } from '../lang/api-messages';
import {
    BadRequestException,
    NotFoundException,
    PackageRepository,
    UserRepository,
    buildPagination,
} from '../utils';
import {
    CreatePackageBodyPayload,
    FetchPackagePurchasesQueryPayload,
    FetchPackagesQueryPayload,
    PackageIdParamsPayload,
    PurchasePackageBodyPayload,
    UpdatePackageBodyPayload,
    UpdatePackageStatusBodyPayload,
} from '../validations';

export class PackageService {
    constructor(
        private readonly packageRepo: PackageRepository,
        private readonly userRepo: UserRepository,
    ) {}

    async createPackage(body: CreatePackageBodyPayload): Promise<PackageResponseDto> {
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

    async purchasePackage(
        body: PurchasePackageBodyPayload,
        authUser: IJwtPayload,
    ): Promise<PackagePurchaseResponseDto> {
        const [packageData, user] = await Promise.all([
            this.getPackage(body.packageId),
            this.userRepo.findUserByIdWithRole(authUser.userId),
        ]);

        if (!user || user.status !== UserStatus.Active) {
            throw new NotFoundException(messages.userNotFound);
        }

        if (!packageData.status) {
            throw new BadRequestException(messages.packageNotAvailableForPurchase);
        }

        const purchasedAt = new Date();
        const expiredAt = this.calculateExpiredAt(purchasedAt, packageData.valid_days);
        const purchase = await this.packageRepo.createUserPackagePurchase({
            user,
            package: packageData,
            package_type: packageData.package_type,
            price: packageData.price,
            number_of_sessions: packageData.number_of_sessions,
            remaining_sessions: packageData.number_of_sessions,
            valid_days: packageData.valid_days,
            purchased_at: purchasedAt,
            expired_at: expiredAt,
        });

        return new PackagePurchaseResponseDto(purchase);
    }

    async listPackagePurchases(
        query: FetchPackagePurchasesQueryPayload,
    ): Promise<PackagePurchaseListResponseDto> {
        const { purchases, total, page, pageSize, offset } =
            await this.packageRepo.listUserPackagePurchases(query);

        return new PackagePurchaseListResponseDto(
            purchases,
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

    private calculateExpiredAt(purchasedAt: Date, validDays: number): Date {
        const expiredAt = new Date(purchasedAt);
        expiredAt.setDate(expiredAt.getDate() + validDays);
        return expiredAt;
    }

}
