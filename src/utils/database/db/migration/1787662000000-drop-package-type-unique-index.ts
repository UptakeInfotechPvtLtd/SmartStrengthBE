import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropPackageTypeUniqueIndex1787662000000 implements MigrationInterface {
    name = 'DropPackageTypeUniqueIndex1787662000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_packages_type_active_unique"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_packages_type_active_unique" ON "Packages" ("package_type") WHERE "deleted_at" IS NULL`,
        );
    }
}
