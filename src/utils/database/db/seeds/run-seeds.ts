import { DbDataSource } from '../connection';
import { seedBranches } from './branch.seed';
import { seedRoles } from './role.seed';
import { seedUsers } from './user.seed';

async function runSeeds() {
    await DbDataSource.initialize();

    await seedRoles();
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
