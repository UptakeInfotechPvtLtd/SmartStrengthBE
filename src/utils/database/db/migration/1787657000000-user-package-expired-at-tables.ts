import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserPackageExpiredAtTables1787657000000 implements MigrationInterface {
    name = 'UserPackageExpiredAtTables1787657000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "UserPackages" ADD COLUMN IF NOT EXISTS "expired_at" TIMESTAMP`,
        );
        await queryRunner.query(
            `UPDATE "UserPackages" SET "expired_at" = "purchased_at" + ("valid_days" || ' days')::interval WHERE "expired_at" IS NULL`,
        );
        await queryRunner.query(
            `ALTER TABLE "UserPackages" ALTER COLUMN "expired_at" SET NOT NULL`,
        );
        await queryRunner.query(
            `CREATE INDEX IF NOT EXISTS "IDX_user_packages_expired_at" ON "UserPackages" ("expired_at")`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_user_packages_expired_at"`);
        await queryRunner.query(`ALTER TABLE "UserPackages" DROP COLUMN IF EXISTS "expired_at"`);
    }
}
