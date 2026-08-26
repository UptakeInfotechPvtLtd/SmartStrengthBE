import { Brackets, DataSource, Repository } from 'typeorm';
import {
    FetchPackagePurchasesQueryPayload,
    FetchPackagesQueryPayload,
} from '../../../../../validations';
import { getOffset } from '../../../../common.utils';
import { handleError } from '../../../../error-handler';
import { PackageEntity, UserPackageEntity } from '../../entity';

export class PackageRepository extends Repository<PackageEntity> {
    constructor(dataSource: DataSource) {
        super(PackageEntity, dataSource.createEntityManager());
    }

    async findPackageById(id?: string): Promise<PackageEntity | null> {
        return handleError(() => this.findOne({ where: { id } }));
    }

    async findPackageByName(packageName: string): Promise<PackageEntity | null> {
        return handleError(() =>
            this.createQueryBuilder('package')
                .where('LOWER(package.package_type) = :packageName', {
                    packageName: packageName.toLowerCase(),
                })
                .getOne(),
        );
    }

    async createPackage(packageData: Partial<PackageEntity>): Promise<PackageEntity> {
        return handleError(() => this.save(packageData));
    }

    async updatePackage(packageData: PackageEntity): Promise<PackageEntity> {
        return handleError(() => this.save(packageData));
    }

    async softDeletePackage(packageId?: string): Promise<void> {
        return handleError(async () => {
            await this.createQueryBuilder()
                .softDelete()
                .where('id = :packageId', { packageId })
                .execute();
        });
    }

    async listPackages(query: FetchPackagesQueryPayload): Promise<{
        packages: PackageEntity[];
        total: number;
        page: number;
        pageSize: number;
        offset: number;
    }> {
        return handleError(
            async () => {
                const { page, pageSize, offset, limit } = getOffset(query);
                const queryBuilder = this.createQueryBuilder('package');

                if (query.search) {
                    queryBuilder.andWhere(
                        new Brackets((qb) => {
                            qb.where('package.package_type ILIKE :search', {
                                search: `%${query.search}%`,
                            });
                        }),
                    );
                }

                const status = this.normalizeStatus(query.status);
                if (typeof status === 'boolean') {
                    queryBuilder.andWhere('package.status = :status', { status });
                }

                queryBuilder
                    .orderBy(`package.${query.orderBy || 'created_at'}`, query.order || 'DESC')
                    .skip(offset)
                    .take(limit);

                const [packages, total] = await queryBuilder.getManyAndCount();

                return { packages, total, page, pageSize, offset };
            },
            {
                packages: [],
                total: 0,
                page: Number(query.page) || 1,
                pageSize: Number(query.pageSize) || 10,
                offset: 0,
            },
        );
    }

    async createUserPackagePurchase(
        userPackage: Partial<UserPackageEntity>,
    ): Promise<UserPackageEntity> {
        return handleError(async () => {
            const savedPurchase = await this.manager.save(UserPackageEntity, userPackage);
            return (await this.findUserPackagePurchaseById(savedPurchase.id)) || savedPurchase;
        });
    }

    async findUserPackagePurchaseById(id?: string): Promise<UserPackageEntity | null> {
        return handleError(() =>
            this.manager.findOne(UserPackageEntity, {
                where: { id },
                relations: { user: true, package: true },
            }),
        );
    }

    async listUserPackagePurchases(query: FetchPackagePurchasesQueryPayload): Promise<{
        purchases: UserPackageEntity[];
        total: number;
        page: number;
        pageSize: number;
        offset: number;
    }> {
        return handleError(
            async () => {
                const { page, pageSize, offset, limit } = getOffset(query);
                const queryBuilder = this.manager
                    .getRepository(UserPackageEntity)
                    .createQueryBuilder('purchase')
                    .leftJoinAndSelect('purchase.user', 'user')
                    .leftJoinAndSelect('purchase.package', 'package');

                if (query.search) {
                    queryBuilder.andWhere(
                        new Brackets((qb) => {
                            qb.where('user.full_name ILIKE :search', {
                                search: `%${query.search}%`,
                            })
                                .orWhere('user.email ILIKE :search', {
                                    search: `%${query.search}%`,
                                })
                                .orWhere('user.phone_no ILIKE :search', {
                                    search: `%${query.search}%`,
                                })
                                .orWhere('purchase.package_type ILIKE :search', {
                                    search: `%${query.search}%`,
                                });
                        }),
                    );
                }

                if (query.userId) {
                    queryBuilder.andWhere('user.id = :userId', { userId: query.userId });
                }

                if (query.packageId) {
                    queryBuilder.andWhere('package.id = :packageId', {
                        packageId: query.packageId,
                    });
                }

                queryBuilder
                    .orderBy(`purchase.${query.orderBy || 'purchased_at'}`, query.order || 'DESC')
                    .addOrderBy('purchase.id', 'DESC')
                    .skip(offset)
                    .take(limit);

                const [purchases, total] = await queryBuilder.getManyAndCount();

                return { purchases, total, page, pageSize, offset };
            },
            {
                purchases: [],
                total: 0,
                page: Number(query.page) || 1,
                pageSize: Number(query.pageSize) || 10,
                offset: 0,
            },
        );
    }

    private normalizeStatus(status: unknown): boolean | undefined {
        if (status === true || status === 'true') return true;
        if (status === false || status === 'false') return false;
        return undefined;
    }
}
