import { AccessModule, AccessPermission, Roles } from '../../../../config';
import { DbDataSource } from '../connection';
import { AccessControlEntity, AccessModuleEntity, RoleEntity } from '../entity';

export async function seedRosterAccessControls() {
    const roleRepo = DbDataSource.getRepository(RoleEntity);
    const moduleRepo = DbDataSource.getRepository(AccessModuleEntity);
    const accessControlRepo = DbDataSource.getRepository(AccessControlEntity);

    const rosterModule = await moduleRepo.findOne({
        where: { key: AccessModule.RosterManagement },
    });
    if (!rosterModule) {
        console.log('Roster Management module not found, skipping roster access control seed');
        return;
    }

    for (const roleName of [Roles.Admin, Roles.SubAdmin]) {
        const role = await roleRepo.findOne({ where: { name: roleName } });
        if (!role) {
            console.log(`${roleName} role not found, skipping roster access control seed`);
            continue;
        }

        for (const permission of Object.values(AccessPermission)) {
            const exists = await accessControlRepo.findOne({
                where: {
                    module: { id: rosterModule.id },
                    role: { id: role.id },
                    permission,
                },
                relations: { module: true, role: true },
            });

            if (exists) {
                console.log(`Roster access already exists: ${roleName}:${permission}`);
                continue;
            }

            await accessControlRepo.save({
                module: rosterModule,
                role,
                user: null,
                permission,
            });
            console.log(`Roster access created: ${roleName}:${permission}`);
        }
    }

    console.log('Roster access controls seeded successfully');
}
