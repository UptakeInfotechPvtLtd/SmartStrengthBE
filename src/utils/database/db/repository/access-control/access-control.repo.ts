import { DataSource, Repository } from 'typeorm';
import { AccessModule, AccessPermission } from '../../../../../config';
import { handleError } from '../../../../error-handler';
import { AccessControlEntity, AccessModuleEntity } from '../../entity';

export class AccessControlRepository extends Repository<AccessControlEntity> {
    constructor(dataSource: DataSource) {
        super(AccessControlEntity, dataSource.createEntityManager());
    }

    async findAllModules(): Promise<AccessModuleEntity[]> {
        return handleError(
            () => this.manager.find(AccessModuleEntity, { order: { sort_order: 'ASC' } }),
            [],
        );
    }

    async upsertModules(modules: Pick<AccessModuleEntity, 'key' | 'name' | 'sort_order'>[]) {
        return handleError(() =>
            this.manager.upsert(AccessModuleEntity, modules, {
                conflictPaths: ['key'],
                skipUpdateIfNoValuesChanged: true,
            }),
        );
    }

    async findModuleByKey(key: AccessModule): Promise<AccessModuleEntity | null> {
        return handleError(() => this.manager.findOne(AccessModuleEntity, { where: { key } }));
    }

    async findAccessConfig(roleId?: string, userId?: string): Promise<AccessControlEntity[]> {
        return handleError(() => {
            const queryBuilder = this.createQueryBuilder('accessControl')
                .leftJoinAndSelect('accessControl.module', 'module')
                .leftJoinAndSelect('accessControl.role', 'role')
                .leftJoinAndSelect('accessControl.user', 'user')
                .orderBy('module.sort_order', 'ASC')
                .addOrderBy('accessControl.permission', 'ASC');

            if (userId) {
                queryBuilder.where('user.id = :userId', { userId });
            } else if (roleId) {
                queryBuilder.where('role.id = :roleId', { roleId });
            }

            return queryBuilder.getMany();
        }, []);
    }

    async findEffectiveAccessConfig(
        roleId?: string,
        userId?: string,
    ): Promise<AccessControlEntity[]> {
        return handleError(() => {
            const queryBuilder = this.createQueryBuilder('accessControl')
                .leftJoinAndSelect('accessControl.module', 'module')
                .leftJoinAndSelect('accessControl.role', 'role')
                .leftJoinAndSelect('accessControl.user', 'user')
                .orderBy('module.sort_order', 'ASC')
                .addOrderBy('accessControl.permission', 'ASC')
                .where('(role.id = :roleId OR user.id = :userId)', { roleId, userId });

            return queryBuilder.getMany();
        }, []);
    }

    async replaceRoleAccess(
        roleId: string,
        entries: { moduleId: string; permissions: AccessPermission[] }[],
    ): Promise<AccessControlEntity[]> {
        return handleError(async () => {
            await this.createQueryBuilder()
                .softDelete()
                .where('role_id = :roleId', { roleId })
                .andWhere('user_id IS NULL')
                .execute();

            const accessControls = entries.flatMap((entry) =>
                entry.permissions.map((permission) =>
                    this.create({
                        module: { id: entry.moduleId } as AccessModuleEntity,
                        role: { id: roleId } as any,
                        user: null,
                        permission,
                    }),
                ),
            );

            if (!accessControls.length) return [];
            return this.save(accessControls);
        }, []);
    }

    async replaceUserAccess(
        userId: string,
        entries: { moduleId: string; permissions: AccessPermission[] }[],
    ): Promise<AccessControlEntity[]> {
        return handleError(async () => {
            await this.createQueryBuilder()
                .softDelete()
                .where('user_id = :userId', { userId })
                .andWhere('role_id IS NULL')
                .execute();

            const accessControls = entries.flatMap((entry) =>
                entry.permissions.map((permission) =>
                    this.create({
                        module: { id: entry.moduleId } as AccessModuleEntity,
                        role: null,
                        user: { id: userId } as any,
                        permission,
                    }),
                ),
            );

            if (!accessControls.length) return [];
            return this.save(accessControls);
        }, []);
    }

    async hasPermission(
        roleId: string,
        userId: string,
        moduleKey: AccessModule,
        permission: AccessPermission,
    ): Promise<boolean> {
        return handleError(async () => {
            const count = await this.createQueryBuilder('accessControl')
                .innerJoin('accessControl.module', 'module')
                .leftJoin('accessControl.role', 'role')
                .leftJoin('accessControl.user', 'user')
                .where('module.key = :moduleKey', { moduleKey })
                .andWhere('accessControl.permission = :permission', { permission })
                .andWhere('(role.id = :roleId OR user.id = :userId)', { roleId, userId })
                .getCount();

            return count > 0;
        }, false);
    }
}
