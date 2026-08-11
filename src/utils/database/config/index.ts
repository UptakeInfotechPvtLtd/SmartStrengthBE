import { getEnv, loadEnv } from '../../env.utils';

loadEnv();
export const databaseConf = {
    DB_TYPE: () => getEnv('DB_TYPE') as any,
    DB_HOST: () => getEnv('DB_HOST'),
    DB_PORT: () => parseInt(getEnv('DB_PORT')),
    DB_USERNAME: () => getEnv('DB_USERNAME'),
    DB_PASSWORD: () => getEnv('DB_PASSWORD'),
    DB_NAME: () => getEnv('DB_NAME'),
    LOG_LEVEL: () => getEnv('DB_LOG_LEVEL'),
    TIMEZONE: () => getEnv('APP_TIMEZONE', 'Asia/Kolkata'),
};
