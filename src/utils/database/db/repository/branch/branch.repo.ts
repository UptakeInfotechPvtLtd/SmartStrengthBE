import { Brackets, DataSource, Repository } from 'typeorm';
import { BranchEntity } from '../../entity';
import { FetchBranchesQueryPayload } from '../../../../../validations';
import { getOffset } from '../../../../common.utils';

export class BranchRepository extends Repository<BranchEntity> {
    constructor(dataSource: DataSource) {
        super(BranchEntity, dataSource.createEntityManager());
    }

    async findBranchById(id: string): Promise<BranchEntity | null> {
        return this.findOne({ where: { id } });
    }

    async createBranch(branch: Partial<BranchEntity>): Promise<BranchEntity> {
        return this.save(branch);
    }

    async updateBranch(branch: BranchEntity): Promise<BranchEntity> {
        return this.save(branch);
    }

    async softDeleteBranch(branch: BranchEntity): Promise<BranchEntity> {
        return this.softRemove(branch);
    }

    async listBranches(
        query: FetchBranchesQueryPayload,
    ): Promise<{ branches: BranchEntity[]; total: number; page: number; pageSize: number; offset: number }> {
        const { page, pageSize, offset, limit } = getOffset(query);
        const queryBuilder = this.createQueryBuilder('branch');

        if (query.search) {
            queryBuilder.andWhere(
                new Brackets((qb) => {
                    qb.where('branch.name ILIKE :search', { search: `%${query.search}%` })
                        .orWhere('branch.contact_number ILIKE :search', {
                            search: `%${query.search}%`,
                        })
                        .orWhere('branch.address ILIKE :search', { search: `%${query.search}%` });
                }),
            );
        }

        if (typeof query.status === 'boolean') {
            queryBuilder.andWhere('branch.status = :status', { status: query.status });
        }

        queryBuilder
            .orderBy(`branch.${query.orderBy || 'created_at'}`, query.order || 'DESC')
            .skip(offset)
            .take(limit);

        const [branches, total] = await queryBuilder.getManyAndCount();

        return { branches, total, page, pageSize, offset };
    }
}
