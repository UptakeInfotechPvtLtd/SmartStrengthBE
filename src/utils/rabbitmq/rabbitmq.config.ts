export const RabbitMQConfig = {
    get enabled(): boolean {
        return process.env.RABBITMQ_ENABLED === '1';
    },
    get url(): string {
        return process.env.RABBITMQ_URL || 'amqp://localhost:5672';
    },
    get emailQueue(): string {
        return process.env.RABBITMQ_EMAIL_QUEUE || 'email_queue';
    },
    get whatsAppQueue(): string {
        return process.env.RABBITMQ_WHATSAPP_QUEUE || 'whatsapp_booking_queue';
    },
    get prefetch(): number {
        return Number(process.env.RABBITMQ_PREFETCH || 5);
    },
    get fallbackToDirectEmail(): boolean {
        return process.env.RABBITMQ_FALLBACK_TO_DIRECT !== '0';
    },
    get fallbackToDirectWhatsApp(): boolean {
        return process.env.RABBITMQ_FALLBACK_TO_DIRECT_WHATSAPP !== '0';
    },
    get whatsAppMaxRetries(): number {
        return Number(process.env.RABBITMQ_WHATSAPP_MAX_RETRIES || 3);
    },
};
