import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserPackageRemainingSessionsTables1787658000000 implements MigrationInterface {
    name = 'UserPackageRemainingSessionsTables1787658000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "UserPackages" ADD COLUMN IF NOT EXISTS "remaining_sessions" integer`,
        );
        await queryRunner.query(
            `UPDATE "UserPackages" SET "remaining_sessions" = "number_of_sessions" WHERE "remaining_sessions" IS NULL`,
        );
        await queryRunner.query(
            `ALTER TABLE "UserPackages" ALTER COLUMN "remaining_sessions" SET NOT NULL`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "UserPackages" DROP COLUMN IF EXISTS "remaining_sessions"`,
        );
    }
}
