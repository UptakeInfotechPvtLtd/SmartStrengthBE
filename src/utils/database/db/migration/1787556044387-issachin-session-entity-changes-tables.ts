import { MigrationInterface, QueryRunner } from "typeorm";

export class IssachinSessionEntityChangesTables1787556044387 implements MigrationInterface {
    name = 'IssachinSessionEntityChangesTables1787556044387'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Sessions" ADD "is_sachin_status" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`CREATE INDEX "IDX_sessions_is_sachin_status" ON "Sessions" ("is_sachin_status") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_sessions_is_sachin_status"`);
        await queryRunner.query(`ALTER TABLE "Sessions" DROP COLUMN "is_sachin_status"`);
    }

}
