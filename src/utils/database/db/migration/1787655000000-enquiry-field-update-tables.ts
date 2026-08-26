import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnquiryFieldUpdateTables1787655000000 implements MigrationInterface {
    name = 'EnquiryFieldUpdateTables1787655000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "Enquiries" ADD COLUMN IF NOT EXISTS "enquiry_type" character varying(80)`,
        );
        await queryRunner.query(
            `ALTER TABLE "Enquiries" ADD COLUMN IF NOT EXISTS "mobile_number" character varying(20)`,
        );
        await queryRunner.query(
            `ALTER TABLE "Enquiries" ADD COLUMN IF NOT EXISTS "branch_id" uuid`,
        );
        await queryRunner.query(`ALTER TABLE "Enquiries" ADD COLUMN IF NOT EXISTS "details" jsonb`);
        await queryRunner.query(`
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'Enquiries' AND column_name = 'phone_no'
                ) THEN
                    UPDATE "Enquiries"
                    SET "mobile_number" = "phone_no"
                    WHERE "mobile_number" IS NULL;
                END IF;

                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'Enquiries' AND column_name = 'message'
                ) THEN
                    UPDATE "Enquiries"
                    SET "details" = jsonb_build_object('message', "message")
                    WHERE "details" IS NULL;
                END IF;
            END $$;
        `);
        await queryRunner.query(
            `UPDATE "Enquiries" SET "enquiry_type" = 'Individual Coaching' WHERE "enquiry_type" IS NULL`,
        );
        await queryRunner.query(
            `UPDATE "Enquiries" SET "details" = '{}'::jsonb WHERE "details" IS NULL`,
        );
        await queryRunner.query(`ALTER TABLE "Enquiries" DROP COLUMN IF EXISTS "phone_no"`);
        await queryRunner.query(`ALTER TABLE "Enquiries" DROP COLUMN IF EXISTS "message"`);
        await queryRunner.query(
            `CREATE INDEX IF NOT EXISTS "IDX_enquiries_type" ON "Enquiries" ("enquiry_type")`,
        );
        await queryRunner.query(
            `CREATE INDEX IF NOT EXISTS "IDX_enquiries_branch_id" ON "Enquiries" ("branch_id")`,
        );
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint WHERE conname = 'FK_enquiries_branch_id'
                ) THEN
                    ALTER TABLE "Enquiries"
                    ADD CONSTRAINT "FK_enquiries_branch_id"
                    FOREIGN KEY ("branch_id") REFERENCES "Branches"("id")
                    ON DELETE RESTRICT ON UPDATE NO ACTION;
                END IF;
            END $$;
        `);
    }

    public async down(): Promise<void> {
        return Promise.resolve();
    }
}
