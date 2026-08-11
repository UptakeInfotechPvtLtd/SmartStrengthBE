import { Roles } from '../../../../config';
import { DbDataSource } from '../connection';
import { RoleEntity } from '../entity';

export async function seedRoles() {
    const repo = DbDataSource.getRepository(RoleEntity);

    const roles = [
        { name: Roles.Admin, description: 'System administrator' },
        { name: Roles.SubAdmin, description: 'Sub administrator' },
        { name: Roles.Trainer, description: 'Trainer' },
        { name: Roles.User, description: 'Normal user' },
    ];

    for (const role of roles) {
        const exists = await repo.findOne({ where: { name: role.name } });

        if (!exists) {
            await repo.save(role);
            console.log(`Role created: ${role.name}`);
        } else {
            console.log(`Role already exists: ${role.name}`);
        }
    }

    console.log('Roles seeded successfully');
}
