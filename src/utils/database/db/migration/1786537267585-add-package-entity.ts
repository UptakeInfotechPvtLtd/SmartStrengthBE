import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPackageEntity1786537267585 implements MigrationInterface {
    name = 'AddPackageEntity1786537267585';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "Packages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "package_name" character varying(150) NOT NULL, "price" numeric(10,2) NOT NULL, "number_of_sessions" integer NOT NULL, "validity_in_days" integer NOT NULL, "best_for" character varying(255) NOT NULL, "description" text, "status" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_2c81b9c345c28dbba72e54bfc0b" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_packages_created_at" ON "Packages" ("created_at") `,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_packages_deleted_at" ON "Packages" ("deleted_at") `,
        );
        await queryRunner.query(`CREATE INDEX "IDX_packages_status" ON "Packages" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_packages_name" ON "Packages" ("package_name") `);
        await queryRunner.query(
            `CREATE UNIQUE INDEX "IDX_packages_name_active_unique" ON "Packages" ("package_name") WHERE "deleted_at" IS NULL`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_packages_name_active_unique"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_packages_name"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_packages_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_packages_deleted_at"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_packages_created_at"`);
        await queryRunner.query(`DROP TABLE "Packages"`);
    }
}
