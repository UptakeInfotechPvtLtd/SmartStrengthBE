import { ISendEmailParams } from '../../config';
import type { Message } from 'amqplib';
import { EmailService } from '../email.service';
import { logger } from '../log.util';
import { RabbitMQConfig } from './rabbitmq.config';
import { RabbitMQService } from './rabbitmq.service';

export type EmailQueuePayload = ISendEmailParams;

export class EmailQueue {
    static publishInBackground(payload: EmailQueuePayload): void {
        void this.publish(payload).catch((error: any) => {
            logger.error(`[RabbitMQ] background email publish failed: ${error?.message}`);
        });
    }

    static async publish(payload: EmailQueuePayload): Promise<void> {
        if (!RabbitMQConfig.enabled) {
            await EmailService.sendEmail(payload);
            return;
        }

        try {
            const channel = await RabbitMQService.getChannel();
            await channel.assertQueue(RabbitMQConfig.emailQueue, {
                durable: true,
            });

            const sent = channel.sendToQueue(
                RabbitMQConfig.emailQueue,
                Buffer.from(JSON.stringify(payload)),
                {
                    persistent: true,
                    contentType: 'application/json',
                },
            );

            if (!sent) {
                logger.warn('[RabbitMQ] email queue backpressure while publishing');
            }
        } catch (error: any) {
            logger.error(`[RabbitMQ] failed to publish email: ${error?.message}`);

            if (!RabbitMQConfig.fallbackToDirectEmail) {
                throw error;
            }

            logger.warn('[RabbitMQ] sending email directly because queue publish failed');
            await EmailService.sendEmail(payload);
        }
    }

    static async startConsumer(): Promise<void> {
        if (!RabbitMQConfig.enabled) {
            logger.info('[RabbitMQ] email consumer skipped because RabbitMQ is disabled');
            return;
        }

        try {
            const channel = await RabbitMQService.getChannel();
            await channel.assertQueue(RabbitMQConfig.emailQueue, {
                durable: true,
            });
            channel.prefetch(RabbitMQConfig.prefetch);

            await channel.consume(RabbitMQConfig.emailQueue, async (message: Message | null) => {
                if (!message) {
                    return;
                }

                try {
                    const payload = JSON.parse(message.content.toString()) as EmailQueuePayload;

                    // Reconstruct Buffer objects in attachments after JSON deserialization
                    if (payload.attachments && Array.isArray(payload.attachments)) {
                        payload.attachments = payload.attachments.map((attachment: any) => {
                            // Check if content is a serialized Buffer object
                            if (
                                attachment.content &&
                                typeof attachment.content === 'object' &&
                                attachment.content.type === 'Buffer' &&
                                Array.isArray(attachment.content.data)
                            ) {
                                // Reconstruct Buffer from serialized form
                                return {
                                    ...attachment,
                                    content: Buffer.from(attachment.content.data),
                                };
                            }
                            return attachment;
                        });
                    }

                    await EmailService.sendEmail(payload);
                    channel.ack(message);
                } catch (error: any) {
                    logger.error(`[RabbitMQ] email consumer failed: ${error?.message}`);
                    channel.nack(message, false, false);
                }
            });

            logger.info(`[RabbitMQ] email consumer started: ${RabbitMQConfig.emailQueue}`);
        } catch (error: any) {
            logger.error(`[RabbitMQ] email consumer not started: ${error?.message}`);
        }
    }
}
