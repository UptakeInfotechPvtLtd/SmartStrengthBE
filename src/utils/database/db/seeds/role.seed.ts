import { Roles } from '../../../../config';
import { DbDataSource } from '../connection';
import { RoleEntity } from '../entity';

export async function seedRoles() {
    const repo = DbDataSource.getRepository(RoleEntity);

    const roleDescriptions: Record<Roles, string> = {
        [Roles.Admin]: 'Master Admin',
        [Roles.SubAdmin]: 'Sub Admin',
        [Roles.Trainer]: 'Trainer',
        [Roles.User]: 'Normal User',
    };

    const roles = Object.values(Roles).map((role) => ({
        name: role,
        description: roleDescriptions[role],
    }));

    for (const role of roles) {
        const exists = await repo.findOne({ where: { name: role.name } });

        if (exists) {
            exists.description = role.description;
            await repo.save(exists);
            console.log(`Role already exists: ${role.name}`);
        } else {
            await repo.save(role);
            console.log(`Role created: ${role.name}`);
        }
    }

    console.log('Roles seeded successfully');
}
