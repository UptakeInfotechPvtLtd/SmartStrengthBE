/**
 * Base cron extension point retained for compatibility with the existing
 * scheduler wiring. Add a feature-specific handler here when that module is
 * introduced; the base API intentionally performs no domain work.
 */
export class SlotGeneratorCron {
    start(): void {
        console.log('[Cron] Slot generation job is not configured in the base setup');
    }
}

export const slotGeneratorCron = new SlotGeneratorCron();
