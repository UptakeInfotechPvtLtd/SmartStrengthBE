import { Brackets, DataSource, Repository } from 'typeorm';
import { FetchPackagesQueryPayload } from '../../../../../validations';
import { getOffset } from '../../../../common.utils';
import { handleError } from '../../../../error-handler';
import { PackageEntity } from '../../entity';

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
                .where('LOWER(package.package_name) = :packageName', {
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
                            qb.where('package.package_name ILIKE :search', {
                                search: `%${query.search}%`,
                            })
                                .orWhere('package.best_for ILIKE :search', {
                                    search: `%${query.search}%`,
                                })
                                .orWhere('package.description ILIKE :search', {
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

    private normalizeStatus(status: unknown): boolean | undefined {
        if (status === true || status === 'true') return true;
        if (status === false || status === 'false') return false;
        return undefined;
    }
}
