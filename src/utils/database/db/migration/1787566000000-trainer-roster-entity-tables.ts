import { MigrationInterface, QueryRunner } from 'typeorm';

export class TrainerRosterEntityTables1787566000000 implements MigrationInterface {
    name = 'TrainerRosterEntityTables1787566000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "TrainerRosters" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "day_of_week" character varying(20) NOT NULL, "start_time" TIME NOT NULL, "end_time" TIME NOT NULL, "status" character varying(20) NOT NULL DEFAULT 'working', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "branch_id" uuid, "trainer_id" uuid, CONSTRAINT "PK_trainer_rosters_id" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_trainer_rosters_branch_id" ON "TrainerRosters" ("branch_id")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_trainer_rosters_trainer_id" ON "TrainerRosters" ("trainer_id")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_trainer_rosters_day_of_week" ON "TrainerRosters" ("day_of_week")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_trainer_rosters_status" ON "TrainerRosters" ("status")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_trainer_rosters_time_range" ON "TrainerRosters" ("start_time", "end_time")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_trainer_rosters_deleted_at" ON "TrainerRosters" ("deleted_at")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_trainer_rosters_created_at" ON "TrainerRosters" ("created_at")`,
        );
        await queryRunner.query(
            `ALTER TABLE "TrainerRosters" ADD CONSTRAINT "FK_trainer_rosters_branch_id" FOREIGN KEY ("branch_id") REFERENCES "Branches"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "TrainerRosters" ADD CONSTRAINT "FK_trainer_rosters_trainer_id" FOREIGN KEY ("trainer_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "TrainerRosters" DROP CONSTRAINT "FK_trainer_rosters_trainer_id"`,
        );
        await queryRunner.query(
            `ALTER TABLE "TrainerRosters" DROP CONSTRAINT "FK_trainer_rosters_branch_id"`,
        );
        await queryRunner.query(`DROP INDEX "public"."IDX_trainer_rosters_created_at"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_trainer_rosters_deleted_at"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_trainer_rosters_time_range"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_trainer_rosters_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_trainer_rosters_day_of_week"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_trainer_rosters_trainer_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_trainer_rosters_branch_id"`);
        await queryRunner.query(`DROP TABLE "TrainerRosters"`);
    }
}
