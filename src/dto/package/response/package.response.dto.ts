import { IPaginationMeta } from '../../../config';
import { PackageEntity } from '../../../utils';

export class PackageResponseDto {
    id!: string;
    packageType!: string;
    price!: number;
    numberOfSessions!: number;
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
