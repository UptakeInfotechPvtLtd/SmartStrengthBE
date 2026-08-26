import { DataSource, In, Repository } from 'typeorm';
import {
    BranchAvailabilityStatus,
    BranchStatus,
    Roles,
    RosterStatus,
    UserStatus,
} from '../../../../../config/enum';
import {
    BranchEntity,
    BranchMaintenanceEntity,
    TrainerRosterEntity,
    TrainerMaintenanceEntity,
    UserEntity,
} from '../../entity';
import { handleError } from '../../../../error-handler';

export interface BookingTimeRange {
    trainerId: string;
    startTime: string;
    endTime: string;
}

export class SlotRepository extends Repository<BranchEntity> {
    constructor(private readonly dataSource: DataSource) {
        super(BranchEntity, dataSource.createEntityManager());
    }

    async findAvailableBranchById(
        branchId: string,
        assignedUserId?: string,
    ): Promise<BranchEntity | null> {
        return handleError(async () => {
            const queryBuilder = this.createQueryBuilder('branch')
                .leftJoinAndSelect('branch.availabilitySettings', 'availabilitySettings')
                .where('branch.id = :branchId', { branchId })
                .andWhere('branch.status = :status', { status: BranchStatus.Active })
                .andWhere('branch.deleted_at IS NULL')
                .andWhere(
                    '(availabilitySettings.id IS NULL OR availabilitySettings.status = :availabilityStatus)',
                    { availabilityStatus: BranchAvailabilityStatus.Open },
                );

            if (assignedUserId) {
                queryBuilder
                    .innerJoin('branch.userBranches', 'userBranch')
                    .andWhere('userBranch.user_id = :assignedUserId', { assignedUserId });
            }

            return queryBuilder.getOne();
        });
    }

    async findActiveAssignedTrainers(branchId: string): Promise<UserEntity[]> {
        return handleError(
            () =>
                this.dataSource
                    .getRepository(UserEntity)
                    .createQueryBuilder('trainer')
                    .innerJoinAndSelect('trainer.role', 'role')
                    .innerJoin('trainer.userBranches', 'userBranch')
                    .innerJoin('userBranch.branch', 'branch')
                    .where('branch.id = :branchId', { branchId })
                    .andWhere('role.name = :roleName', { roleName: Roles.Trainer })
                    .andWhere('trainer.status = :status', { status: UserStatus.Active })
                    .orderBy('trainer.created_at', 'ASC')
                    .addOrderBy('trainer.id', 'ASC')
                    .getMany(),
            [],
        );
    }

    async findBranchMaintenances(
        branchId: string,
        date: string,
    ): Promise<BranchMaintenanceEntity[]> {
        return handleError(
            () =>
                this.dataSource.getRepository(BranchMaintenanceEntity).find({
                    where: { branch: { id: branchId }, maintenance_date: date },
                    order: { time_from: 'ASC' },
                }),
            [],
        );
    }

    async findTrainerMaintenances(
        trainerIds: string[],
        date: string,
    ): Promise<TrainerMaintenanceEntity[]> {
        if (!trainerIds.length) {
            return [];
        }

        return handleError(
            () =>
                this.dataSource.getRepository(TrainerMaintenanceEntity).find({
                    where: { trainer: { id: In(trainerIds) }, maintenance_date: date },
                    relations: { trainer: true },
                    order: { time_from: 'ASC' },
                }),
            [],
        );
    }

    async findWorkingTrainerRosters(
        trainerIds: string[],
        branchId: string,
        dayOfWeek: string,
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
                    .orderBy('roster.start_time', 'ASC')
                    .getMany(),
            [],
        );
    }

    async findBookingOverlaps(
        branchId: string,
        trainerIds: string[],
        date: string,
    ): Promise<BookingTimeRange[]> {
        if (!trainerIds.length) {
            return [];
        }

        return handleError(async () => {
            const bookingColumns = await this.getBookingColumns();
            if (!bookingColumns) {
                return [];
            }

            const statusClause = bookingColumns.columns.has('status')
                ? `AND LOWER(status::text) NOT IN ('cancelled', 'canceled', 'expired', 'rejected')`
                : '';
            const deletedClause = bookingColumns.columns.has('deleted_at')
                ? 'AND deleted_at IS NULL'
                : '';
            const rows: {
                trainer_id: string;
                start_time: string;
                end_time: string;
            }[] = await this.dataSource.query(
                `SELECT ${bookingColumns.trainerColumn} AS trainer_id,
                        ${bookingColumns.startColumn} AS start_time,
                        ${bookingColumns.endColumn} AS end_time
                   FROM "Bookings"
                  WHERE ${bookingColumns.branchColumn} = $1
                    AND ${bookingColumns.trainerColumn} = ANY($2::uuid[])
                    AND ${bookingColumns.dateColumn} = $3
                    ${statusClause}
                    ${deletedClause}`,
                [branchId, trainerIds, date],
            );

            return rows.map((row) => ({
                trainerId: row.trainer_id,
                startTime: row.start_time,
                endTime: row.end_time,
            }));
        }, []);
    }

    async hasTrainerBookingOverlapWithLock(
        trainerId: string,
        date: string,
        startTime: string,
        endTime: string,
    ): Promise<boolean> {
        return handleError(async () => {
            const bookingColumns = await this.getBookingColumns();
            if (!bookingColumns) {
                return false;
            }

            const statusClause = bookingColumns.columns.has('status')
                ? `AND LOWER(status::text) NOT IN ('cancelled', 'canceled', 'expired', 'rejected')`
                : '';
            const deletedClause = bookingColumns.columns.has('deleted_at')
                ? 'AND deleted_at IS NULL'
                : '';

            return this.dataSource.transaction(async (manager) => {
                const rows = await manager.query(
                    `SELECT id FROM "Bookings"
                      WHERE ${bookingColumns.trainerColumn} = $1
                        AND ${bookingColumns.dateColumn} = $2
                        AND ${bookingColumns.startColumn} < $3
                        AND ${bookingColumns.endColumn} > $4
                        ${statusClause}
                        ${deletedClause}
                      FOR UPDATE`,
                    [trainerId, date, endTime, startTime],
                );

                return rows.length > 0;
            });
        }, false);
    }

    private async getBookingColumns(): Promise<{
        columns: Set<string>;
        branchColumn: string;
        trainerColumn: string;
        dateColumn: string;
        startColumn: string;
        endColumn: string;
    } | null> {
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
        const dateColumn =
            ['booking_date', 'slot_date', 'date'].find((column) => columns.has(column)) || '';
        const startColumn =
            ['start_time', 'time_from', 'from_time'].find((column) => columns.has(column)) || '';
        const endColumn =
            ['end_time', 'time_to', 'to_time'].find((column) => columns.has(column)) || '';

        if (!branchColumn || !trainerColumn || !dateColumn || !startColumn || !endColumn) {
            return null;
        }

        return { columns, branchColumn, trainerColumn, dateColumn, startColumn, endColumn };
    }
}
