import { BookingStatus, IPaginationMeta } from '../../../config';
import { BookingEntity } from '../../../utils';

export class BookingResponseDto {
    id!: string;
    user!: { id: string; fullName: string | null; email: string | null } | null;
    session!: { id: string; sessionName: string; price: number } | null;
    branch!: { id: string; branchName: string } | null;
    trainer!: { id: string; fullName: string | null; email: string | null } | null;
    package!: { id: string; packageType: string; remainingSessions: number } | null;
    date!: string;
    startTime!: string;
    endTime!: string;
    status!: BookingStatus | string;
    isDirectBooking!: boolean;
    cancelledAt!: Date | null;
    rescheduledAt!: Date | null;
    createdAt!: Date;
    updatedAt!: Date;

    constructor(booking?: BookingEntity) {
        this.id = booking?.id || '';
        this.user = booking?.user
            ? {
                  id: booking.user.id,
                  fullName: booking.user.full_name,
                  email: booking.user.email,
              }
            : null;
        this.session = booking?.session
            ? {
                  id: booking.session.id,
                  sessionName: booking.session.session_name,
                  price: Number(booking.session.price || 0),
              }
            : null;
        this.branch = booking?.branch
            ? {
                  id: booking.branch.id,
                  branchName: booking.branch.branch_name,
              }
            : null;
        this.trainer = booking?.trainer
            ? {
                  id: booking.trainer.id,
                  fullName: booking.trainer.full_name,
                  email: booking.trainer.email,
              }
            : null;
        this.package = booking?.userPackage
            ? {
                  id: booking.userPackage.id,
                  packageType: booking.userPackage.package_type,
                  remainingSessions: booking.userPackage.remaining_sessions,
              }
            : null;
        this.date = booking?.booking_date || '';
        this.startTime = this.formatTime(booking?.start_time || '');
        this.endTime = this.formatTime(booking?.end_time || '');
        this.status = booking?.status || '';
        this.isDirectBooking = booking?.is_direct_booking || false;
        this.cancelledAt = booking?.cancelled_at || null;
        this.rescheduledAt = booking?.rescheduled_at || null;
        this.createdAt = booking?.created_at!;
        this.updatedAt = booking?.updated_at!;
    }

    private formatTime(time: string): string {
        if (!time) return '';

        const [hourValue, minuteValue] = time.split(':');
        const hour = Number(hourValue);
        const suffix = hour >= 12 ? 'PM' : 'AM';
        const displayHour = String(hour % 12 || 12).padStart(2, '0');

        return `${displayHour}:${minuteValue} ${suffix}`;
    }
}

export class BookingListResponseDto {
    results!: BookingResponseDto[];
    pagination!: IPaginationMeta;

    constructor(bookings: BookingEntity[], pagination: IPaginationMeta) {
        this.results = bookings.map((booking) => new BookingResponseDto(booking));
        this.pagination = pagination;
    }
}
