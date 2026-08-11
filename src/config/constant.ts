import { SignOptions } from 'jsonwebtoken';
import { getEnv } from '../utils';

export const TOKEN_EXPIRES = (getEnv('JWT_EXPIRES') ?? '1d') as SignOptions['expiresIn'];
export const REFRESH_TOKEN_EXPIRES = (getEnv('JWT_REFRESH_TOKEN_EXPIRES') ??
    '30d') as SignOptions['expiresIn'];
export const REDIS_EXPIRATION_SECONDS = 60 * 60 * 24 * 30; // '30 Days';

/**
 * Cron job enable/disable flags
 * Controlled via environment variables
 */
export const CRON_FLAGS = {
    // true = slot generation runs daily at 1:00 AM | false = disabled (manual trigger only)
    ENABLE_SLOT_GENERATION: getEnv('ENABLE_SLOT_GENERATION_CRON') === 'false',

    // true = slot lock expiry runs every 2 minutes | false = disabled
    ENABLE_SLOT_LOCK_EXPIRY: getEnv('ENABLE_SLOT_LOCK_EXPIRY_CRON') === 'true',

    // true = booking expiry runs every 1 minute | false = disabled
    ENABLE_BOOKING_EXPIRY: getEnv('ENABLE_BOOKING_EXPIRY_CRON') === 'true',
} as const;

/**
 * Time constants (in minutes)
 */
export const TIME_CONSTANTS = {
    // Booking payment expiry - how long user has to complete payment
    BOOKING_PAYMENT_EXPIRY_MINUTES: 10,

    // QR code expiry - how long before booking time QR code becomes invalid
    QR_CODE_EXPIRY_BEFORE_SLOT_MINUTES: 30,

    // Slot lock expiry (legacy - kept for compatibility)
    SLOT_LOCK_DURATION_MINUTES: 10,

    // How often to check for expired bookings
    BOOKING_EXPIRY_CHECK_INTERVAL_MINUTES: 10,

    // How often to check for expired slot locks
    SLOT_LOCK_CHECK_INTERVAL_MINUTES: 10,

    // How far ahead to generate slots
    SLOT_GENERATION_DAYS_AHEAD: 30,

    // How old slots to delete (past dates)
    SLOT_CLEANUP_DAYS_OLD: 7,
} as const;

/** Razorpay processing fee charged to the customer during online booking. */
export const PAYMENT_CONSTANTS = {
    RAZORPAY_PROCESSING_FEE_PERCENTAGE: 2,
} as const;

/**
 * Convert minutes to milliseconds for timers
 */
export const toMilliseconds = (minutes: number): number => minutes * 60 * 1000;
