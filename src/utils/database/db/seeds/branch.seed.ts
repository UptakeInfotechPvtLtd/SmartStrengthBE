import { DbDataSource } from '../connection';
import { BranchEntity } from '../entity';

export async function seedBranches() {
    const branchRepo = DbDataSource.getRepository(BranchEntity);

    const branches = [
        {
            name: 'Ahmedabad Main Branch',
            contact_number: '9876543210',
            map_link: 'https://maps.google.com/?q=Ahmedabad',
            address: 'Main Road, Ahmedabad',
            opening_time: '09:00',
            closing_time: '18:00',
            branch_images: ['https://example.com/branch-ahmedabad-1.jpg'],
            status: true,
        },
        {
            name: 'Surat Training Branch',
            contact_number: '9876543211',
            map_link: 'https://maps.google.com/?q=Surat',
            address: 'Ring Road, Surat',
            opening_time: '10:00',
            closing_time: '19:00',
            branch_images: ['https://example.com/branch-surat-1.jpg'],
            status: true,
        },
    ];

    for (const branch of branches) {
        const exists = await branchRepo.findOne({ where: { name: branch.name } });
        if (exists) {
            console.log(`Branch already exists: ${branch.name}`);
            continue;
        }

        await branchRepo.save(branch);
        console.log(`Branch created: ${branch.name}`);
    }

    console.log('Branches seeded successfully');
}
