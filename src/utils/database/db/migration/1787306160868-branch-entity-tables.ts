import { MigrationInterface, QueryRunner } from 'typeorm';

export class BranchEntityTables1787306160868 implements MigrationInterface {
    name = 'BranchEntityTables1787306160868';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_branches_name"`);
        await queryRunner.query(`ALTER TABLE "Branches" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "Branches" DROP COLUMN "contact_number"`);
        await queryRunner.query(`ALTER TABLE "Branches" DROP COLUMN "map_link"`);
        await queryRunner.query(`ALTER TABLE "Branches" DROP COLUMN "branch_images"`);
        await queryRunner.query(
            `ALTER TABLE "Branches" ADD "branch_name" character varying(150) NOT NULL`,
        );
        await queryRunner.query(`ALTER TABLE "Branches" ADD "map_url" text`);
        await queryRunner.query(
            `CREATE INDEX "IDX_branches_branch_name" ON "Branches" ("branch_name") `,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_branches_branch_name"`);
        await queryRunner.query(`ALTER TABLE "Branches" DROP COLUMN "map_url"`);
        await queryRunner.query(`ALTER TABLE "Branches" DROP COLUMN "branch_name"`);
        await queryRunner.query(`ALTER TABLE "Branches" ADD "branch_images" jsonb DEFAULT '[]'`);
        await queryRunner.query(`ALTER TABLE "Branches" ADD "map_link" text`);
        await queryRunner.query(
            `ALTER TABLE "Branches" ADD "contact_number" character varying(20)`,
        );
        await queryRunner.query(
            `ALTER TABLE "Branches" ADD "name" character varying(150) NOT NULL`,
        );
        await queryRunner.query(`CREATE INDEX "IDX_branches_name" ON "Branches" ("name") `);
    }
}
