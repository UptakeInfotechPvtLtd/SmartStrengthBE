import { MigrationInterface, QueryRunner } from 'typeorm';

export class BookingEntityTables1787659000000 implements MigrationInterface {
    name = 'BookingEntityTables1787659000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE IF NOT EXISTS "Bookings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "session_id" uuid NOT NULL, "branch_id" uuid NOT NULL, "trainer_id" uuid NOT NULL, "user_package_id" uuid, "booking_date" date NOT NULL, "start_time" time NOT NULL, "end_time" time NOT NULL, "status" character varying(20) NOT NULL DEFAULT 'confirmed', "is_direct_booking" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_bookings_id" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE INDEX IF NOT EXISTS "IDX_bookings_user_id" ON "Bookings" ("user_id")`,
        );
        await queryRunner.query(
            `CREATE INDEX IF NOT EXISTS "IDX_bookings_branch_id" ON "Bookings" ("branch_id")`,
        );
        await queryRunner.query(
            `CREATE INDEX IF NOT EXISTS "IDX_bookings_trainer_id" ON "Bookings" ("trainer_id")`,
        );
        await queryRunner.query(
            `CREATE INDEX IF NOT EXISTS "IDX_bookings_session_id" ON "Bookings" ("session_id")`,
        );
        await queryRunner.query(
            `CREATE INDEX IF NOT EXISTS "IDX_bookings_user_package_id" ON "Bookings" ("user_package_id")`,
        );
        await queryRunner.query(
            `CREATE INDEX IF NOT EXISTS "IDX_bookings_booking_date" ON "Bookings" ("booking_date")`,
        );
        await queryRunner.query(
            `CREATE INDEX IF NOT EXISTS "IDX_bookings_status" ON "Bookings" ("status")`,
        );
        await queryRunner.query(
            `CREATE INDEX IF NOT EXISTS "IDX_bookings_time_range" ON "Bookings" ("start_time", "end_time")`,
        );
        await queryRunner.query(
            `CREATE INDEX IF NOT EXISTS "IDX_bookings_deleted_at" ON "Bookings" ("deleted_at")`,
        );
        await queryRunner.query(
            `CREATE INDEX IF NOT EXISTS "IDX_bookings_created_at" ON "Bookings" ("created_at")`,
        );
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_bookings_user_id') THEN
                    ALTER TABLE "Bookings" ADD CONSTRAINT "FK_bookings_user_id" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_bookings_session_id') THEN
                    ALTER TABLE "Bookings" ADD CONSTRAINT "FK_bookings_session_id" FOREIGN KEY ("session_id") REFERENCES "Sessions"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_bookings_branch_id') THEN
                    ALTER TABLE "Bookings" ADD CONSTRAINT "FK_bookings_branch_id" FOREIGN KEY ("branch_id") REFERENCES "Branches"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_bookings_trainer_id') THEN
                    ALTER TABLE "Bookings" ADD CONSTRAINT "FK_bookings_trainer_id" FOREIGN KEY ("trainer_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_bookings_user_package_id') THEN
                    ALTER TABLE "Bookings" ADD CONSTRAINT "FK_bookings_user_package_id" FOREIGN KEY ("user_package_id") REFERENCES "UserPackages"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
                END IF;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "Bookings" DROP CONSTRAINT IF EXISTS "FK_bookings_user_package_id"`,
        );
        await queryRunner.query(
            `ALTER TABLE "Bookings" DROP CONSTRAINT IF EXISTS "FK_bookings_trainer_id"`,
        );
        await queryRunner.query(
            `ALTER TABLE "Bookings" DROP CONSTRAINT IF EXISTS "FK_bookings_branch_id"`,
        );
        await queryRunner.query(
            `ALTER TABLE "Bookings" DROP CONSTRAINT IF EXISTS "FK_bookings_session_id"`,
        );
        await queryRunner.query(
            `ALTER TABLE "Bookings" DROP CONSTRAINT IF EXISTS "FK_bookings_user_id"`,
        );
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_bookings_created_at"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_bookings_deleted_at"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_bookings_time_range"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_bookings_status"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_bookings_booking_date"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_bookings_user_package_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_bookings_session_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_bookings_trainer_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_bookings_branch_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_bookings_user_id"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "Bookings"`);
    }
}
