import { BookingStatus, BranchStatus, IJwtPayload, Roles, UserStatus } from '../config';
import { BookingListResponseDto, BookingResponseDto } from '../dto';
import { messages } from '../lang/api-messages';
import {
    BadRequestException,
    BookingEntity,
    BookingRepository,
    BranchEntity,
    NotFoundException,
    SessionEntity,
    SessionRepository,
    UserEntity,
    UserRepository,
    buildPagination,
} from '../utils';
import { EntityManager } from 'typeorm';
import {
    BookingIdParamsPayload,
    CreateBookingBodyPayload,
    FetchBookingsQueryPayload,
    RescheduleBookingBodyPayload,
} from '../validations';
import { SlotService } from './slot.services';

const APP_TIMEZONE = 'Asia/Kolkata';
const DEFAULT_BOOKING_SLOT_DURATION = 60;

export class BookingService {
    constructor(
        private readonly bookingRepo: BookingRepository,
        private readonly sessionRepo: SessionRepository,
        private readonly userRepo: UserRepository,
        private readonly slotService: SlotService,
    ) {}

    async createBooking(
        body: CreateBookingBodyPayload,
        authUser: IJwtPayload,
    ): Promise<BookingResponseDto> {
        const user = await this.userRepo.findUserByIdWithRole(authUser.userId);
        if (!user || user.status !== UserStatus.Active) {
            throw new NotFoundException(messages.userNotFound);
        }

        const session = await this.getActiveSession(body.sessionId);
        const branch = this.resolveSessionBranch(session, body.branchId);
        const startTime = this.normalizeTime(body.startTime);
        const endTime = this.normalizeTime(body.endTime);
        this.ensureDateAndTimeBookable(body.date, startTime, endTime);
        this.ensureRequestedSlotDuration(startTime, endTime);

        const booking = await this.bookingRepo.transaction(async (manager) => {
            await this.bookingRepo.lockSlot(
                manager,
                `${branch.id}:${body.date}:${startTime}:${endTime}`,
            );

            const hasUserConflict = await this.bookingRepo.hasUserBookingOverlapWithLock(
                manager,
                authUser.userId,
                body.date,
                startTime,
                endTime,
            );
            if (hasUserConflict) {
                throw new BadRequestException(messages.userBookingTimeConflict);
            }

            const matchingSlot = await this.getMatchingAvailableSlot({
                branchId: branch.id,
                date: body.date,
                startTime,
                endTime,
            });
            const trainerId = [...matchingSlot.availableTrainerIds].sort()[0];
            if (!trainerId) {
                throw new BadRequestException(messages.slotNoLongerAvailable);
            }

            let userPackage = null;
            if (body.packageId) {
                userPackage = await this.bookingRepo.findOwnedPackageWithLock(
                    manager,
                    authUser.userId,
                    body.packageId,
                );
                if (!userPackage) {
                    throw new BadRequestException(messages.packageNotPurchasedByUser);
                }
                if (!userPackage.package?.status) {
                    throw new BadRequestException(messages.userPackageNotActive);
                }
                if (userPackage.expired_at <= new Date()) {
                    throw new BadRequestException(messages.userPackageExpired);
                }
                if (userPackage.remaining_sessions <= 0) {
                    throw new BadRequestException(messages.userPackageNoCredits);
                }

                userPackage.remaining_sessions -= 1;
                await this.bookingRepo.updateUserPackage(manager, userPackage);
            }

            return this.bookingRepo.createBooking(manager, {
                user,
                session,
                branch,
                trainer: { id: trainerId } as UserEntity,
                userPackage,
                booking_date: body.date,
                start_time: startTime,
                end_time: endTime,
                status: BookingStatus.Confirmed,
                is_direct_booking: !body.packageId,
            });
        });

        return new BookingResponseDto(booking);
    }

    async listBookings(query: FetchBookingsQueryPayload): Promise<BookingListResponseDto> {
        const { bookings, total, page, pageSize, offset } =
            await this.bookingRepo.listBookings(query);

        return new BookingListResponseDto(
            bookings,
            buildPagination({ totalResults: total, page, pageSize, offset }),
        );
    }

    async cancelBooking(
        params: BookingIdParamsPayload,
        authUser: IJwtPayload,
    ): Promise<BookingResponseDto> {
        const booking = await this.bookingRepo.transaction(async (manager) => {
            const bookingData = await this.getUserBookingWithLock(manager, params.id, authUser);
            this.ensureConfirmedBooking(bookingData);
            this.ensureThreeHourCutoff(bookingData, messages.bookingCancelCutoffPassed);

            const { yearStart, yearEnd } = this.getCurrentYearRange();
            const cancellationCount = await this.bookingRepo.countUserCancellationsForYear(
                manager,
                authUser.userId,
                yearStart,
                yearEnd,
            );
            if (cancellationCount >= 1) {
                throw new BadRequestException(messages.bookingCancelLimitReached);
            }

            bookingData.status = BookingStatus.Cancelled;
            bookingData.cancelled_at = new Date();
            if (bookingData.userPackage) {
                bookingData.userPackage.remaining_sessions = Math.min(
                    bookingData.userPackage.remaining_sessions + 1,
                    bookingData.userPackage.number_of_sessions,
                );
                await this.bookingRepo.updateUserPackage(manager, bookingData.userPackage);
            }

            return this.bookingRepo.updateBooking(manager, bookingData);
        });

        return new BookingResponseDto(booking);
    }

    async rescheduleBooking(
        params: BookingIdParamsPayload,
        body: RescheduleBookingBodyPayload,
        authUser: IJwtPayload,
    ): Promise<BookingResponseDto> {
        const startTime = this.normalizeTime(body.startTime);
        const endTime = this.normalizeTime(body.endTime);
        this.ensureRequestedSlotDuration(startTime, endTime);

        const booking = await this.bookingRepo.transaction(async (manager) => {
            const bookingData = await this.getUserBookingWithLock(manager, params.id, authUser);
            this.ensureConfirmedBooking(bookingData);
            this.ensureThreeHourCutoff(bookingData, messages.bookingRescheduleCutoffPassed);
            this.ensureDateAndTimeBookable(bookingData.booking_date, startTime, endTime);

            if (bookingData.start_time === startTime && bookingData.end_time === endTime) {
                throw new BadRequestException(messages.bookingSelectDifferentSlot);
            }

            await this.bookingRepo.lockSlot(
                manager,
                `${bookingData.branch.id}:${bookingData.booking_date}:${startTime}:${endTime}`,
            );

            const hasUserConflict = await this.bookingRepo.hasUserBookingOverlapWithLock(
                manager,
                authUser.userId,
                bookingData.booking_date,
                startTime,
                endTime,
            );
            if (hasUserConflict) {
                throw new BadRequestException(messages.userBookingTimeConflict);
            }

            const matchingSlot = await this.getMatchingAvailableSlot({
                branchId: bookingData.branch.id,
                date: bookingData.booking_date,
                startTime,
                endTime,
            });
            const trainerId = [...matchingSlot.availableTrainerIds].sort()[0];
            if (!trainerId) {
                throw new BadRequestException(messages.slotNoLongerAvailable);
            }

            bookingData.start_time = startTime;
            bookingData.end_time = endTime;
            bookingData.trainer = { id: trainerId } as UserEntity;
            bookingData.rescheduled_at = new Date();

            return this.bookingRepo.updateBooking(manager, bookingData);
        });

        return new BookingResponseDto(booking);
    }

    private async getActiveSession(sessionId: string): Promise<SessionEntity> {
        const session = await this.sessionRepo.findSessionById(sessionId);
        if (!session) {
            throw new NotFoundException(messages.sessionNotFound);
        }
        if (!session.status) {
            throw new BadRequestException(messages.sessionNotAvailableForBooking);
        }

        return session;
    }

    private async getUserBookingWithLock(
        manager: EntityManager,
        bookingId: string,
        authUser: IJwtPayload,
    ): Promise<BookingEntity> {
        const booking = await this.bookingRepo.findBookingByIdForUserWithLock(
            manager,
            bookingId,
            authUser.userId,
        );
        if (!booking) {
            throw new NotFoundException(messages.bookingNotFound);
        }

        return booking;
    }

    private ensureConfirmedBooking(booking: BookingEntity): void {
        if (booking.status !== BookingStatus.Confirmed) {
            throw new BadRequestException(messages.bookingCannotBeCancelled);
        }
    }

    private ensureThreeHourCutoff(booking: BookingEntity, message: string): void {
        const bookingStart = this.bookingStartDate(booking.booking_date, booking.start_time);
        const cutoff = new Date(Date.now() + 3 * 60 * 60 * 1000);
        if (bookingStart <= cutoff) {
            throw new BadRequestException(message);
        }
    }

    private resolveSessionBranch(session: SessionEntity, branchId: string): BranchEntity {
        const activeBranches =
            session.sessionBranches
                ?.map((sessionBranch) => sessionBranch.branch)
                .filter((branch) => branch && branch.status === BranchStatus.Active) || [];

        if (!activeBranches.length) {
            throw new BadRequestException(messages.sessionBranchNotAvailableForBooking);
        }

        const branch = activeBranches.find((activeBranch) => activeBranch.id === branchId);
        if (!branch) {
            throw new BadRequestException(messages.sessionBranchNotMappedForBooking);
        }

        return branch;
    }

    private async getMatchingAvailableSlot(params: {
        branchId: string;
        date: string;
        startTime: string;
        endTime: string;
    }) {
        const slotResponse = await this.slotService.getAvailableSlots(
            {
                branchId: params.branchId,
                date: params.date,
                slotDuration: DEFAULT_BOOKING_SLOT_DURATION,
            },
            { userId: '', email: '', roleName: Roles.Admin },
        );
        const displayStartTime = this.formatDisplayTime(params.startTime);
        const displayEndTime = this.formatDisplayTime(params.endTime);
        const matchingSlot = slotResponse.results.find(
            (slot) => slot.startTime === displayStartTime && slot.endTime === displayEndTime,
        );

        if (!matchingSlot) {
            throw new BadRequestException(messages.requestedSlotNotGenerated);
        }
        if (matchingSlot.availableSlotCount <= 0) {
            throw new BadRequestException(messages.slotNoLongerAvailable);
        }

        return matchingSlot;
    }

    private ensureDateAndTimeBookable(date: string, startTime: string, endTime: string): void {
        const startMinutes = this.timeToMinutes(startTime);
        const endMinutes = this.timeToMinutes(endTime);
        if (startMinutes >= endMinutes) {
            throw new BadRequestException(messages.bookingStartTimeBeforeEndTime);
        }
        if (date < this.getTodayDate()) {
            throw new BadRequestException(messages.bookingPastDateNotAllowed);
        }
        if (date === this.getTodayDate() && startMinutes <= this.getCurrentMinutes()) {
            throw new BadRequestException(messages.bookingPastTimeNotAllowed);
        }
    }

    private ensureRequestedSlotDuration(startTime: string, endTime: string): void {
        const duration = this.timeToMinutes(endTime) - this.timeToMinutes(startTime);
        if (duration !== DEFAULT_BOOKING_SLOT_DURATION) {
            throw new BadRequestException(messages.requestedSlotNotGenerated);
        }
    }

    private normalizeTime(time: string): string {
        const trimmedTime = time.trim().toUpperCase();
        if (!trimmedTime.includes('AM') && !trimmedTime.includes('PM')) {
            const [hourValue, minuteValue] = trimmedTime.split(':');
            return `${hourValue.padStart(2, '0')}:${minuteValue}`;
        }

        const match = trimmedTime.match(/^(\d{1,2}):([0-5]\d)\s?(AM|PM)$/);
        if (!match) {
            return trimmedTime;
        }

        let hour = Number(match[1]);
        const minute = match[2];
        const suffix = match[3];
        if (suffix === 'PM' && hour !== 12) hour += 12;
        if (suffix === 'AM' && hour === 12) hour = 0;

        return `${String(hour).padStart(2, '0')}:${minute}`;
    }

    private formatDisplayTime(time: string): string {
        const [hourValue, minuteValue] = time.split(':');
        const hour = Number(hourValue);
        const suffix = hour >= 12 ? 'PM' : 'AM';
        const displayHour = String(hour % 12 || 12).padStart(2, '0');

        return `${displayHour}:${minuteValue} ${suffix}`;
    }

    private timeToMinutes(time: string): number {
        const [hourValue, minuteValue] = time.split(':');
        return Number(hourValue) * 60 + Number(minuteValue);
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

    private bookingStartDate(date: string, time: string): Date {
        return new Date(`${date}T${time}:00+05:30`);
    }

    private getCurrentYearRange(): { yearStart: Date; yearEnd: Date } {
        const now = new Date();
        const year = Number(
            new Intl.DateTimeFormat('en-US', {
                timeZone: APP_TIMEZONE,
                year: 'numeric',
            }).format(now),
        );

        return {
            yearStart: new Date(`${year}-01-01T00:00:00+05:30`),
            yearEnd: new Date(`${year + 1}-01-01T00:00:00+05:30`),
        };
    }
}
