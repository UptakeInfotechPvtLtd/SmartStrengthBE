import { Roles } from '../config/enum';
import { IJwtPayload } from '../config/interface';
import {
    BranchAvailabilityStatusResponseDto,
    MaintenanceListResponseDto,
    MaintenanceResponseDto,
    TrainerAvailabilityListResponseDto,
    TrainerAvailabilityResponseDto,
} from '../dto/availability-management';
import { messages } from '../lang/api-messages';
import { BranchRepository } from '../utils/database/db/repository/branch';
import { UserRepository } from '../utils/database/db/repository/user';
import {
    AvailabilityManagementRepository,
    MaintenanceBookingOverlap,
} from '../utils/database/db/repository/availability-management';
import { BadRequestException, NotFoundException } from '../utils/error';
import { buildPagination } from '../utils/common.utils';
import {
    CreateBranchMaintenanceParamsPayload,
    CreateMaintenanceBodyPayload,
    CreateTrainerMaintenanceParamsPayload,
    DeleteBranchMaintenanceParamsPayload,
    DeleteTrainerMaintenanceParamsPayload,
    FetchTrainerAvailabilityQueryPayload,
    UpdateBranchAvailabilityStatusBodyPayload,
    UpdateBranchAvailabilityStatusParamsPayload,
    UpdateTrainerAvailabilityStatusBodyPayload,
    UpdateTrainerAvailabilityStatusParamsPayload,
} from '../validations/availability-management.validations';

export class AvailabilityManagementService {
    constructor(
        private readonly availabilityRepo: AvailabilityManagementRepository,
        private readonly branchRepo: BranchRepository,
        private readonly userRepo: UserRepository,
    ) {}

    async updateBranchAvailabilityStatus(
        params: UpdateBranchAvailabilityStatusParamsPayload,
        body: UpdateBranchAvailabilityStatusBodyPayload,
        authUser: IJwtPayload,
    ): Promise<BranchAvailabilityStatusResponseDto> {
        const branch = await this.getBranch(params.branchId, authUser);
        const setting = await this.availabilityRepo.upsertBranchAvailabilityStatus(
            branch,
            body.status,
        );

        return new BranchAvailabilityStatusResponseDto(setting);
    }

    async createBranchMaintenance(
        params: CreateBranchMaintenanceParamsPayload,
        body: CreateMaintenanceBodyPayload,
        authUser: IJwtPayload,
    ): Promise<MaintenanceResponseDto> {
        const branch = await this.getBranch(params.branchId, authUser);
        await this.ensureBranchTimeFree(branch.id, body);

        const maintenance = await this.availabilityRepo.createBranchMaintenance({
            branch,
            maintenance_date: body.date,
            time_from: body.timeFrom,
            time_to: body.timeTo,
            reason: body.reason,
        });

        return new MaintenanceResponseDto(maintenance);
    }

    async listBranchMaintenances(
        params: CreateBranchMaintenanceParamsPayload,
        authUser: IJwtPayload,
    ): Promise<MaintenanceListResponseDto> {
        const branch = await this.getBranch(params.branchId, authUser);
        return new MaintenanceListResponseDto(
            await this.availabilityRepo.listBranchMaintenances(branch.id),
        );
    }

    async deleteBranchMaintenance(
        params: DeleteBranchMaintenanceParamsPayload,
        authUser: IJwtPayload,
    ): Promise<void> {
        const branch = await this.getBranch(params.branchId, authUser);
        const maintenance = await this.availabilityRepo.findBranchMaintenanceById(
            params.maintenanceId,
            branch.id,
        );
        if (!maintenance) {
            throw new NotFoundException(messages.maintenanceNotFound);
        }

        await this.availabilityRepo.softDeleteBranchMaintenance(maintenance);
    }

    async updateTrainerAvailability(
        params: UpdateTrainerAvailabilityStatusParamsPayload,
        body: UpdateTrainerAvailabilityStatusBodyPayload,
    ): Promise<TrainerAvailabilityResponseDto> {
        const trainer = await this.getTrainer(params.trainerId);
        const availability = await this.availabilityRepo.upsertTrainerAvailability(
            trainer,
            body.status,
        );

        return new TrainerAvailabilityResponseDto(availability);
    }

    async listTrainerAvailabilities(
        query: FetchTrainerAvailabilityQueryPayload,
    ): Promise<TrainerAvailabilityListResponseDto> {
        const { rows, total, page, pageSize, offset } =
            await this.availabilityRepo.listTrainerAvailabilities(query);

        return new TrainerAvailabilityListResponseDto(
            rows,
            buildPagination({ totalResults: total, page, pageSize, offset }),
        );
    }

    async createTrainerMaintenance(
        params: CreateTrainerMaintenanceParamsPayload,
        body: CreateMaintenanceBodyPayload,
    ): Promise<MaintenanceResponseDto> {
        const trainer = await this.getTrainer(params.trainerId);
        await this.ensureTrainerTimeFree(trainer.id, body);

        const maintenance = await this.availabilityRepo.createTrainerMaintenance({
            trainer,
            maintenance_date: body.date,
            time_from: body.timeFrom,
            time_to: body.timeTo,
            reason: body.reason,
        });

        return new MaintenanceResponseDto(maintenance);
    }

    async listTrainerMaintenances(
        params: CreateTrainerMaintenanceParamsPayload,
    ): Promise<MaintenanceListResponseDto> {
        const trainer = await this.getTrainer(params.trainerId);
        return new MaintenanceListResponseDto(
            await this.availabilityRepo.listTrainerMaintenances(trainer.id),
        );
    }

    async deleteTrainerMaintenance(params: DeleteTrainerMaintenanceParamsPayload): Promise<void> {
        const trainer = await this.getTrainer(params.trainerId);
        const maintenance = await this.availabilityRepo.findTrainerMaintenanceById(
            params.maintenanceId,
            trainer.id,
        );
        if (!maintenance) {
            throw new NotFoundException(messages.maintenanceNotFound);
        }

        await this.availabilityRepo.softDeleteTrainerMaintenance(maintenance);
    }

    private async getBranch(branchId: string, authUser: IJwtPayload) {
        const assignedUserId = authUser?.roleName === Roles.SubAdmin ? authUser.userId : undefined;
        const branch = await this.branchRepo.findBranchById(branchId, assignedUserId);
        if (!branch) {
            throw new NotFoundException(messages.branchNotFound);
        }

        return branch;
    }

    private async getTrainer(trainerId: string) {
        const trainer = await this.userRepo.findUserByIdWithRole(trainerId);
        if (!trainer || trainer.role?.name !== Roles.Trainer) {
            throw new NotFoundException(messages.trainerNotFound);
        }

        return trainer;
    }

    private async ensureBranchTimeFree(
        branchId: string,
        body: CreateMaintenanceBodyPayload,
    ): Promise<void> {
        const existingMaintenance = await this.availabilityRepo.findBranchMaintenanceOverlap(
            branchId,
            body.date,
            body.timeFrom,
            body.timeTo,
        );
        if (existingMaintenance) {
            throw new BadRequestException(messages.maintenanceTimeConflictWithMaintenance);
        }

        const hasBooking = await this.availabilityRepo.hasBranchBookingOverlap(
            branchId,
            body.date,
            body.timeFrom,
            body.timeTo,
        );
        if (hasBooking) {
            throw new BadRequestException(messages.branchMaintenanceBookingConflict);
        }
    }

    private async ensureTrainerTimeFree(
        trainerId: string,
        body: CreateMaintenanceBodyPayload,
    ): Promise<void> {
        const existingMaintenance = await this.availabilityRepo.findTrainerMaintenanceOverlap(
            trainerId,
            body.date,
            body.timeFrom,
            body.timeTo,
        );
        if (existingMaintenance) {
            throw new BadRequestException(messages.maintenanceTimeConflictWithMaintenance);
        }

        const hasBooking = await this.availabilityRepo.hasTrainerBookingOverlap(
            trainerId,
            body.date,
            body.timeFrom,
            body.timeTo,
        );
        if (hasBooking) {
            throw new BadRequestException(messages.trainerMaintenanceBookingConflict);
        }

        await this.ensureTrainerMaintenanceKeepsBranchCapacity(trainerId, body);
    }

    private async ensureTrainerMaintenanceKeepsBranchCapacity(
        trainerId: string,
        body: CreateMaintenanceBodyPayload,
    ): Promise<void> {
        const branches = await this.availabilityRepo.findTrainerActiveBranches(trainerId);
        for (const branch of branches) {
            const bookings = await this.availabilityRepo.findBranchBookingOverlaps(
                branch.id,
                body.date,
                body.timeFrom,
                body.timeTo,
            );
            if (!bookings.length) {
                continue;
            }

            const trainers = await this.availabilityRepo.findActiveAvailableTrainersByBranch(
                branch.id,
            );
            const trainerIds = trainers.map((trainer) => trainer.id);
            const [maintenances, rosters] = await Promise.all([
                this.availabilityRepo.findTrainerMaintenancesForTrainers(
                    trainerIds,
                    body.date,
                    body.timeFrom,
                    body.timeTo,
                ),
                this.availabilityRepo.findWorkingTrainerRostersForBranch(
                    trainerIds,
                    branch.id,
                    this.getDayOfWeek(body.date),
                    body.timeFrom,
                    body.timeTo,
                ),
            ]);

            const intervals = this.buildCapacityCheckIntervals(
                body.timeFrom,
                body.timeTo,
                bookings,
                maintenances.map((maintenance) => ({
                    startTime: maintenance.time_from,
                    endTime: maintenance.time_to,
                })),
            );
            const hasCapacityConflict = intervals.some((interval) => {
                const bookingCount = bookings.filter((booking) =>
                    this.hasTimeOverlap(interval, booking),
                ).length;
                const availableTrainerCount = trainers.filter((trainer) => {
                    if (trainer.id === trainerId) {
                        return false;
                    }

                    const trainerRosters = rosters.filter(
                        (roster) => roster.trainer?.id === trainer.id,
                    );
                    const isRostered = trainerRosters.some((roster) =>
                        this.isTimeRangeInside(interval, {
                            startTime: roster.start_time,
                            endTime: roster.end_time,
                        }),
                    );
                    if (!isRostered) {
                        return false;
                    }

                    const trainerMaintenances = maintenances.filter(
                        (maintenance) => maintenance.trainer?.id === trainer.id,
                    );

                    return !trainerMaintenances.some((maintenance) =>
                        this.hasTimeOverlap(interval, {
                            startTime: maintenance.time_from,
                            endTime: maintenance.time_to,
                        }),
                    );
                }).length;

                return bookingCount > availableTrainerCount;
            });

            if (hasCapacityConflict) {
                throw new BadRequestException(messages.trainerMaintenanceCapacityConflict);
            }
        }
    }

    private buildCapacityCheckIntervals(
        timeFrom: string,
        timeTo: string,
        bookings: MaintenanceBookingOverlap[],
        maintenances: { startTime: string; endTime: string }[],
    ): { startTime: string; endTime: string }[] {
        const rangeStart = this.timeToMinutes(timeFrom);
        const rangeEnd = this.timeToMinutes(timeTo);
        const boundaryMinutes = new Set([rangeStart, rangeEnd]);

        [...bookings, ...maintenances].forEach((range) => {
            const startMinutes = this.timeToMinutes(range.startTime);
            const endMinutes = this.timeToMinutes(range.endTime);

            if (startMinutes > rangeStart && startMinutes < rangeEnd) {
                boundaryMinutes.add(startMinutes);
            }
            if (endMinutes > rangeStart && endMinutes < rangeEnd) {
                boundaryMinutes.add(endMinutes);
            }
        });

        const sortedBoundaries = [...boundaryMinutes].sort((first, second) => first - second);
        const intervals: { startTime: string; endTime: string }[] = [];
        for (let index = 0; index < sortedBoundaries.length - 1; index += 1) {
            intervals.push({
                startTime: this.minutesToTime(sortedBoundaries[index]),
                endTime: this.minutesToTime(sortedBoundaries[index + 1]),
            });
        }

        return intervals;
    }

    private hasTimeOverlap(
        first: { startTime: string; endTime: string },
        second: { startTime: string; endTime: string },
    ): boolean {
        return (
            this.timeToMinutes(first.startTime) < this.timeToMinutes(second.endTime) &&
            this.timeToMinutes(first.endTime) > this.timeToMinutes(second.startTime)
        );
    }

    private isTimeRangeInside(
        first: { startTime: string; endTime: string },
        second: { startTime: string; endTime: string },
    ): boolean {
        return (
            this.timeToMinutes(first.startTime) >= this.timeToMinutes(second.startTime) &&
            this.timeToMinutes(first.endTime) <= this.timeToMinutes(second.endTime)
        );
    }

    private timeToMinutes(time: string): number {
        const [hourValue, minuteValue] = time.split(':');
        return Number(hourValue) * 60 + Number(minuteValue);
    }

    private minutesToTime(minutes: number): string {
        const hour = Math.floor(minutes / 60);
        const minute = minutes % 60;

        return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    }

    private getDayOfWeek(date: string): string {
        return new Intl.DateTimeFormat('en-US', {
            timeZone: 'Asia/Kolkata',
            weekday: 'long',
        })
            .format(new Date(`${date}T00:00:00.000+05:30`))
            .toLowerCase();
    }
}
