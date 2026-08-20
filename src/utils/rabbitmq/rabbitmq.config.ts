export const RabbitMQConfig = {
    get enabled(): boolean {
        const value = (process.env.RABBITMQ_ENABLED || '').toLowerCase();
        return value === '1' || value === 'true';
    },

    get url(): string {
        return process.env.RABBITMQ_URL || 'amqp://localhost:5672';
    },

    get emailQueue(): string {
        return process.env.RABBITMQ_EMAIL_QUEUE || 'email_queue';
    },

    get prefetch(): number {
        return Number(process.env.RABBITMQ_PREFETCH) || 10;
    },

    get fallbackToDirectEmail(): boolean {
        const value = (process.env.RABBITMQ_FALLBACK_TO_DIRECT || '').toLowerCase();
        return value === '1' || value === 'true';
    },
};
