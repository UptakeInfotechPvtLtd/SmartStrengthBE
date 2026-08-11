import amqp from 'amqplib';
import type { Channel, Connection } from 'amqplib';
import { logger } from '../log.util';
import { RabbitMQConfig } from './rabbitmq.config';
import { messages } from '../../lang/api-messages';
import { BadRequestException } from '../error';

export class RabbitMQService {
    private static connection: Connection | null = null;
    private static channel: Channel | null = null;
    private static connectingPromise: Promise<Channel> | null = null;

    static async getChannel(): Promise<Channel> {
        if (this.channel) {
            return this.channel;
        }

        if (this.connectingPromise) {
            return this.connectingPromise;
        }

        this.connectingPromise = this.connect();

        try {
            return await this.connectingPromise;
        } finally {
            this.connectingPromise = null;
        }
    }

    static async connect(): Promise<Channel> {
        if (!RabbitMQConfig.enabled) {
            throw new BadRequestException(messages.rabbitMqDisabled);
        }

        const connection = await amqp.connect(RabbitMQConfig.url);
        const channel = await connection.createChannel();

        connection.on('error', (error) => {
            logger.error(`[RabbitMQ] connection error: ${error?.message}`);
            this.connection = null;
            this.channel = null;
        });

        connection.on('close', () => {
            logger.warn('[RabbitMQ] connection closed');
            this.connection = null;
            this.channel = null;
        });

        channel.on('error', (error) => {
            logger.error(`[RabbitMQ] channel error: ${error?.message}`);
            this.channel = null;
        });

        this.connection = connection;
        this.channel = channel;

        logger.info('[RabbitMQ] connected');
        return channel;
    }

    static async close(): Promise<void> {
        await this.channel?.close();
        await this.connection?.close();
        this.channel = null;
        this.connection = null;
    }
}
