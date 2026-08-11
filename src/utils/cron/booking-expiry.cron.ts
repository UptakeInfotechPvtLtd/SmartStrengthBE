/** Base cron extension point for a future booking module. */
export class BookingExpiryCron {
    start(): void {
        console.log('[Cron] Booking expiry job is not configured in the base setup');
    }
}

export const bookingExpiryCron = new BookingExpiryCron();
