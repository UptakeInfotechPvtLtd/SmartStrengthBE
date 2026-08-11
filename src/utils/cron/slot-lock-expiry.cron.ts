/** Base cron extension point for a future slot module. */
export class SlotLockExpiryCron {
    start(): void {
        console.log('[Cron] Slot-lock expiry job is not configured in the base setup');
    }
}

export const slotLockExpiryCron = new SlotLockExpiryCron();
