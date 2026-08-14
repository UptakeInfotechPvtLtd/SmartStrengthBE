import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserPerformanceMetrics1786539100000 implements MigrationInterface {
    name = 'AddUserPerformanceMetrics1786539100000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "UserPerformanceMetrics" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "metric_date" date NOT NULL, "metrics" jsonb NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, CONSTRAINT "PK_82e84b69249fb70bfb3b8d174e5" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE UNIQUE INDEX "IDX_user_performance_metrics_user_date_unique" ON "UserPerformanceMetrics" ("user_id", "metric_date") `,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_user_performance_metrics_metric_date" ON "UserPerformanceMetrics" ("metric_date") `,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_user_performance_metrics_user_id" ON "UserPerformanceMetrics" ("user_id") `,
        );
        await queryRunner.query(
            `INSERT INTO "UserPerformanceMetrics" ("user_id", "metric_date", "metrics")
             SELECT "id", CURRENT_DATE, "performance_metrics"
             FROM "Users"
             WHERE "performance_metrics" IS NOT NULL`,
        );
        await queryRunner.query(`ALTER TABLE "Users" DROP COLUMN "performance_metrics"`);
        await queryRunner.query(
            `ALTER TABLE "UserPerformanceMetrics" ADD CONSTRAINT "FK_user_performance_metrics_user" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "UserPerformanceMetrics" DROP CONSTRAINT "FK_user_performance_metrics_user"`,
        );
        await queryRunner.query(`ALTER TABLE "Users" ADD "performance_metrics" jsonb`);
        await queryRunner.query(
            `UPDATE "Users" user_data
             SET "performance_metrics" = performance_metrics.metrics
             FROM (
                 SELECT DISTINCT ON ("user_id") "user_id", "metrics"
                 FROM "UserPerformanceMetrics"
                 ORDER BY "user_id", "metric_date" DESC
             ) performance_metrics
             WHERE user_data."id" = performance_metrics."user_id"`,
        );
        await queryRunner.query(`DROP INDEX "public"."IDX_user_performance_metrics_user_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_user_performance_metrics_metric_date"`);
        await queryRunner.query(
            `DROP INDEX "public"."IDX_user_performance_metrics_user_date_unique"`,
        );
        await queryRunner.query(`DROP TABLE "UserPerformanceMetrics"`);
    }
}
