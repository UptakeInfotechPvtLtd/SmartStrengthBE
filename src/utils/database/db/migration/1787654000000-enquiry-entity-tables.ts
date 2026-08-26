import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnquiryEntityTables1787654000000 implements MigrationInterface {
    name = 'EnquiryEntityTables1787654000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "Enquiries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "enquiry_type" character varying(80) NOT NULL, "full_name" character varying(150) NOT NULL, "email" character varying(255) NOT NULL, "mobile_number" character varying(20) NOT NULL, "branch_id" uuid NOT NULL, "details" jsonb NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_enquiries_id" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(`CREATE INDEX "IDX_enquiries_email" ON "Enquiries" ("email")`);
        await queryRunner.query(
            `CREATE INDEX "IDX_enquiries_type" ON "Enquiries" ("enquiry_type")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_enquiries_branch_id" ON "Enquiries" ("branch_id")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_enquiries_deleted_at" ON "Enquiries" ("deleted_at")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_enquiries_created_at" ON "Enquiries" ("created_at")`,
        );
        await queryRunner.query(
            `ALTER TABLE "Enquiries" ADD CONSTRAINT "FK_enquiries_branch_id" FOREIGN KEY ("branch_id") REFERENCES "Branches"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Enquiries" DROP CONSTRAINT "FK_enquiries_branch_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_enquiries_created_at"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_enquiries_deleted_at"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_enquiries_branch_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_enquiries_type"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_enquiries_email"`);
        await queryRunner.query(`DROP TABLE "Enquiries"`);
    }
}
