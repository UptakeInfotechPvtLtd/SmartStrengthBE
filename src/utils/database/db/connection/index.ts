import path from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';
import { databaseConf } from '../../config';
import { entities } from '../entity';
import { logger } from '../../../log.util';

const migrationFolder = path.join(__dirname, '../migration/**/*.{ts,js}');

const ormConfig: DataSourceOptions = {
    type: databaseConf.DB_TYPE(),
    replication: {
        master: {
            host: databaseConf.DB_HOST(),
            port: databaseConf.DB_PORT(),
            username: databaseConf.DB_USERNAME(),
            password: databaseConf.DB_PASSWORD(),
            database: databaseConf.DB_NAME(),
        },
        slaves: [],
    },
    ssl: false,
    // PostgreSQL applies this setting to each pooled connection. It is kept in
    // sync with Node's TZ so timestamp-without-time-zone columns retain IST.
    extra:
        databaseConf.DB_TYPE() === 'postgres'
            ? { options: `-c timezone=${databaseConf.TIMEZONE()}` }
            : undefined,
    entities: entities,
    migrations: [migrationFolder],
    migrationsTableName: 'migrations',
    logging: databaseConf.LOG_LEVEL() as any,
    synchronize: false,
};

export const DbDataSource = new DataSource(ormConfig);

export const connectDB = async () => {
    try {
        if (!DbDataSource.isInitialized) {
            await DbDataSource.initialize();
            logger.log('DB connected successfully');
        }
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error('DB connection failed', errorMessage);
        console.error('DB Error Details:', error);
        process.exit(1);
    }
};
