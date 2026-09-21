import { AccessModule, AccessPermission, Roles } from '../../../../config';
import { DbDataSource } from '../connection';
import { AccessControlEntity, AccessModuleEntity, RoleEntity } from '../entity';

export const defaultStaffRolePermissions: Record<
    Roles.SubAdmin | Roles.Trainer,
    Partial<Record<AccessModule, AccessPermission[]>>
> = {
    [Roles.SubAdmin]: {
        [AccessModule.StaffManagement]: [AccessPermission.Read],
        [AccessModule.UserManagement]: [
            AccessPermission.Create,
            AccessPermission.Read,
            AccessPermission.Update,
        ],
        [AccessModule.BranchManagement]: [AccessPermission.Read, AccessPermission.Update],
        [AccessModule.BookingManagement]: [
            AccessPermission.Create,
            AccessPermission.Read,
            AccessPermission.Update,
            AccessPermission.Delete,
        ],
        [AccessModule.SlotMaintenance]: [
            AccessPermission.Create,
            AccessPermission.Read,
            AccessPermission.Update,
            AccessPermission.Delete,
        ],
        [AccessModule.RosterManagement]: [
            AccessPermission.Create,
            AccessPermission.Read,
            AccessPermission.Update,
            AccessPermission.Delete,
        ],
        [AccessModule.TestimonialManagement]: [AccessPermission.Read, AccessPermission.Update],
        [AccessModule.SingleSessionManagement]: [AccessPermission.Read, AccessPermission.Update],
        [AccessModule.PackageManagement]: [AccessPermission.Read],
        [AccessModule.TrainWithSachinManagement]: [
            AccessPermission.Read,
            AccessPermission.Update,
        ],
        [AccessModule.VideoManagement]: [
            AccessPermission.Create,
            AccessPermission.Read,
            AccessPermission.Update,
        ],
        [AccessModule.Reports]: [AccessPermission.Read],
    },
    [Roles.Trainer]: {
        [AccessModule.UserManagement]: [AccessPermission.Read],
        [AccessModule.BranchManagement]: [AccessPermission.Read],
        [AccessModule.BookingManagement]: [AccessPermission.Read, AccessPermission.Update],
        [AccessModule.SlotMaintenance]: [AccessPermission.Read],
        [AccessModule.RosterManagement]: [AccessPermission.Read],
        [AccessModule.SingleSessionManagement]: [AccessPermission.Read],
        [AccessModule.TrainWithSachinManagement]: [AccessPermission.Read],
        [AccessModule.VideoManagement]: [
            AccessPermission.Create,
            AccessPermission.Read,
            AccessPermission.Update,
        ],
    },
};

export async function seedStaffAccessControls() {
    const roleRepo = DbDataSource.getRepository(RoleEntity);
    const moduleRepo = DbDataSource.getRepository(AccessModuleEntity);
    const accessControlRepo = DbDataSource.getRepository(AccessControlEntity);

    for (const roleName of [Roles.SubAdmin, Roles.Trainer] as const) {
        const role = await roleRepo.findOne({ where: { name: roleName } });
        if (!role) {
            console.log(`${roleName} role not found, skipping staff access control seed`);
            continue;
        }

        const rolePermissions = defaultStaffRolePermissions[roleName];
        for (const [moduleKey, permissions] of Object.entries(rolePermissions) as [
            AccessModule,
            AccessPermission[],
        ][]) {
            const moduleData = await moduleRepo.findOne({ where: { key: moduleKey } });
            if (!moduleData) {
                console.log(`Access module not found, skipping: ${moduleKey}`);
                continue;
            }

            for (const permission of permissions) {
                const exists = await accessControlRepo.findOne({
                    where: {
                        module: { id: moduleData.id },
                        role: { id: role.id },
                        permission,
                    },
                    withDeleted: true,
                });

                if (exists) {
                    continue;
                }

                await accessControlRepo.save({
                    module: moduleData,
                    role,
                    user: null,
                    permission,
                });
                console.log(`Staff access created: ${roleName}:${moduleKey}:${permission}`);
            }
        }
    }

    console.log('Staff access controls seeded successfully');
}
