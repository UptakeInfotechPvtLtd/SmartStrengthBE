import amqp from 'amqplib';
import type { Channel, Connection } from 'amqplib';
import { logger } from '../log.util';
import { RabbitMQConfig } from './rabbitmq.config';

export class RabbitMQService {
    private static connection: Connection | null = null;
    private static channel: Channel | null = null;

    static async getChannel(): Promise<Channel> {
        if (this.channel) {
            return this.channel;
        }

        if (!RabbitMQConfig.enabled) {
            throw new Error('RabbitMQ is disabled.');
        }

        const connection = await amqp.connect(RabbitMQConfig.url);
        this.connection = connection;

        connection.on('error', (error: Error) => {
            logger.error(`[RabbitMQ] connection error: ${error.message}`);
            this.connection = null;
            this.channel = null;
        });

        connection.on('close', () => {
            logger.warn('[RabbitMQ] connection closed');
            this.connection = null;
            this.channel = null;
        });

        const channel = await connection.createChannel();
        channel.on('error', (error: Error) => {
            logger.error(`[RabbitMQ] channel error: ${error.message}`);
            this.channel = null;
        });

        this.channel = channel;
        logger.info('[RabbitMQ] connected');

        return channel;
    }

    static async close(): Promise<void> {
        if (this.channel) {
            await this.channel.close();
            this.channel = null;
        }

        if (this.connection) {
            await this.connection.close();
            this.connection = null;
        }
    }
}
