import { MigrationInterface, QueryRunner } from 'typeorm';

export class BookingCancelRescheduleTables1787660000000 implements MigrationInterface {
    name = 'BookingCancelRescheduleTables1787660000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "Bookings" ADD COLUMN IF NOT EXISTS "cancelled_at" TIMESTAMP`,
        );
        await queryRunner.query(
            `ALTER TABLE "Bookings" ADD COLUMN IF NOT EXISTS "rescheduled_at" TIMESTAMP`,
        );
        await queryRunner.query(
            `CREATE INDEX IF NOT EXISTS "IDX_bookings_cancelled_at" ON "Bookings" ("cancelled_at")`,
        );
        await queryRunner.query(
            `CREATE INDEX IF NOT EXISTS "IDX_bookings_rescheduled_at" ON "Bookings" ("rescheduled_at")`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_bookings_rescheduled_at"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_bookings_cancelled_at"`);
        await queryRunner.query(`ALTER TABLE "Bookings" DROP COLUMN IF EXISTS "rescheduled_at"`);
        await queryRunner.query(`ALTER TABLE "Bookings" DROP COLUMN IF EXISTS "cancelled_at"`);
    }
}
