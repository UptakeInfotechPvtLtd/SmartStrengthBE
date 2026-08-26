import { Brackets, DataSource, In, Repository } from 'typeorm';
import { BranchStatus, Roles, UserStatus } from '../../../../../config/enum';
import { handleError } from '../../../../error-handler';
import { BranchEntity, TrainerRosterEntity, UserEntity } from '../../entity';

export class RosterRepository extends Repository<TrainerRosterEntity> {
    constructor(private readonly dataSource: DataSource) {
        super(TrainerRosterEntity, dataSource.createEntityManager());
    }

    async createRosters(rosters: Partial<TrainerRosterEntity>[]): Promise<TrainerRosterEntity[]> {
        return handleError(() =>
            this.dataSource.transaction(async (manager) => {
                const saved = await manager.save(TrainerRosterEntity, rosters);
                return manager.find(TrainerRosterEntity, {
                    where: { id: In(saved.map((roster) => roster.id)) },
                    relations: { branch: true, trainer: true },
                    order: { day_of_week: 'ASC', start_time: 'ASC' },
                });
            }),
        );
    }

    async updateRoster(roster: TrainerRosterEntity): Promise<TrainerRosterEntity> {
        return handleError(async () => {
            const saved = await this.save(roster);
            return (await this.findRosterById(saved.id)) || saved;
        });
    }

    async softDeleteRoster(rosterId?: string): Promise<void> {
        return handleError(async () => {
            await this.createQueryBuilder()
                .softDelete()
                .where('id = :rosterId', { rosterId })
                .execute();
        });
    }

    async findRosterById(
        id?: string,
        assignedBranchIds?: string[],
    ): Promise<TrainerRosterEntity | null> {
        return handleError(() => {
            const queryBuilder = this.createQueryBuilder('roster')
                .leftJoinAndSelect('roster.branch', 'branch')
                .leftJoinAndSelect('roster.trainer', 'trainer')
                .where('roster.id = :id', { id });

            if (assignedBranchIds) {
                queryBuilder.andWhere('branch.id IN (:...assignedBranchIds)', {
                    assignedBranchIds: assignedBranchIds.length ? assignedBranchIds : [''],
                });
            }

            return queryBuilder.getOne();
        });
    }

    async listRosters(assignedBranchIds?: string[]): Promise<TrainerRosterEntity[]> {
        return handleError(async () => {
            const queryBuilder = this.createQueryBuilder('roster')
                .leftJoinAndSelect('roster.branch', 'branch')
                .leftJoinAndSelect('roster.trainer', 'trainer');

            if (assignedBranchIds) {
                queryBuilder.andWhere('branch.id IN (:...assignedBranchIds)', {
                    assignedBranchIds: assignedBranchIds.length ? assignedBranchIds : [''],
                });
            }

            queryBuilder
                .orderBy(
                    `CASE roster.day_of_week
                            WHEN 'monday' THEN 1
                            WHEN 'tuesday' THEN 2
                            WHEN 'wednesday' THEN 3
                            WHEN 'thursday' THEN 4
                            WHEN 'friday' THEN 5
                            WHEN 'saturday' THEN 6
                            ELSE 7
                        END`,
                    'ASC',
                )
                .addOrderBy('roster.start_time', 'ASC')
                .addOrderBy('roster.created_at', 'DESC');

            return queryBuilder.getMany();
        }, []);
    }

    async findActiveBranchesByIds(branchIds: string[]): Promise<BranchEntity[]> {
        return handleError(
            () =>
                this.dataSource.getRepository(BranchEntity).find({
                    where: { id: In(branchIds), status: BranchStatus.Active },
                }),
            [],
        );
    }

    async findActiveAssignedTrainersByIds(trainerIds: string[]): Promise<UserEntity[]> {
        return handleError(
            () =>
                this.dataSource
                    .getRepository(UserEntity)
                    .createQueryBuilder('trainer')
                    .leftJoinAndSelect('trainer.role', 'role')
                    .leftJoinAndSelect('trainer.userBranches', 'userBranches')
                    .leftJoinAndSelect('userBranches.branch', 'branch')
                    .where('trainer.id IN (:...trainerIds)', { trainerIds })
                    .andWhere('trainer.status = :status', { status: UserStatus.Active })
                    .andWhere('role.name = :roleName', { roleName: Roles.Trainer })
                    .getMany(),
            [],
        );
    }

    async findOverlappingRosters(entries: RosterOverlapLookup[]): Promise<TrainerRosterEntity[]> {
        if (!entries.length) {
            return [];
        }

        return handleError(() => {
            const queryBuilder = this.createQueryBuilder('roster')
                .leftJoinAndSelect('roster.branch', 'branch')
                .leftJoinAndSelect('roster.trainer', 'trainer')
                .where(
                    new Brackets((outerQb) => {
                        entries.forEach((entry, index) => {
                            const condition =
                                `trainer.id = :trainerId${index} ` +
                                `AND roster.day_of_week = :dayOfWeek${index} ` +
                                `AND roster.start_time < :endTime${index} ` +
                                `AND roster.end_time > :startTime${index}`;
                            const params = {
                                [`trainerId${index}`]: entry.trainerId,
                                [`dayOfWeek${index}`]: entry.dayOfWeek,
                                [`startTime${index}`]: entry.startTime,
                                [`endTime${index}`]: entry.endTime,
                            };

                            if (index === 0) {
                                outerQb.where(condition, params);
                            } else {
                                outerQb.orWhere(condition, params);
                            }
                        });
                    }),
                );

            const excludeIds = entries
                .map((entry) => entry.excludeRosterId)
                .filter((id): id is string => Boolean(id));
            if (excludeIds.length) {
                queryBuilder.andWhere('roster.id NOT IN (:...excludeIds)', { excludeIds });
            }

            return queryBuilder.getMany();
        }, []);
    }
}

export interface RosterOverlapLookup {
    trainerId: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    excludeRosterId?: string;
}
