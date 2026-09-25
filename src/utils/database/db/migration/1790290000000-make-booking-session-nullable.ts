import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeBookingSessionNullable1790290000000 implements MigrationInterface {
    name = 'MakeBookingSessionNullable1790290000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Bookings" ALTER COLUMN "session_id" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Bookings" ALTER COLUMN "session_id" SET NOT NULL`);
    }
}
