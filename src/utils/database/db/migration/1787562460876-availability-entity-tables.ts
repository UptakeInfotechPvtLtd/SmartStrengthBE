import { MigrationInterface, QueryRunner } from "typeorm";

export class AvailabilityEntityTables1787562460876 implements MigrationInterface {
    name = 'AvailabilityEntityTables1787562460876'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "BranchAvailabilitySettings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" character varying(20) NOT NULL DEFAULT 'open', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "branch_id" uuid, CONSTRAINT "PK_1214526fef5be4ad861e3ec879e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_branch_availability_settings_status" ON "BranchAvailabilitySettings" ("status") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_branch_availability_settings_branch_unique" ON "BranchAvailabilitySettings" ("branch_id") WHERE "deleted_at" IS NULL`);
        await queryRunner.query(`CREATE TABLE "BranchMaintenances" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "maintenance_date" date NOT NULL, "time_from" TIME NOT NULL, "time_to" TIME NOT NULL, "reason" character varying(500) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "branch_id" uuid, CONSTRAINT "PK_860f97b63f62825322ef4f841db" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_branch_maintenances_time_range" ON "BranchMaintenances" ("time_from", "time_to") `);
        await queryRunner.query(`CREATE INDEX "IDX_branch_maintenances_branch_date" ON "BranchMaintenances" ("branch_id", "maintenance_date") `);
        await queryRunner.query(`CREATE TABLE "TrainerAvailabilities" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" character varying(20) NOT NULL DEFAULT 'available', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "trainer_id" uuid, CONSTRAINT "PK_f4ec0833bb7180c5768b0491a0c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_trainer_availabilities_status" ON "TrainerAvailabilities" ("status") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_trainer_availabilities_trainer_unique" ON "TrainerAvailabilities" ("trainer_id") WHERE "deleted_at" IS NULL`);
        await queryRunner.query(`CREATE TABLE "TrainerMaintenances" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "maintenance_date" date NOT NULL, "time_from" TIME NOT NULL, "time_to" TIME NOT NULL, "reason" character varying(500) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "trainer_id" uuid, CONSTRAINT "PK_3b14d826b95c5d16214ab2ce949" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_trainer_maintenances_time_range" ON "TrainerMaintenances" ("time_from", "time_to") `);
        await queryRunner.query(`CREATE INDEX "IDX_trainer_maintenances_trainer_date" ON "TrainerMaintenances" ("trainer_id", "maintenance_date") `);
        await queryRunner.query(`ALTER TABLE "BranchAvailabilitySettings" ADD CONSTRAINT "FK_b3e429a10db700ec2225ea97662" FOREIGN KEY ("branch_id") REFERENCES "Branches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "BranchMaintenances" ADD CONSTRAINT "FK_e4cc108160938e332bde2dbcd39" FOREIGN KEY ("branch_id") REFERENCES "Branches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "TrainerAvailabilities" ADD CONSTRAINT "FK_9d2d897f7d408c01d328e737a17" FOREIGN KEY ("trainer_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "TrainerMaintenances" ADD CONSTRAINT "FK_11113642b4368ace6c6041941e3" FOREIGN KEY ("trainer_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "TrainerMaintenances" DROP CONSTRAINT "FK_11113642b4368ace6c6041941e3"`);
        await queryRunner.query(`ALTER TABLE "TrainerAvailabilities" DROP CONSTRAINT "FK_9d2d897f7d408c01d328e737a17"`);
        await queryRunner.query(`ALTER TABLE "BranchMaintenances" DROP CONSTRAINT "FK_e4cc108160938e332bde2dbcd39"`);
        await queryRunner.query(`ALTER TABLE "BranchAvailabilitySettings" DROP CONSTRAINT "FK_b3e429a10db700ec2225ea97662"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_trainer_maintenances_trainer_date"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_trainer_maintenances_time_range"`);
        await queryRunner.query(`DROP TABLE "TrainerMaintenances"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_trainer_availabilities_trainer_unique"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_trainer_availabilities_status"`);
        await queryRunner.query(`DROP TABLE "TrainerAvailabilities"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_branch_maintenances_branch_date"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_branch_maintenances_time_range"`);
        await queryRunner.query(`DROP TABLE "BranchMaintenances"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_branch_availability_settings_branch_unique"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_branch_availability_settings_status"`);
        await queryRunner.query(`DROP TABLE "BranchAvailabilitySettings"`);
    }

}
