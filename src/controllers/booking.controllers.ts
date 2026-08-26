import { IAuthenticatedRequest } from '../config';
import { BaseResponseDto } from '../dto';
import { messages } from '../lang/api-messages';
import { BookingService } from '../services';
import {
    BookingIdParamsPayload,
    CreateBookingBodyPayload,
    FetchBookingsQueryPayload,
    RescheduleBookingBodyPayload,
} from '../validations';

export class BookingController {
    constructor(private readonly bookingService: BookingService) {
        this.createBooking = this.createBooking.bind(this);
        this.listBookings = this.listBookings.bind(this);
        this.cancelBooking = this.cancelBooking.bind(this);
        this.rescheduleBooking = this.rescheduleBooking.bind(this);
    }

    async createBooking(req: IAuthenticatedRequest<any, CreateBookingBodyPayload>) {
        const result = await this.bookingService.createBooking(req.body, req.user);
        return new BaseResponseDto(messages.bookingCreatedSuccessfully, result);
    }

    async listBookings(req: IAuthenticatedRequest<any, any, FetchBookingsQueryPayload>) {
        const result = await this.bookingService.listBookings(req.query);
        return new BaseResponseDto(messages.bookingsFetchedSuccessfully, result);
    }

    async cancelBooking(req: IAuthenticatedRequest<BookingIdParamsPayload>) {
        const result = await this.bookingService.cancelBooking(req.params, req.user);
        return new BaseResponseDto(messages.bookingCancelledSuccessfully, result);
    }

    async rescheduleBooking(
        req: IAuthenticatedRequest<BookingIdParamsPayload, RescheduleBookingBodyPayload>,
    ) {
        const result = await this.bookingService.rescheduleBooking(req.params, req.body, req.user);
        return new BaseResponseDto(messages.bookingRescheduledSuccessfully, result);
    }
}
