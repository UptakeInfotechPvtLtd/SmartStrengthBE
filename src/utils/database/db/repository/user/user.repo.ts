import { Brackets, DataSource, In, Repository } from 'typeorm';
import { FetchUsersQueryPayload } from '../../../../../validations';
import { Roles } from '../../../../../config';
import { getOffset } from '../../../../common.utils';
import { handleError } from '../../../../error-handler';
import { UserBranchEntity, UserEntity } from '../../entity';

export class UserRepository extends Repository<UserEntity> {
    constructor(dataSource: DataSource) {
        super(UserEntity, dataSource.createEntityManager());
    }

    async findUserByEmail(email: string): Promise<UserEntity | null> {
        return handleError(() =>
            this.createQueryBuilder('user')
                .leftJoinAndSelect('user.role', 'role')
                .leftJoinAndSelect('user.userBranches', 'userBranches')
                .leftJoinAndSelect('userBranches.branch', 'branch')
                .where('LOWER(user.email) = :email', { email: email.toLowerCase() })
                .andWhere('user.status = :status', { status: true })
                .getOne(),
        );
    }

    async findUserByEmailWithRole(email: string): Promise<UserEntity | null> {
        return handleError(() =>
            this.createQueryBuilder('user')
                .leftJoinAndSelect('user.role', 'role')
                .leftJoinAndSelect('user.userBranches', 'userBranches')
                .leftJoinAndSelect('userBranches.branch', 'branch')
                .where('LOWER(user.email) = :email', { email: email.toLowerCase() })
                .getOne(),
        );
    }

    async findUserByIdWithRole(userId: string): Promise<UserEntity | null> {
        return handleError(() =>
            this.findOne({
                where: { id: userId },
                relations: { role: true, userBranches: { branch: true } },
            }),
        );
    }

    async createUser(user: Partial<UserEntity>): Promise<UserEntity> {
        return handleError(() => this.save(user));
    }

    async updateUser(user: UserEntity): Promise<UserEntity> {
        return handleError(() => this.save(user));
    }

    async softDeleteUser(userId: string): Promise<void> {
        return handleError(async () => {
            await this.createQueryBuilder()
                .softDelete()
                .where('id = :userId', { userId })
                .execute();
        });
    }

    async listUsers(
        query: FetchUsersQueryPayload,
        allowedRoles: Roles[],
    ): Promise<{
        users: UserEntity[];
        total: number;
        page: number;
        pageSize: number;
        offset: number;
    }> {
        return handleError(
            async () => {
                const { page, pageSize, offset, limit } = getOffset(query);
                const queryBuilder = this.createQueryBuilder('user')
                    .leftJoinAndSelect('user.role', 'role')
                    .leftJoinAndSelect('user.userBranches', 'userBranches')
                    .leftJoinAndSelect('userBranches.branch', 'branch')
                    .where('role.name IN (:...allowedRoles)', { allowedRoles });

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
                                });
                        }),
                    );
                }

                if (query.roleId) {
                    queryBuilder.andWhere('role.id = :roleId', { roleId: query.roleId });
                }

                if (typeof query.status === 'boolean') {
                    queryBuilder.andWhere('user.status = :status', { status: query.status });
                }

                queryBuilder
                    .orderBy(`user.${query.orderBy || 'created_at'}`, query.order || 'DESC')
                    .skip(offset)
                    .take(limit);

                const [users, total] = await queryBuilder.getManyAndCount();

                return { users, total, page, pageSize, offset };
            },
            {
                users: [],
                total: 0,
                page: Number(query.page) || 1,
                pageSize: Number(query.pageSize) || 10,
                offset: 0,
            },
        );
    }

    async updateUserBranches(user: UserEntity, branchIds: string[]): Promise<UserEntity> {
        return handleError(async () => {
            await this.manager.delete(UserBranchEntity, { user: { id: user.id } });
            user.userBranches = branchIds.map((branchId) =>
                this.manager.create(UserBranchEntity, {
                    user,
                    branch: { id: branchId },
                }),
            );
            return this.save(user);
        });
    }

    async findUsersByIds(userIds: string[]): Promise<UserEntity[]> {
        return handleError(() => this.find({ where: { id: In(userIds) } }), []);
    }

    async findAssignedBranchIds(userId: string): Promise<string[]> {
        return handleError(async () => {
            const userBranches = await this.manager.find(UserBranchEntity, {
                where: { user: { id: userId } },
                relations: { branch: true },
            });

            return userBranches
                .map((userBranch) => userBranch.branch?.id)
                .filter((branchId): branchId is string => Boolean(branchId));
        }, []);
    }
}
