import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserPackageEntityTables1787656000000 implements MigrationInterface {
    name = 'UserPackageEntityTables1787656000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "UserPackages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "package_id" uuid NOT NULL, "package_type" character varying(50) NOT NULL, "price" numeric(10,2) NOT NULL, "number_of_sessions" integer NOT NULL, "remaining_sessions" integer NOT NULL, "valid_days" integer NOT NULL, "purchased_at" TIMESTAMP NOT NULL, "expired_at" TIMESTAMP NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_user_packages_id" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_user_packages_user_id" ON "UserPackages" ("user_id")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_user_packages_package_id" ON "UserPackages" ("package_id")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_user_packages_purchased_at" ON "UserPackages" ("purchased_at")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_user_packages_expired_at" ON "UserPackages" ("expired_at")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_user_packages_deleted_at" ON "UserPackages" ("deleted_at")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_user_packages_created_at" ON "UserPackages" ("created_at")`,
        );
        await queryRunner.query(
            `ALTER TABLE "UserPackages" ADD CONSTRAINT "FK_user_packages_user_id" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "UserPackages" ADD CONSTRAINT "FK_user_packages_package_id" FOREIGN KEY ("package_id") REFERENCES "Packages"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "UserPackages" DROP CONSTRAINT "FK_user_packages_package_id"`,
        );
        await queryRunner.query(
            `ALTER TABLE "UserPackages" DROP CONSTRAINT "FK_user_packages_user_id"`,
        );
        await queryRunner.query(`DROP INDEX "public"."IDX_user_packages_created_at"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_user_packages_deleted_at"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_user_packages_expired_at"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_user_packages_purchased_at"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_user_packages_package_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_user_packages_user_id"`);
        await queryRunner.query(`DROP TABLE "UserPackages"`);
    }
}
