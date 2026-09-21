import { DbDataSource } from '../connection';
import { seedBranches } from './branch.seed';
import { seedRoles } from './role.seed';
import { seedUsers } from './user.seed';
import { seedAccessModules } from './access-module.seed';
import { seedAdminAccessControls } from './admin-access-control.seed';
import { seedUserAccessControls } from './user-access-control.seed';
import { seedRosterAccessControls } from './roster-access-control.seed';
import { seedStaffAccessControls } from './staff-access-control.seed';

async function runSeeds() {
    await DbDataSource.initialize();

    await seedRoles();
    await seedAccessModules();
    await seedAdminAccessControls();
    await seedRosterAccessControls();
    await seedUserAccessControls();
    await seedStaffAccessControls();
    await seedBranches();
    await seedUsers();

    await DbDataSource.destroy();
}

runSeeds()
    .then(() => console.log('All auth seeds completed'))
    .catch((err) => {
        console.error('Seed failed:', err);
        process.exit(1);
    });
