import { availableAccessModules } from '../../../../config';
import { DbDataSource } from '../connection';
import { AccessModuleEntity } from '../entity';

export async function seedAccessModules() {
    const accessModuleRepo = DbDataSource.getRepository(AccessModuleEntity);

    for (const moduleData of availableAccessModules) {
        const exists = await accessModuleRepo.findOne({ where: { key: moduleData.key } });

        if (exists) {
            exists.name = moduleData.name;
            exists.sort_order = moduleData.sort_order;
            await accessModuleRepo.save(exists);
            console.log(`Access module already exists: ${moduleData.key}`);
        } else {
            await accessModuleRepo.save(moduleData);
            console.log(`Access module created: ${moduleData.key}`);
        }
    }

    console.log('Access modules seeded successfully');
}
