import { configDotenv } from 'dotenv';
import { Redis } from 'ioredis';

configDotenv();

const url = new URL(process.env.REDIS_URL!);

export const redisConnection = new Redis({
    host: url.hostname,
    port: parseInt(url.port),
    password: url.password,
    tls: {}
});
