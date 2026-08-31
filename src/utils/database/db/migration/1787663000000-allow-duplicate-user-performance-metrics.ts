import { MigrationInterface, QueryRunner } from 'typeorm';

export class AllowDuplicateUserPerformanceMetrics1787663000000 implements MigrationInterface {
    name = 'AllowDuplicateUserPerformanceMetrics1787663000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DROP INDEX IF EXISTS "public"."IDX_user_performance_metrics_user_date_unique"`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE UNIQUE INDEX "IDX_user_performance_metrics_user_date_unique" ON "UserPerformanceMetrics" ("user_id", "metric_date")`,
        );
    }
}
