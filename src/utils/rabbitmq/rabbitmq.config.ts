export const RabbitMQConfig = {
    get enabled(): boolean {
        return process.env.RABBITMQ_ENABLED === '1' || process.env.RABBITMQ_ENABLED === 'true';
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
        return (
            process.env.RABBITMQ_FALLBACK_TO_DIRECT === '1' ||
            process.env.RABBITMQ_FALLBACK_TO_DIRECT === 'true'
        );
    },
};
