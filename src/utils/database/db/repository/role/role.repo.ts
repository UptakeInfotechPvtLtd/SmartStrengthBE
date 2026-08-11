import { DataSource, Repository } from 'typeorm';
import { handleError } from '../../../../error-handler';
import { RoleEntity } from '../../entity';

export class RoleRepository extends Repository<RoleEntity> {
    constructor(dataSource: DataSource) {
        super(RoleEntity, dataSource.createEntityManager());
    }

    public async findRoleById(roleId: string): Promise<RoleEntity | null> {
        return handleError(async () => {
            const role = await this.findOne({ where: { id: roleId } });
            return role;
        });
    }

    public async findRoleByName(name: string): Promise<RoleEntity | null> {
        return handleError(async () => {
            const role = await this.findOne({ where: { name: name } });
            return role;
        });
    }

    public async findAllRoles(): Promise<RoleEntity[]> {
        return handleError(() => this.find({ order: { name: 'ASC' } }), []);
    }
}
