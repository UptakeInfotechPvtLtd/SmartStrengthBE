import { DbDataSource } from '../connection';
import { BranchEntity } from '../entity';
import { BranchStatus } from '../../../../config';

export async function seedBranches() {
    const branchRepo = DbDataSource.getRepository(BranchEntity);

    const branches = [
        {
            branch_name: 'Ahmedabad Main Branch',
            map_url: 'https://maps.google.com/?q=Ahmedabad',
            address: 'Main Road, Ahmedabad',
            opening_time: '09:00',
            closing_time: '18:00',
            status: BranchStatus.Active,
        },
        {
            branch_name: 'Surat Training Branch',
            map_url: 'https://maps.google.com/?q=Surat',
            address: 'Ring Road, Surat',
            opening_time: '10:00',
            closing_time: '19:00',
            status: BranchStatus.Active,
        },
    ];

    for (const branch of branches) {
        const exists = await branchRepo.findOne({ where: { branch_name: branch.branch_name } });
        if (exists) {
            console.log(`Branch already exists: ${branch.branch_name}`);
            continue;
        }

        await branchRepo.save(branch);
        console.log(`Branch created: ${branch.branch_name}`);
    }

    console.log('Branches seeded successfully');
}
