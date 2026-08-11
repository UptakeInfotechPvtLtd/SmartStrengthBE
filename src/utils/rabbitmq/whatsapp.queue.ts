import type { Message } from 'amqplib';
import type { WhatsAppBookingQueuePayload } from '../../config';
import { WhatsAppContactService } from '../../services/whatsapp-contact.service';
import { logger } from '../log.util';
import { RabbitMQConfig } from './rabbitmq.config';
import { RabbitMQService } from './rabbitmq.service';

export class WhatsAppQueue {
    private static readonly service = new WhatsAppContactService();

    static publishInBackground(payload: WhatsAppBookingQueuePayload): void {
        void this.publish(payload).catch((error: unknown) => {
            logger.error(
                `[RabbitMQ] background WhatsApp publish failed: ${this.errorMessage(error)}`,
            );
        });
    }

    static async publish(payload: WhatsAppBookingQueuePayload): Promise<void> {
        if (!RabbitMQConfig.enabled) {
            await this.send(payload);
            return;
        }

        try {
            const channel = await RabbitMQService.getChannel();
            await channel.assertQueue(RabbitMQConfig.whatsAppQueue, { durable: true });

            const sent = channel.sendToQueue(
                RabbitMQConfig.whatsAppQueue,
                Buffer.from(JSON.stringify(payload)),
                {
                    persistent: true,
                    contentType: 'application/json',
                },
            );

            if (!sent) {
                logger.warn('[RabbitMQ] WhatsApp queue backpressure while publishing');
            }
        } catch (error: unknown) {
            logger.error(
                `[RabbitMQ] failed to publish WhatsApp confirmation: ${this.errorMessage(error)}`,
            );

            if (!RabbitMQConfig.fallbackToDirectWhatsApp) throw error;

            logger.warn(
                '[RabbitMQ] sending WhatsApp confirmation directly because queue publish failed',
            );
            await this.send(payload);
        }
    }

    static async startConsumer(): Promise<void> {
        if (!RabbitMQConfig.enabled) {
            logger.info('[RabbitMQ] WhatsApp consumer skipped because RabbitMQ is disabled');
            return;
        }

        try {
            const channel = await RabbitMQService.getChannel();
            await channel.assertQueue(RabbitMQConfig.whatsAppQueue, { durable: true });
            channel.prefetch(RabbitMQConfig.prefetch);

            await channel.consume(RabbitMQConfig.whatsAppQueue, async (message: Message | null) => {
                if (!message) return;

                let payload: WhatsAppBookingQueuePayload | null = null;
                try {
                    payload = JSON.parse(message.content.toString()) as WhatsAppBookingQueuePayload;
                    await this.send(payload);
                    channel.ack(message);
                } catch (error: unknown) {
                    const attempts = payload?.attempts ?? 0;
                    logger.error(
                        `[RabbitMQ] WhatsApp consumer failed (attempt ${attempts + 1}): ${this.errorMessage(error)}`,
                    );

                    if (payload && attempts < RabbitMQConfig.whatsAppMaxRetries) {
                        channel.sendToQueue(
                            RabbitMQConfig.whatsAppQueue,
                            Buffer.from(
                                JSON.stringify({
                                    ...payload,
                                    attempts: attempts + 1,
                                }),
                            ),
                            {
                                persistent: true,
                                contentType: 'application/json',
                            },
                        );
                        channel.ack(message);
                    } else {
                        logger.error(
                            `[RabbitMQ] WhatsApp confirmation permanently failed for booking ${payload?.vars?.bookingId || 'unknown'}`,
                        );
                        channel.nack(message, false, false);
                    }
                }
            });

            logger.info(`[RabbitMQ] WhatsApp consumer started: ${RabbitMQConfig.whatsAppQueue}`);
        } catch (error: unknown) {
            logger.error(`[RabbitMQ] WhatsApp consumer not started: ${this.errorMessage(error)}`);
        }
    }

    private static send(payload: WhatsAppBookingQueuePayload): Promise<void> {
        return this.service.sendBookingConfirmation(
            payload.phoneNumber,
            payload.vars,
            payload.imageBase64,
        );
    }

    private static errorMessage(error: unknown): string {
        return error instanceof Error ? error.message : String(error);
    }
}
