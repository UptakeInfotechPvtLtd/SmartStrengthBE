import { AccessModule, availableAccessModules } from '../../../../config';
import { DbDataSource } from '../connection';
import { AccessControlEntity, AccessModuleEntity } from '../entity';

export async function seedAccessModules() {
    const accessModuleRepo = DbDataSource.getRepository(AccessModuleEntity);

    const rosterModule = availableAccessModules.find(
        (moduleData) => moduleData.key === AccessModule.RosterManagement,
    );
    const oldSlotModule = await accessModuleRepo.findOne({
        where: { key: 'slot_management' as AccessModule },
    });
    const existingRosterModule = await accessModuleRepo.findOne({
        where: { key: AccessModule.RosterManagement },
    });
    const oldAvailabilityModule = await accessModuleRepo.findOne({
        where: { key: 'availability_management' as AccessModule },
    });

    if (rosterModule && oldSlotModule && !existingRosterModule) {
        oldSlotModule.key = rosterModule.key;
        oldSlotModule.name = rosterModule.name;
        oldSlotModule.sort_order = rosterModule.sort_order;
        await accessModuleRepo.save(oldSlotModule);
        console.log('Access module renamed: slot_management -> roster_management');
    }

    if (oldAvailabilityModule) {
        await DbDataSource.getRepository(AccessControlEntity)
            .createQueryBuilder()
            .softDelete()
            .where('module_id = :moduleId', { moduleId: oldAvailabilityModule.id })
            .execute();
        await accessModuleRepo.softRemove(oldAvailabilityModule);
        console.log('Access module removed: availability_management');
    }

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
