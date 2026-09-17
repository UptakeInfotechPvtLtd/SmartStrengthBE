import { Brackets, DataSource, Repository } from 'typeorm';
import {
    Roles,
    BranchAvailabilityStatus,
    BranchStatus,
    RosterStatus,
    TrainerAvailabilityStatus,
    UserStatus,
} from '../../../../../config';
import { FetchTrainerAvailabilityQueryPayload } from '../../../../../validations';
import { getOffset } from '../../../../common.utils';
import { handleError } from '../../../../error-handler';
import {
    BranchEntity,
    BranchMaintenanceEntity,
    BranchAvailabilitySettingEntity,
    TrainerAvailabilityEntity,
    TrainerMaintenanceEntity,
    TrainerRosterEntity,
    UserEntity,
} from '../../entity';

export class AvailabilityManagementRepository extends Repository<BranchAvailabilitySettingEntity> {
    constructor(private readonly dataSource: DataSource) {
        super(BranchAvailabilitySettingEntity, dataSource.createEntityManager());
    }

    async upsertBranchAvailabilityStatus(
        branch: BranchEntity,
        status: BranchAvailabilityStatus,
    ): Promise<BranchAvailabilitySettingEntity> {
        return handleError(async () => {
            const existing = await this.findOne({ where: { branch: { id: branch.id } } });
            let saved: BranchAvailabilitySettingEntity;
            if (existing) {
                existing.status = status;
                saved = await this.save(existing);
            } else {
                saved = await this.save({ branch, status });
            }

            return (
                (await this.findOne({
                    where: { id: saved.id },
                    relations: { branch: { availabilitySettings: true } },
                })) || saved
            );
        });
    }

    async upsertTrainerAvailability(
        trainer: UserEntity,
        status: TrainerAvailabilityStatus,
    ): Promise<TrainerAvailabilityEntity> {
        return handleError(async () => {
            const repo = this.dataSource.getRepository(TrainerAvailabilityEntity);
            const existing = await repo.findOne({ where: { trainer: { id: trainer.id } } });
            let saved: TrainerAvailabilityEntity;
            if (existing) {
                existing.status = status;
                saved = await repo.save(existing);
            } else {
                saved = await repo.save({ trainer, status });
            }

            return (
                (await repo.findOne({
                    where: { id: saved.id },
                    relations: { trainer: { userBranches: { branch: true } } },
                })) || saved
            );
        });
    }

    async listTrainerAvailabilities(
        query: FetchTrainerAvailabilityQueryPayload,
        assignedBranchIds?: string[],
    ): Promise<{
        rows: TrainerAvailabilityEntity[];
        total: number;
        page: number;
        pageSize: number;
        offset: number;
    }> {
        return handleError(
            async () => {
                const { page, pageSize, offset, limit } = getOffset(query);
                const queryBuilder = this.dataSource
                    .getRepository(UserEntity)
                    .createQueryBuilder('trainer')
                    .leftJoinAndSelect('trainer.role', 'role')
                    .leftJoinAndSelect('trainer.userBranches', 'userBranches')
                    .leftJoinAndSelect('userBranches.branch', 'branch')
                    .leftJoinAndMapOne(
                        'trainer.availability',
                        TrainerAvailabilityEntity,
                        'availability',
                        'availability.trainer_id = trainer.id AND availability.deleted_at IS NULL',
                    )
                    .where('role.name = :roleName', { roleName: Roles.Trainer });

                if (assignedBranchIds) {
                    queryBuilder.andWhere('branch.id IN (:...assignedBranchIds)', {
                        assignedBranchIds: assignedBranchIds.length ? assignedBranchIds : [''],
                    });
                }

                if (query.search) {
                    queryBuilder.andWhere(
                        new Brackets((qb) => {
                            qb.where('trainer.full_name ILIKE :search', {
                                search: `%${query.search}%`,
                            }).orWhere('trainer.email ILIKE :search', {
                                search: `%${query.search}%`,
                            });
                        }),
                    );
                }

                if (query.status) {
                    queryBuilder.andWhere(
                        'COALESCE(availability.status, :defaultStatus) = :status',
                        {
                            defaultStatus: TrainerAvailabilityStatus.Available,
                            status: query.status,
                        },
                    );
                }

                queryBuilder.orderBy('trainer.created_at', 'DESC').skip(offset).take(limit);

                const [trainers, total] = await queryBuilder.getManyAndCount();
                const rows = trainers.map((trainer) => {
                    const availability = (
                        trainer as UserEntity & { availability?: TrainerAvailabilityEntity }
                    ).availability;

                    return {
                        id: availability?.id || '',
                        trainer,
                        status: availability?.status || TrainerAvailabilityStatus.Available,
                        created_at: availability?.created_at || trainer.created_at,
                        updated_at: availability?.updated_at || trainer.updated_at,
                    } as TrainerAvailabilityEntity;
                });
                return { rows, total, page, pageSize, offset };
            },
            {
                rows: [],
                total: 0,
                page: Number(query.page) || 1,
                pageSize: Number(query.pageSize) || 10,
                offset: 0,
            },
        );
    }

    async findTrainerActiveBranches(trainerId: string): Promise<BranchEntity[]> {
        return handleError(
            () =>
                this.dataSource
                    .getRepository(BranchEntity)
                    .createQueryBuilder('branch')
                    .innerJoin('branch.userBranches', 'userBranch')
                    .where('userBranch.user_id = :trainerId', { trainerId })
                    .andWhere('branch.status = :status', { status: BranchStatus.Active })
                    .andWhere('branch.deleted_at IS NULL')
                    .getMany(),
            [],
        );
    }

    async findActiveAvailableTrainersByBranch(branchId: string): Promise<UserEntity[]> {
        return handleError(
            () =>
                this.dataSource
                    .getRepository(UserEntity)
                    .createQueryBuilder('trainer')
                    .innerJoinAndSelect('trainer.role', 'role')
                    .innerJoin('trainer.userBranches', 'userBranch')
                    .innerJoin('userBranch.branch', 'branch')
                    .leftJoinAndMapOne(
                        'trainer.availability',
                        TrainerAvailabilityEntity,
                        'availability',
                        'availability.trainer_id = trainer.id AND availability.deleted_at IS NULL',
                    )
                    .where('branch.id = :branchId', { branchId })
                    .andWhere('role.name = :roleName', { roleName: Roles.Trainer })
                    .andWhere('trainer.status = :status', { status: UserStatus.Active })
                    .andWhere(
                        'COALESCE(availability.status, :defaultAvailability) = :availableStatus',
                        {
                            defaultAvailability: TrainerAvailabilityStatus.Available,
                            availableStatus: TrainerAvailabilityStatus.Available,
                        },
                    )
                    .orderBy('trainer.created_at', 'ASC')
                    .addOrderBy('trainer.id', 'ASC')
                    .getMany(),
            [],
        );
    }

    async createBranchMaintenance(
        data: Pick<
            BranchMaintenanceEntity,
            'maintenance_date' | 'time_from' | 'time_to' | 'reason'
        > & {
            branch: BranchEntity;
        },
    ): Promise<BranchMaintenanceEntity> {
        return handleError(() => this.dataSource.getRepository(BranchMaintenanceEntity).save(data));
    }

    async createTrainerMaintenance(
        data: Pick<
            TrainerMaintenanceEntity,
            'maintenance_date' | 'time_from' | 'time_to' | 'reason'
        > & {
            trainer: UserEntity;
        },
    ): Promise<TrainerMaintenanceEntity> {
        return handleError(() =>
            this.dataSource.getRepository(TrainerMaintenanceEntity).save(data),
        );
    }

    async findBranchMaintenanceOverlap(
        branchId: string,
        date: string,
        timeFrom: string,
        timeTo: string,
    ): Promise<BranchMaintenanceEntity | null> {
        return handleError(() =>
            this.dataSource
                .getRepository(BranchMaintenanceEntity)
                .createQueryBuilder('maintenance')
                .where('maintenance.branch_id = :branchId', { branchId })
                .andWhere('maintenance.maintenance_date = :date', { date })
                .andWhere('maintenance.time_from < :timeTo AND maintenance.time_to > :timeFrom', {
                    timeFrom,
                    timeTo,
                })
                .getOne(),
        );
    }

    async findTrainerMaintenanceOverlap(
        trainerId: string,
        date: string,
        timeFrom: string,
        timeTo: string,
    ): Promise<TrainerMaintenanceEntity | null> {
        return handleError(() =>
            this.dataSource
                .getRepository(TrainerMaintenanceEntity)
                .createQueryBuilder('maintenance')
                .where('maintenance.trainer_id = :trainerId', { trainerId })
                .andWhere('maintenance.maintenance_date = :date', { date })
                .andWhere('maintenance.time_from < :timeTo AND maintenance.time_to > :timeFrom', {
                    timeFrom,
                    timeTo,
                })
                .getOne(),
        );
    }

    async listBranchMaintenances(branchId: string): Promise<BranchMaintenanceEntity[]> {
        return handleError(() =>
            this.dataSource.getRepository(BranchMaintenanceEntity).find({
                where: { branch: { id: branchId } },
                relations: { branch: true },
                order: { maintenance_date: 'DESC', time_from: 'ASC' },
            }),
        );
    }

    async findBranchMaintenanceById(
        id: string,
        branchId: string,
    ): Promise<BranchMaintenanceEntity | null> {
        return handleError(() =>
            this.dataSource.getRepository(BranchMaintenanceEntity).findOne({
                where: { id, branch: { id: branchId } },
                relations: { branch: true },
            }),
        );
    }

    async softDeleteBranchMaintenance(
        maintenance: BranchMaintenanceEntity,
    ): Promise<BranchMaintenanceEntity> {
        return handleError(() =>
            this.dataSource.getRepository(BranchMaintenanceEntity).softRemove(maintenance),
        );
    }

    async listTrainerMaintenances(trainerId: string): Promise<TrainerMaintenanceEntity[]> {
        return handleError(() =>
            this.dataSource.getRepository(TrainerMaintenanceEntity).find({
                where: { trainer: { id: trainerId } },
                relations: { trainer: true },
                order: { maintenance_date: 'DESC', time_from: 'ASC' },
            }),
        );
    }

    async findTrainerMaintenanceById(
        id: string,
        trainerId: string,
    ): Promise<TrainerMaintenanceEntity | null> {
        return handleError(() =>
            this.dataSource.getRepository(TrainerMaintenanceEntity).findOne({
                where: { id, trainer: { id: trainerId } },
                relations: { trainer: true },
            }),
        );
    }

    async softDeleteTrainerMaintenance(
        maintenance: TrainerMaintenanceEntity,
    ): Promise<TrainerMaintenanceEntity> {
        return handleError(() =>
            this.dataSource.getRepository(TrainerMaintenanceEntity).softRemove(maintenance),
        );
    }

    async hasBranchBookingOverlap(
        branchId: string,
        date: string,
        timeFrom: string,
        timeTo: string,
    ): Promise<boolean> {
        return this.hasBookingOverlap('branch_id', branchId, date, timeFrom, timeTo);
    }

    async findBranchBookingOverlaps(
        branchId: string,
        date: string,
        timeFrom: string,
        timeTo: string,
    ): Promise<MaintenanceBookingOverlap[]> {
        return this.findBookingOverlaps('branch_id', branchId, date, timeFrom, timeTo);
    }

    async findTrainerMaintenancesForTrainers(
        trainerIds: string[],
        date: string,
        timeFrom: string,
        timeTo: string,
    ): Promise<TrainerMaintenanceEntity[]> {
        if (!trainerIds.length) {
            return [];
        }

        return handleError(
            () =>
                this.dataSource
                    .getRepository(TrainerMaintenanceEntity)
                    .createQueryBuilder('maintenance')
                    .leftJoinAndSelect('maintenance.trainer', 'trainer')
                    .where('trainer.id IN (:...trainerIds)', { trainerIds })
                    .andWhere('maintenance.maintenance_date = :date', { date })
                    .andWhere(
                        'maintenance.time_from < :timeTo AND maintenance.time_to > :timeFrom',
                        {
                            timeFrom,
                            timeTo,
                        },
                    )
                    .getMany(),
            [],
        );
    }

    async findWorkingTrainerRostersForBranch(
        trainerIds: string[],
        branchId: string,
        dayOfWeek: string,
        timeFrom: string,
        timeTo: string,
    ): Promise<TrainerRosterEntity[]> {
        if (!trainerIds.length) {
            return [];
        }

        return handleError(
            () =>
                this.dataSource
                    .getRepository(TrainerRosterEntity)
                    .createQueryBuilder('roster')
                    .leftJoinAndSelect('roster.trainer', 'trainer')
                    .leftJoinAndSelect('roster.branch', 'branch')
                    .where('trainer.id IN (:...trainerIds)', { trainerIds })
                    .andWhere('branch.id = :branchId', { branchId })
                    .andWhere('roster.day_of_week = :dayOfWeek', { dayOfWeek })
                    .andWhere('roster.status = :status', { status: RosterStatus.Working })
                    .andWhere('roster.start_time < :timeTo AND roster.end_time > :timeFrom', {
                        timeFrom,
                        timeTo,
                    })
                    .getMany(),
            [],
        );
    }

    async hasTrainerBookingOverlap(
        trainerId: string,
        date: string,
        timeFrom: string,
        timeTo: string,
    ): Promise<boolean> {
        return this.hasBookingOverlap('trainer_id', trainerId, date, timeFrom, timeTo);
    }

    private async hasBookingOverlap(
        ownerColumn: 'branch_id' | 'trainer_id',
        ownerId: string,
        date: string,
        timeFrom: string,
        timeTo: string,
    ): Promise<boolean> {
        return handleError(async () => {
            const bookingColumns = await this.getBookingColumns();
            if (!bookingColumns || !bookingColumns.columns.has(ownerColumn)) {
                return false;
            }

            const rows = await this.findBookingRows(
                bookingColumns,
                ownerColumn,
                ownerId,
                date,
                timeFrom,
                timeTo,
                1,
            );

            return rows.length > 0;
        }, false);
    }

    private async findBookingOverlaps(
        ownerColumn: 'branch_id' | 'trainer_id',
        ownerId: string,
        date: string,
        timeFrom: string,
        timeTo: string,
    ): Promise<MaintenanceBookingOverlap[]> {
        return handleError(async () => {
            const bookingColumns = await this.getBookingColumns();
            if (!bookingColumns || !bookingColumns.columns.has(ownerColumn)) {
                return [];
            }

            return this.findBookingRows(
                bookingColumns,
                ownerColumn,
                ownerId,
                date,
                timeFrom,
                timeTo,
            );
        }, []);
    }

    private async findBookingRows(
        bookingColumns: BookingColumns,
        ownerColumn: 'branch_id' | 'trainer_id',
        ownerId: string,
        date: string,
        timeFrom: string,
        timeTo: string,
        limit?: number,
    ): Promise<MaintenanceBookingOverlap[]> {
        const statusClause = bookingColumns.columns.has('status')
            ? `AND LOWER(status::text) IN ('confirmed', 'active')`
            : '';
        const deletedClause = bookingColumns.columns.has('deleted_at')
            ? `AND deleted_at IS NULL`
            : '';
        const trainerSelect = bookingColumns.columns.has('trainer_id')
            ? `${bookingColumns.trainerColumn} AS trainer_id`
            : `NULL AS trainer_id`;
        const limitClause = limit ? `LIMIT ${limit}` : '';
        const rows: {
            trainer_id: string | null;
            start_time: string;
            end_time: string;
        }[] = await this.dataSource.query(
            `SELECT ${trainerSelect},
                    ${bookingColumns.startColumn} AS start_time,
                    ${bookingColumns.endColumn} AS end_time
               FROM "Bookings"
              WHERE ${ownerColumn} = $1
                AND ${bookingColumns.dateColumn} = $2
                AND ${bookingColumns.startColumn} < $3
                AND ${bookingColumns.endColumn} > $4
                ${statusClause}
                ${deletedClause}
              ${limitClause}`,
            [ownerId, date, timeTo, timeFrom],
        );

        return rows.map((row) => ({
            trainerId: row.trainer_id,
            startTime: row.start_time,
            endTime: row.end_time,
        }));
    }

    private async getBookingColumns(): Promise<BookingColumns | null> {
        const tableExists = await this.dataSource.query(
            `SELECT to_regclass('"Bookings"') AS table_name`,
        );
        if (!tableExists?.[0]?.table_name) {
            return null;
        }

        const columnRows: { column_name: string }[] = await this.dataSource.query(
            `SELECT column_name FROM information_schema.columns WHERE table_name = 'Bookings'`,
        );
        const columns = new Set(columnRows.map((row) => row.column_name));
        const branchColumn = columns.has('branch_id') ? 'branch_id' : '';
        const trainerColumn = columns.has('trainer_id') ? 'trainer_id' : '';
        const dateColumn = ['booking_date', 'slot_date', 'date'].find((column) =>
            columns.has(column),
        );
        const startColumn = ['start_time', 'time_from', 'from_time'].find((column) =>
            columns.has(column),
        );
        const endColumn = ['end_time', 'time_to', 'to_time'].find((column) => columns.has(column));

        if (!dateColumn || !startColumn || !endColumn) {
            return null;
        }

        return { columns, branchColumn, trainerColumn, dateColumn, startColumn, endColumn };
    }
}

interface BookingColumns {
    columns: Set<string>;
    branchColumn: string;
    trainerColumn: string;
    dateColumn: string;
    startColumn: string;
    endColumn: string;
}

export interface MaintenanceBookingOverlap {
    trainerId: string | null;
    startTime: string;
    endTime: string;
}
