import { AccessModule, AccessPermission, Roles } from '../../../../config';
import { DbDataSource } from '../connection';
import { AccessControlEntity, AccessModuleEntity, RoleEntity } from '../entity';

export async function seedAdminAccessControls() {
    const roleRepo = DbDataSource.getRepository(RoleEntity);
    const moduleRepo = DbDataSource.getRepository(AccessModuleEntity);
    const accessControlRepo = DbDataSource.getRepository(AccessControlEntity);

    const adminRole = await roleRepo.findOne({ where: { name: Roles.Admin } });
    if (!adminRole) {
        console.log('Admin role not found, skipping admin access control seed');
        return;
    }

    const modules = await moduleRepo.find({ order: { sort_order: 'ASC' } });
    const permissionsByModule = (moduleKey: AccessModule): AccessPermission[] =>
        moduleKey === AccessModule.AccessControl
            ? [AccessPermission.Read, AccessPermission.Update, AccessPermission.Delete]
            : Object.values(AccessPermission);

    for (const moduleData of modules) {
        for (const permission of permissionsByModule(moduleData.key)) {
            const exists = await accessControlRepo.findOne({
                where: {
                    module: { id: moduleData.id },
                    role: { id: adminRole.id },
                    permission,
                },
                relations: { module: true, role: true },
            });

            if (exists) {
                console.log(`Admin access already exists: ${moduleData.key}:${permission}`);
                continue;
            }

            await accessControlRepo.save({
                module: moduleData,
                role: adminRole,
                user: null,
                permission,
            });
            console.log(`Admin access created: ${moduleData.key}:${permission}`);
        }
    }

    console.log('Admin access controls seeded successfully');
}
