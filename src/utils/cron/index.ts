export * from './slot-generator.cron';
export * from './booking-expiry.cron';
export * from './slot-lock-expiry.cron';

import { slotGeneratorCron } from './slot-generator.cron';
import { bookingExpiryCron } from './booking-expiry.cron';
import { slotLockExpiryCron } from './slot-lock-expiry.cron';
import { CRON_FLAGS } from '../../config';

/**
 * Initialize all cron jobs based on environment flags
 */
export function startCronJobs(): void {
    console.log('[Cron] Starting cron jobs...');

    if (CRON_FLAGS.ENABLE_SLOT_GENERATION) {
        slotGeneratorCron.start();
        console.log('[Cron] ✓ Slot generation cron enabled');
    } else {
        console.log('[Cron] ✗ Slot generation cron disabled (use manual trigger)');
    }

    if (CRON_FLAGS.ENABLE_BOOKING_EXPIRY) {
        bookingExpiryCron.start();
        console.log('[Cron] ✓ Booking expiry cron enabled');
    } else {
        console.log('[Cron] ✗ Booking expiry cron disabled');
    }

    if (CRON_FLAGS.ENABLE_SLOT_LOCK_EXPIRY) {
        slotLockExpiryCron.start();
        console.log('[Cron] ✓ Slot lock expiry cron enabled');
    } else {
        console.log('[Cron] ✗ Slot lock expiry cron disabled');
    }

    console.log('[Cron] Initialization complete');
}
