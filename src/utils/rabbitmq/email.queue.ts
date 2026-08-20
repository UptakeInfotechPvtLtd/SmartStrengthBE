import type { Message } from 'amqplib';
import { ISendEmailParams } from '../../config';
import { EmailService } from '../email.service';
import { logger } from '../log.util';
import { RabbitMQConfig } from './rabbitmq.config';
import { RabbitMQService } from './rabbitmq.service';

export type EmailQueuePayload = ISendEmailParams;

export class EmailQueue {
    static publishInBackground(payload: EmailQueuePayload): void {
        this.publish(payload).catch((error: Error) => {
            logger.error(`[RabbitMQ] background email publish failed: ${error.message}`);
        });
    }

    static async publish(payload: EmailQueuePayload): Promise<void> {
        if (!RabbitMQConfig.enabled) {
            await EmailService.sendEmail(payload);
            return;
        }

        try {
            const channel = await RabbitMQService.getPublisherChannel();
            await channel.assertQueue(RabbitMQConfig.emailQueue, { durable: true });
            const published = channel.sendToQueue(
                RabbitMQConfig.emailQueue,
                Buffer.from(JSON.stringify(payload)),
                { persistent: true, contentType: 'application/json' },
            );

            if (!published) {
                logger.warn('[RabbitMQ] email queue backpressure while publishing');
            }
            logger.info(`[RabbitMQ] email published to ${RabbitMQConfig.emailQueue}: ${payload.to}`);
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
            const channel = await RabbitMQService.getConsumerChannel();
            await channel.assertQueue(RabbitMQConfig.emailQueue, { durable: true });
            channel.prefetch(RabbitMQConfig.prefetch);

            const consumeResult = (await channel.consume(
                RabbitMQConfig.emailQueue,
                async (message: Message | null) => {
                    if (!message) {
                        return;
                    }

                    try {
                        const payload = JSON.parse(message.content.toString()) as EmailQueuePayload;
                        logger.info(
                            `[RabbitMQ] email consumed from ${RabbitMQConfig.emailQueue}: ${payload.to}`,
                        );
                        await EmailService.sendEmail(payload);
                        channel.ack(message);
                    } catch (error: any) {
                        logger.error(`[RabbitMQ] email consumer failed: ${error?.message}`);
                        channel.nack(message, false, false);
                    }
                },
            )) as { consumerTag: string };

            logger.info(
                `[RabbitMQ] email consumer started: ${RabbitMQConfig.emailQueue} (${consumeResult.consumerTag})`,
            );
        } catch (error: any) {
            logger.error(`[RabbitMQ] email consumer not started: ${error?.message}`);
        }
    }
}
