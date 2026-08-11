declare module 'amqplib' {
    import { EventEmitter } from 'events';

    export interface Connection extends EventEmitter {
        createChannel(): Promise<Channel>;
        close(): Promise<void>;
    }

    export interface Message {
        content: Buffer;
    }

    export interface Channel extends EventEmitter {
        assertQueue(queue: string, options?: { durable?: boolean }): Promise<unknown>;
        sendToQueue(
            queue: string,
            content: Buffer,
            options?: { persistent?: boolean; contentType?: string },
        ): boolean;
        prefetch(count: number): void;
        consume(
            queue: string,
            onMessage: (message: Message | null) => void | Promise<void>,
        ): Promise<unknown>;
        ack(message: Message): void;
        nack(message: Message, allUpTo?: boolean, requeue?: boolean): void;
        close(): Promise<void>;
    }

    export function connect(url: string): Promise<Connection>;

    const amqp: {
        connect: typeof connect;
    };

    export default amqp;
}
