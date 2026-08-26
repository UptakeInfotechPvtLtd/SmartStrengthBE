import { AccessModule, AccessPermission, Roles } from '../../../../config';
import { DbDataSource } from '../connection';
import { AccessControlEntity, AccessModuleEntity, RoleEntity } from '../entity';

export async function seedUserAccessControls() {
    const roleRepo = DbDataSource.getRepository(RoleEntity);
    const moduleRepo = DbDataSource.getRepository(AccessModuleEntity);
    const accessControlRepo = DbDataSource.getRepository(AccessControlEntity);

    const userRole = await roleRepo.findOne({ where: { name: Roles.User } });
    if (!userRole) {
        console.log('User role not found, skipping user access control seed');
        return;
    }

    const readableModules = [
        AccessModule.SingleSessionManagement,
        AccessModule.PackageManagement,
        AccessModule.VideoManagement,
    ];

    for (const moduleKey of readableModules) {
        const moduleData = await moduleRepo.findOne({ where: { key: moduleKey } });
        if (!moduleData) {
            console.log(`Access module not found, skipping: ${moduleKey}`);
            continue;
        }

        const exists = await accessControlRepo.findOne({
            where: {
                module: { id: moduleData.id },
                role: { id: userRole.id },
                permission: AccessPermission.Read,
            },
            relations: { module: true, role: true },
        });

        if (exists) {
            console.log(`User access already exists: ${moduleKey}:${AccessPermission.Read}`);
            continue;
        }

        await accessControlRepo.save({
            module: moduleData,
            role: userRole,
            user: null,
            permission: AccessPermission.Read,
        });
        console.log(`User access created: ${moduleKey}:${AccessPermission.Read}`);
    }

    console.log('User access controls seeded successfully');
}
