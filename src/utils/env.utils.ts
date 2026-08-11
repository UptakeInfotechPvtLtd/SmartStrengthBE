import fs from 'fs';
import { logger } from './log.util';

export class EnvError extends Error {
    constructor(message: string) {
        super(message);
    }
}

/**
 * @warning To load please set {APP_ENV_FILE_PATH=/path/to/file.env} on your machine
 * @returns string
 */
export const envFile = () => `.env`;

/**
 * It will load the .env file and set the environment variables
 */
export const loadEnv = () => {
    const envFilePath = envFile();

    if (!fs.existsSync(envFilePath)) {
        logger.error(`${envFilePath} does not exist.`);
    }
    logger.log(`Loading ${envFilePath}`);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('dotenv').config({ path: envFilePath, override: true });
    // Keep Date-based business rules and TypeORM timestamp serialization
    // aligned with the application's operating timezone.
    process.env.TZ = process.env.APP_TIMEZONE || 'Asia/Kolkata';
};

/**
 * Will returns the environment variables from the machine you can also returns the default property if not found
 * @param name {string}
 * @param def string
 * @returns string
 */
export const getEnv = (name: string, def?: string): string => {
    const upperName = name.toUpperCase();
    const env = process.env[upperName];
    if (env !== undefined) {
        return env;
    }
    if (def !== undefined) {
        return def;
    }
    const envPath = envFile();
    throw new EnvError(`in ${envPath} file '${upperName}' not found.`);
};

/**
 * Retrieve a boolean environment variable.
 * Returns the provided defaultValue if variable is undefined.
 */
export const getEnvBoolean = (name: string, defaultValue?: boolean): boolean => {
    const val = process.env[name.toUpperCase()];
    if (val === undefined) {
        if (defaultValue !== undefined) return defaultValue;
        const envPath = envFile();
        throw new EnvError(`in ${envPath} file '${name.toUpperCase()}' not found.`);
    }
    return val === 'true' || val === '1';
};
