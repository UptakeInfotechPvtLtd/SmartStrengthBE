import amqp from 'amqplib';
import type { Channel, Connection } from 'amqplib';
import { logger } from '../log.util';
import { RabbitMQConfig } from './rabbitmq.config';

export class RabbitMQService {
    private static connection: Connection | null = null;
    private static publisherChannel: Channel | null = null;
    private static consumerChannel: Channel | null = null;

    static async getChannel(): Promise<Channel> {
        return this.getPublisherChannel();
    }

    static async getPublisherChannel(): Promise<Channel> {
        if (this.publisherChannel) {
            return this.publisherChannel;
        }

        const channel = await this.createChannel('publisher');
        this.publisherChannel = channel;

        return channel;
    }

    static async getConsumerChannel(): Promise<Channel> {
        if (this.consumerChannel) {
            return this.consumerChannel;
        }

        const channel = await this.createChannel('consumer');
        this.consumerChannel = channel;

        return channel;
    }

    private static async createChannel(type: 'publisher' | 'consumer'): Promise<Channel> {
        const connection = await this.getConnection();
        const channel = await connection.createChannel();
        channel.on('error', (error: Error) => {
            logger.error(`[RabbitMQ] ${type} channel error: ${error.message}`);
            if (type === 'publisher') {
                this.publisherChannel = null;
            } else {
                this.consumerChannel = null;
            }
        });
        channel.on('close', () => {
            logger.warn(`[RabbitMQ] ${type} channel closed`);
            if (type === 'publisher') {
                this.publisherChannel = null;
            } else {
                this.consumerChannel = null;
            }
        });

        logger.info(`[RabbitMQ] ${type} channel ready`);

        return channel;
    }

    private static async getConnection(): Promise<Connection> {
        if (this.connection) {
            return this.connection;
        }

        if (!RabbitMQConfig.enabled) {
            throw new Error('RabbitMQ is disabled.');
        }

        const connection = await amqp.connect(RabbitMQConfig.url);
        this.connection = connection;

        connection.on('error', (error: Error) => {
            logger.error(`[RabbitMQ] connection error: ${error.message}`);
            this.connection = null;
            this.publisherChannel = null;
            this.consumerChannel = null;
        });

        connection.on('close', () => {
            logger.warn('[RabbitMQ] connection closed');
            this.connection = null;
            this.publisherChannel = null;
            this.consumerChannel = null;
        });

        logger.info('[RabbitMQ] connected');

        return connection;
    }

    static async close(): Promise<void> {
        if (this.publisherChannel) {
            await this.publisherChannel.close();
            this.publisherChannel = null;
        }

        if (this.consumerChannel) {
            await this.consumerChannel.close();
            this.consumerChannel = null;
        }

        if (this.connection) {
            await this.connection.close();
            this.connection = null;
        }
    }
}
