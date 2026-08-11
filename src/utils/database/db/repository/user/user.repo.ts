import { DataSource, Repository } from 'typeorm';
import { handleError } from '../../../../error-handler';
import { UserEntity } from '../../entity';

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
}
