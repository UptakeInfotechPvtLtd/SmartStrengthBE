import { BranchAvailabilityStatus, Roles } from '../config/enum';
import { IJwtPayload } from '../config/interface';
import { AvailableSlotListResponseDto } from '../dto/slot';
import { messages } from '../lang/api-messages';
import { SlotRepository, BookingTimeRange } from '../utils/database/db/repository/slot';
import {
    BranchMaintenanceEntity,
    TrainerMaintenanceEntity,
    TrainerRosterEntity,
    UserEntity,
} from '../utils/database/db/entity';
import { BadRequestException, NotFoundException } from '../utils/error';
import { AvailableSlotsQueryPayload } from '../validations/slot.validations';

const DEFAULT_SLOT_DURATION_MINUTES = 60;
const APP_TIMEZONE = 'Asia/Kolkata';

interface TimeRange {
    startTime: string;
    endTime: string;
}

interface SlotRange extends TimeRange {
    startMinutes: number;
    endMinutes: number;
}

export class SlotService {
    constructor(private readonly slotRepo: SlotRepository) {}

    async getAvailableSlots(
        query: AvailableSlotsQueryPayload,
        authUser: IJwtPayload,
    ): Promise<AvailableSlotListResponseDto> {
        const branch = await this.getBranch(query.branchId, authUser);
        const slotDuration = query.slotDuration || DEFAULT_SLOT_DURATION_MINUTES;

        this.ensureBranchHasWorkingHours(branch.opening_time, branch.closing_time);
        this.ensureDateIsBookable(query.date);

        const branchOpenMinutes = this.timeToMinutes(branch.opening_time!);
        const branchCloseMinutes = this.timeToMinutes(branch.closing_time!);
        if (slotDuration > branchCloseMinutes - branchOpenMinutes) {
            return new AvailableSlotListResponseDto({
                branchId: branch.id,
                date: query.date,
                slotDuration,
                slots: [],
            });
        }

        const [trainers, branchMaintenances] = await Promise.all([
            this.slotRepo.findActiveAssignedTrainers(branch.id),
            this.slotRepo.findBranchMaintenances(branch.id, query.date),
        ]);
        if (!trainers.length) {
            return new AvailableSlotListResponseDto({
                branchId: branch.id,
                date: query.date,
                slotDuration,
                slots: [],
            });
        }

        const trainerIds = trainers.map((trainer) => trainer.id);
        const [trainerRosters, trainerMaintenances, bookings] = await Promise.all([
            this.slotRepo.findWorkingTrainerRosters(
                trainerIds,
                branch.id,
                this.getDayOfWeek(query.date),
            ),
            this.slotRepo.findTrainerMaintenances(trainerIds, query.date),
            this.slotRepo.findBookingOverlaps(branch.id, trainerIds, query.date),
        ]);

        const branchMaintenanceRanges = branchMaintenances.map((maintenance) =>
            this.entityTimeRange(maintenance),
        );
        const trainerRosterMap = this.groupTrainerRosters(trainerRosters);
        const trainerMaintenanceMap = this.groupTrainerMaintenances(trainerMaintenances);
        const bookingMap = this.groupBookings(bookings);
        const baseSlots = this.generateBaseSlots(
            branchOpenMinutes,
            branchCloseMinutes,
            slotDuration,
        );
        const nowMinutes = this.isToday(query.date) ? this.getCurrentMinutes() : null;

        const slots = baseSlots
            .filter((slot) => nowMinutes === null || slot.startMinutes > nowMinutes)
            .filter((slot) => !this.hasOverlap(slot, branchMaintenanceRanges))
            .map((slot) => ({
                startTime: slot.startTime,
                endTime: slot.endTime,
                availableTrainerIds: this.getAvailableTrainerIds(
                    trainers,
                    slot,
                    trainerRosterMap,
                    trainerMaintenanceMap,
                    bookingMap,
                ),
                reservedTrainerIds: this.getReservedTrainerIds(
                    trainers,
                    slot,
                    trainerRosterMap,
                    bookingMap,
                ),
            }))
            .filter(
                (slot) => slot.availableTrainerIds.length > 0 || slot.reservedTrainerIds.length > 0,
            );

        return new AvailableSlotListResponseDto({
            branchId: branch.id,
            date: query.date,
            slotDuration,
            slots,
        });
    }

    async ensureTrainerAvailableForBooking(params: {
        branchId: string;
        trainerId: string;
        date: string;
        startTime: string;
        endTime: string;
    }): Promise<void> {
        const query = {
            branchId: params.branchId,
            date: params.date,
            slotDuration: this.timeToMinutes(params.endTime) - this.timeToMinutes(params.startTime),
        };
        const slots = await this.getAvailableSlots(query, {
            userId: '',
            email: '',
            roleName: Roles.Admin,
        });
        const displayStartTime = this.formatDisplayTime(params.startTime);
        const displayEndTime = this.formatDisplayTime(params.endTime);
        const matchingSlot = slots.results.find(
            (slot) =>
                slot.startTime === displayStartTime &&
                slot.endTime === displayEndTime &&
                slot.availableTrainerIds.includes(params.trainerId),
        );

        if (!matchingSlot) {
            throw new BadRequestException(messages.slotNotAvailable);
        }

        const isBooked = await this.slotRepo.hasTrainerBookingOverlapWithLock(
            params.trainerId,
            params.date,
            params.startTime,
            params.endTime,
        );
        if (isBooked) {
            throw new BadRequestException(messages.slotAlreadyBooked);
        }
    }

    private async getBranch(branchId: string, authUser: IJwtPayload) {
        const assignedUserId = authUser?.roleName === Roles.SubAdmin ? authUser.userId : undefined;
        const branch = await this.slotRepo.findAvailableBranchById(branchId, assignedUserId);
        if (!branch) {
            throw new NotFoundException(messages.branchNotFound);
        }

        if (
            branch.availabilitySettings?.some(
                (setting) => setting.status === BranchAvailabilityStatus.FullyOff,
            )
        ) {
            throw new BadRequestException(messages.branchNotAvailableForSelectedDate);
        }

        return branch;
    }

    private ensureBranchHasWorkingHours(
        openingTime: string | null,
        closingTime: string | null,
    ): void {
        if (!openingTime || !closingTime || openingTime >= closingTime) {
            throw new BadRequestException(messages.branchNotAvailableForSelectedDate);
        }
    }

    private ensureDateIsBookable(date: string): void {
        if (date < this.getTodayDate()) {
            throw new BadRequestException(messages.slotAlreadyStarted);
        }
    }

    private generateBaseSlots(
        openingMinutes: number,
        closingMinutes: number,
        slotDuration: number,
    ): SlotRange[] {
        const slots: SlotRange[] = [];
        for (
            let startMinutes = openingMinutes;
            startMinutes + slotDuration <= closingMinutes;
            startMinutes += slotDuration
        ) {
            const endMinutes = startMinutes + slotDuration;
            slots.push({
                startMinutes,
                endMinutes,
                startTime: this.minutesToTime(startMinutes),
                endTime: this.minutesToTime(endMinutes),
            });
        }

        return slots;
    }

    private getAvailableTrainerIds(
        trainers: UserEntity[],
        slot: SlotRange,
        trainerRosterMap: Map<string, TimeRange[]>,
        trainerMaintenanceMap: Map<string, TimeRange[]>,
        bookingMap: Map<string, TimeRange[]>,
    ): string[] {
        return trainers
            .filter((trainer) => this.isInsideRoster(slot, trainerRosterMap.get(trainer.id) || []))
            .filter(
                (trainer) => !this.hasOverlap(slot, trainerMaintenanceMap.get(trainer.id) || []),
            )
            .filter((trainer) => !this.hasOverlap(slot, bookingMap.get(trainer.id) || []))
            .map((trainer) => trainer.id);
    }

    private getReservedTrainerIds(
        trainers: UserEntity[],
        slot: SlotRange,
        trainerRosterMap: Map<string, TimeRange[]>,
        bookingMap: Map<string, TimeRange[]>,
    ): string[] {
        return trainers
            .filter((trainer) => this.isInsideRoster(slot, trainerRosterMap.get(trainer.id) || []))
            .filter((trainer) => this.hasOverlap(slot, bookingMap.get(trainer.id) || []))
            .map((trainer) => trainer.id);
    }

    private groupTrainerMaintenances(
        maintenances: TrainerMaintenanceEntity[],
    ): Map<string, TimeRange[]> {
        const maintenanceMap = new Map<string, TimeRange[]>();
        maintenances.forEach((maintenance) => {
            const trainerId = maintenance.trainer?.id;
            if (!trainerId) {
                return;
            }

            maintenanceMap.set(trainerId, [
                ...(maintenanceMap.get(trainerId) || []),
                this.entityTimeRange(maintenance),
            ]);
        });

        return maintenanceMap;
    }

    private groupTrainerRosters(rosters: TrainerRosterEntity[]): Map<string, TimeRange[]> {
        const rosterMap = new Map<string, TimeRange[]>();
        rosters.forEach((roster) => {
            const trainerId = roster.trainer?.id;
            if (!trainerId) {
                return;
            }

            rosterMap.set(trainerId, [
                ...(rosterMap.get(trainerId) || []),
                { startTime: roster.start_time, endTime: roster.end_time },
            ]);
        });

        return rosterMap;
    }

    private groupBookings(bookings: BookingTimeRange[]): Map<string, TimeRange[]> {
        const bookingMap = new Map<string, TimeRange[]>();
        bookings.forEach((booking) => {
            const trainerId = booking.trainerId;
            if (!trainerId) {
                return;
            }

            bookingMap.set(trainerId, [
                ...(bookingMap.get(trainerId) || []),
                { startTime: booking.startTime, endTime: booking.endTime },
            ]);
        });

        return bookingMap;
    }

    private entityTimeRange(entity: BranchMaintenanceEntity | TrainerMaintenanceEntity): TimeRange {
        return {
            startTime: entity.time_from,
            endTime: entity.time_to,
        };
    }

    private hasOverlap(slot: TimeRange, ranges: TimeRange[]): boolean {
        const slotStart = this.timeToMinutes(slot.startTime);
        const slotEnd = this.timeToMinutes(slot.endTime);

        return ranges.some((range) => {
            const rangeStart = this.timeToMinutes(range.startTime);
            const rangeEnd = this.timeToMinutes(range.endTime);

            return slotStart < rangeEnd && slotEnd > rangeStart;
        });
    }

    private isInsideRoster(slot: TimeRange, rosters: TimeRange[]): boolean {
        const slotStart = this.timeToMinutes(slot.startTime);
        const slotEnd = this.timeToMinutes(slot.endTime);

        return rosters.some(
            (roster) =>
                slotStart >= this.timeToMinutes(roster.startTime) &&
                slotEnd <= this.timeToMinutes(roster.endTime),
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

    private formatDisplayTime(time: string): string {
        const [hourValue, minuteValue] = time.split(':');
        const hour = Number(hourValue);
        const suffix = hour >= 12 ? 'PM' : 'AM';
        const displayHour = String(hour % 12 || 12).padStart(2, '0');

        return `${displayHour}:${minuteValue} ${suffix}`;
    }

    private getTodayDate(): string {
        const parts = new Intl.DateTimeFormat('en-CA', {
            timeZone: APP_TIMEZONE,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).formatToParts(new Date());
        const dateParts = Object.fromEntries(parts.map((part) => [part.type, part.value]));

        return `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
    }

    private isToday(date: string): boolean {
        return date === this.getTodayDate();
    }

    private getDayOfWeek(date: string): string {
        return new Intl.DateTimeFormat('en-US', {
            timeZone: APP_TIMEZONE,
            weekday: 'long',
        })
            .format(new Date(`${date}T00:00:00.000+05:30`))
            .toLowerCase();
    }

    private getCurrentMinutes(): number {
        const parts = new Intl.DateTimeFormat('en-US', {
            timeZone: APP_TIMEZONE,
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
        }).formatToParts(new Date());
        const timeParts = Object.fromEntries(parts.map((part) => [part.type, part.value]));

        return Number(timeParts.hour) * 60 + Number(timeParts.minute);
    }
}
