import { createClient, RedisClientType } from 'redis';
import { getEnv } from '../utils';

// Create Redis client
const redis: RedisClientType = createClient({
    url: getEnv('REDIS_URL'),
});

// Handle errors
redis.on('error', (err: Error) => {
    console.error('Redis error:', err);
});

// Connect immediately
(async () => {
    try {
        await redis.connect();
        console.log('Redis connected');
    } catch (err) {
        console.error('Redis connection failed:', err);
    }
})();

export default redis;
