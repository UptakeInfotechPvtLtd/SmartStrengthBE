import { MigrationInterface, QueryRunner } from 'typeorm';

export class TestimonialEntityTables1787661000000 implements MigrationInterface {
    name = 'TestimonialEntityTables1787661000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "Testimonials" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "rating_count" integer NOT NULL, "experience" text, "status" character varying(20) NOT NULL DEFAULT 'Pending', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_testimonials_id" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_testimonials_user_id" ON "Testimonials" ("user_id")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_testimonials_status" ON "Testimonials" ("status")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_testimonials_deleted_at" ON "Testimonials" ("deleted_at")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_testimonials_created_at" ON "Testimonials" ("created_at")`,
        );
        await queryRunner.query(
            `ALTER TABLE "Testimonials" ADD CONSTRAINT "FK_testimonials_user_id" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "Testimonials" DROP CONSTRAINT "FK_testimonials_user_id"`,
        );
        await queryRunner.query(`DROP INDEX "public"."IDX_testimonials_created_at"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_testimonials_deleted_at"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_testimonials_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_testimonials_user_id"`);
        await queryRunner.query(`DROP TABLE "Testimonials"`);
    }
}
