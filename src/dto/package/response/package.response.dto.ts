import { IPaginationMeta } from '../../../config';
import { PackageEntity, UserPackageEntity } from '../../../utils/database';

export class PackageResponseDto {
    id!: string;
    packageType!: string;
    price!: number;
    numberOfSessions!: number;
    remainingSessions!: number;
    validDays!: number;
    status!: boolean;
    createdAt!: Date;
    updatedAt!: Date;

    constructor(packageData?: PackageEntity) {
        this.id = packageData?.id || '';
        this.packageType = packageData?.package_type || '';
        this.price = Number(packageData?.price || 0);
        this.numberOfSessions = packageData?.number_of_sessions || 0;
        this.validDays = packageData?.valid_days || 0;
        this.status = packageData?.status || false;
        this.createdAt = packageData?.created_at!;
        this.updatedAt = packageData?.updated_at!;
    }
}

export class PackageListResponseDto {
    results!: PackageResponseDto[];
    pagination!: IPaginationMeta;

    constructor(packages: PackageEntity[], pagination: IPaginationMeta) {
        this.results = packages.map((packageData) => new PackageResponseDto(packageData));
        this.pagination = pagination;
    }
}

export class PackagePurchaseResponseDto {
    id!: string;
    user!: {
        id: string;
        fullName: string | null;
        email: string | null;
        phoneNo: string | null;
    } | null;
    package!: {
        id: string;
        packageType: string;
        price: number;
        numberOfSessions: number;
        validDays: number;
    } | null;
    packageType!: string;
    price!: number;
    numberOfSessions!: number;
    remainingSessions!: number;
    validDays!: number;
    purchasedAt!: Date;
    expiredAt!: Date;
    createdAt!: Date;
    updatedAt!: Date;

    constructor(purchase?: UserPackageEntity) {
        this.id = purchase?.id || '';
        this.user = purchase?.user
            ? {
                  id: purchase.user.id,
                  fullName: purchase.user.full_name,
                  email: purchase.user.email,
                  phoneNo: purchase.user.phone_no,
              }
            : null;
        this.package = purchase?.package
            ? {
                  id: purchase.package.id,
                  packageType: purchase.package.package_type,
                  price: Number(purchase.package.price || 0),
                  numberOfSessions: purchase.package.number_of_sessions,
                  validDays: purchase.package.valid_days,
              }
            : null;
        this.packageType = purchase?.package_type || '';
        this.price = Number(purchase?.price || 0);
        this.numberOfSessions = purchase?.number_of_sessions || 0;
        this.remainingSessions = purchase?.remaining_sessions || 0;
        this.validDays = purchase?.valid_days || 0;
        this.purchasedAt = purchase?.purchased_at!;
        this.expiredAt = purchase?.expired_at!;
        this.createdAt = purchase?.created_at!;
        this.updatedAt = purchase?.updated_at!;
    }
}

export class PackagePurchaseListResponseDto {
    results!: PackagePurchaseResponseDto[];
    pagination!: IPaginationMeta;

    constructor(purchases: UserPackageEntity[], pagination: IPaginationMeta) {
        this.results = purchases.map((purchase) => new PackagePurchaseResponseDto(purchase));
        this.pagination = pagination;
    }
}
