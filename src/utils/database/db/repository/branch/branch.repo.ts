import { Brackets, DataSource, In, Repository } from 'typeorm';
import { BranchEntity, BranchMaintenanceEntity, UserEntity } from '../../entity';
import { FetchBranchesQueryPayload } from '../../../../../validations';
import { BranchOrderBy, BranchStatus } from '../../../../../config';
import { getOffset } from '../../../../common.utils';
import { handleError } from '../../../../error-handler';

export class BranchRepository extends Repository<BranchEntity> {
    constructor(dataSource: DataSource) {
        super(BranchEntity, dataSource.createEntityManager());
    }

    async findBranchById(id?: string, assignedUserId?: string): Promise<BranchEntity | null> {
        return handleError(async () => {
            const queryBuilder = this.createQueryBuilder('branch')
                .leftJoinAndSelect('branch.availabilitySettings', 'availabilitySettings')
                .where('branch.id = :id', { id });

            if (assignedUserId) {
                queryBuilder
                    .innerJoin('branch.userBranches', 'userBranch')
                    .andWhere('userBranch.user_id = :assignedUserId', { assignedUserId });
            }

            const branch = await queryBuilder.getOne();
            await this.attachFutureMaintenances(branch ? [branch] : []);

            return branch;
        });
    }

    async findActiveBranchesByIds(ids: string[]): Promise<BranchEntity[]> {
        return handleError(
            () => this.find({ where: { id: In(ids), status: BranchStatus.Active } }),
            [],
        );
    }

    async createBranch(branch: Partial<BranchEntity>): Promise<BranchEntity> {
        return handleError(() => this.save(branch));
    }

    async updateBranch(branch: BranchEntity): Promise<BranchEntity> {
        return handleError(() => this.save(branch));
    }

    async softDeleteBranch(branch: BranchEntity): Promise<BranchEntity> {
        return handleError(() => this.softRemove(branch));
    }

    async listBranches(
        query: FetchBranchesQueryPayload,
        assignedBranchIds?: string[],
    ): Promise<{
        branches: BranchEntity[];
        total: number;
        page: number;
        pageSize: number;
        offset: number;
    }> {
        return handleError(
            async () => {
                const { page, pageSize, offset, limit } = getOffset(query);
                const queryBuilder = this.createQueryBuilder('branch').leftJoinAndSelect(
                    'branch.availabilitySettings',
                    'availabilitySettings',
                );

                if (assignedBranchIds) {
                    queryBuilder.andWhere('branch.id IN (:...assignedBranchIds)', {
                        assignedBranchIds: assignedBranchIds.length ? assignedBranchIds : [''],
                    });
                }

                if (query.search) {
                    queryBuilder.andWhere(
                        new Brackets((qb) => {
                            qb.where('branch.branch_name ILIKE :search', {
                                search: `%${query.search}%`,
                            })
                                .orWhere('branch.map_url ILIKE :search', {
                                    search: `%${query.search}%`,
                                })
                                .orWhere('branch.address ILIKE :search', {
                                    search: `%${query.search}%`,
                                });
                        }),
                    );
                }

                if (query.status) {
                    queryBuilder.andWhere('LOWER(branch.status) = :status', {
                        status: query.status.toLowerCase(),
                    });
                }

                queryBuilder
                    .orderBy(
                        `branch.${this.getOrderByColumn(query.orderBy)}`,
                        query.order || 'DESC',
                    )
                    .addOrderBy('branch.id', 'DESC')
                    .skip(offset)
                    .take(limit);

                const [branches, total] = await queryBuilder.getManyAndCount();
                await this.attachFutureMaintenances(branches);

                return { branches, total, page, pageSize, offset };
            },
            {
                branches: [],
                total: 0,
                page: Number(query.page) || 1,
                pageSize: Number(query.pageSize) || 10,
                offset: 0,
            },
        );
    }

    private getOrderByColumn(orderBy?: string): string {
        const orderByMap: Record<string, string> = {
            [BranchOrderBy.BranchName]: 'branch_name',
            [BranchOrderBy.OpeningTime]: 'opening_time',
            [BranchOrderBy.ClosingTime]: 'closing_time',
            [BranchOrderBy.CreatedAt]: 'created_at',
            [BranchOrderBy.UpdatedAt]: 'updated_at',
            branch_name: 'branch_name',
            opening_time: 'opening_time',
            closing_time: 'closing_time',
            created_at: 'created_at',
            updated_at: 'updated_at',
        };

        return orderByMap[orderBy || ''] || 'created_at';
    }

    async findUserByIdWithRoleAndBranches(userId: string): Promise<UserEntity | null> {
        return handleError(() =>
            this.manager.findOne(UserEntity, {
                where: { id: userId },
                relations: { role: true, userBranches: { branch: true } },
            }),
        );
    }

    private async attachFutureMaintenances(branches: BranchEntity[]): Promise<void> {
        if (!branches.length) {
            return;
        }

        const branchIds = branches.map((branch) => branch.id);
        const maintenances = await this.manager
            .getRepository(BranchMaintenanceEntity)
            .createQueryBuilder('maintenance')
            .leftJoinAndSelect('maintenance.branch', 'branch')
            .where('branch.id IN (:...branchIds)', { branchIds })
            .andWhere('maintenance.maintenance_date >= :today', { today: this.getTodayDate() })
            .orderBy('maintenance.maintenance_date', 'ASC')
            .addOrderBy('maintenance.time_from', 'ASC')
            .getMany();

        const maintenanceMap = new Map<string, BranchMaintenanceEntity[]>();
        maintenances.forEach((maintenance) => {
            const branchId = maintenance.branch.id;
            const branchMaintenances = maintenanceMap.get(branchId) || [];
            branchMaintenances.push(maintenance);
            maintenanceMap.set(branchId, branchMaintenances);
        });

        branches.forEach((branch) => {
            branch.maintenances = maintenanceMap.get(branch.id) || [];
        });
    }

    private getTodayDate(): string {
        const parts = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Kolkata',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).formatToParts(new Date());
        const dateParts = Object.fromEntries(parts.map((part) => [part.type, part.value]));

        return `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
    }
}
