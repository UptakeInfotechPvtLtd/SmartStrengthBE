import { MigrationInterface, QueryRunner } from "typeorm";

export class PackageSessionEntityChangesTables1787555090352 implements MigrationInterface {
    name = 'PackageSessionEntityChangesTables1787555090352'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_packages_name"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_packages_name_active_unique"`);
        await queryRunner.query(`ALTER TABLE "Sessions" DROP COLUMN "duration"`);
        await queryRunner.query(`ALTER TABLE "Packages" DROP COLUMN "package_name"`);
        await queryRunner.query(`ALTER TABLE "Packages" DROP COLUMN "validity_in_days"`);
        await queryRunner.query(`ALTER TABLE "Packages" DROP COLUMN "best_for"`);
        await queryRunner.query(`ALTER TABLE "Packages" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "Packages" ADD "package_type" character varying(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "Packages" ADD "valid_days" integer NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_packages_type" ON "Packages" ("package_type") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_packages_type_active_unique" ON "Packages" ("package_type") WHERE "deleted_at" IS NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_packages_type_active_unique"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_packages_type"`);
        await queryRunner.query(`ALTER TABLE "Packages" DROP COLUMN "valid_days"`);
        await queryRunner.query(`ALTER TABLE "Packages" DROP COLUMN "package_type"`);
        await queryRunner.query(`ALTER TABLE "Packages" ADD "description" text`);
        await queryRunner.query(`ALTER TABLE "Packages" ADD "best_for" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "Packages" ADD "validity_in_days" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "Packages" ADD "package_name" character varying(150) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "Sessions" ADD "duration" integer NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_packages_name_active_unique" ON "Packages" ("package_name") WHERE (deleted_at IS NULL)`);
        await queryRunner.query(`CREATE INDEX "IDX_packages_name" ON "Packages" ("package_name") `);
    }

}
