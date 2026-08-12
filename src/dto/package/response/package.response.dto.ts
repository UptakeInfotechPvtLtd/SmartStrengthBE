import { IPaginationMeta } from '../../../config';
import { PackageEntity } from '../../../utils';

export class PackageResponseDto {
    id!: string;
    packageName!: string;
    price!: number;
    numberOfSessions!: number;
    validityInDays!: number;
    bestFor!: string;
    description!: string | null;
    status!: boolean;
    createdAt!: Date;
    updatedAt!: Date;

    constructor(packageData?: PackageEntity) {
        this.id = packageData?.id || '';
        this.packageName = packageData?.package_name || '';
        this.price = Number(packageData?.price || 0);
        this.numberOfSessions = packageData?.number_of_sessions || 0;
        this.validityInDays = packageData?.validity_in_days || 0;
        this.bestFor = packageData?.best_for || '';
        this.description = packageData?.description || null;
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
