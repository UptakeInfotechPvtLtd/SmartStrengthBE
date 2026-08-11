import { MigrationInterface, QueryRunner } from 'typeorm';

export class SetAppTimezone1786439864220 implements MigrationInterface {
    name = 'SetAppTimezone1786439864220';

    public async up(queryRunner: QueryRunner): Promise<void> {
        const [{ current_database: databaseName }] =
            await queryRunner.query(`SELECT current_database()`);

        await queryRunner.query(
            `ALTER DATABASE ${this.quoteIdentifier(databaseName)} SET timezone TO 'Asia/Kolkata'`,
        );
        await queryRunner.query(`SET TIME ZONE 'Asia/Kolkata'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const [{ current_database: databaseName }] =
            await queryRunner.query(`SELECT current_database()`);

        await queryRunner.query(
            `ALTER DATABASE ${this.quoteIdentifier(databaseName)} RESET timezone`,
        );
        await queryRunner.query(`SET TIME ZONE DEFAULT`);
    }

    private quoteIdentifier(identifier: string): string {
        return `"${identifier.replace(/"/g, '""')}"`;
    }
}
