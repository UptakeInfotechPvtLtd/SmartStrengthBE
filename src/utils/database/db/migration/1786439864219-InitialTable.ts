import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialTable1786439864219 implements MigrationInterface {
    name = 'InitialTable1786439864219';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "BlackListTokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "token" text NOT NULL, "user_id" uuid, CONSTRAINT "PK_0290b2eb4184607b262280ff089" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "Branches" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(150) NOT NULL, "contact_number" character varying(20), "map_link" text, "address" text, "opening_time" TIME, "closing_time" TIME, "branch_images" jsonb DEFAULT '[]', "status" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_239def2db2f16e60df4a159b05b" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_branches_created_at" ON "Branches" ("created_at") `,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_branches_deleted_at" ON "Branches" ("deleted_at") `,
        );
        await queryRunner.query(`CREATE INDEX "IDX_branches_status" ON "Branches" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_branches_name" ON "Branches" ("name") `);
        await queryRunner.query(
            `CREATE TABLE "UserBranches" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, "branch_id" uuid, CONSTRAINT "PK_c74e5b168b4493805ecb2f5f582" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE UNIQUE INDEX "IDX_user_branches_user_branch_unique" ON "UserBranches" ("user_id", "branch_id") `,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_user_branches_branch_id" ON "UserBranches" ("branch_id") `,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_user_branches_user_id" ON "UserBranches" ("user_id") `,
        );
        await queryRunner.query(
            `CREATE TABLE "Users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "full_name" character varying(200), "email" character varying(255) NOT NULL, "password" character varying(400), "age" integer, "gender" character varying(10), "phone_no" character varying(20), "user_type" character varying(20), "performance_metrics" jsonb, "is_terms_agreed" boolean NOT NULL DEFAULT false, "signup_otp" character varying(10), "signup_otp_expires_at" TIMESTAMP, "signup_otp_resend_attempts" integer NOT NULL DEFAULT '0', "signup_otp_locked_until" TIMESTAMP, "is_email_verified" boolean NOT NULL DEFAULT false, "status" boolean NOT NULL DEFAULT true, "forgot_password_otp" character varying(10), "forgot_password_otp_expires_at" TIMESTAMP, "forgot_password_otp_attempts" integer NOT NULL DEFAULT '0', "forgot_password_otp_locked_until" TIMESTAMP, "is_forgot_password_otp_verified" boolean NOT NULL DEFAULT false, "forgot_password_otp_verified_until" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "role_id" uuid, CONSTRAINT "PK_16d4f7d636df336db11d87413e3" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(`CREATE INDEX "IDX_users_role" ON "Users" ("role_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_users_deleted_at" ON "Users" ("deleted_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_users_status" ON "Users" ("status") `);
        await queryRunner.query(
            `CREATE UNIQUE INDEX "IDX_users_email_active_unique" ON "Users" ("email") WHERE "deleted_at" IS NULL`,
        );
        await queryRunner.query(
            `CREATE TABLE "Roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "description" text, CONSTRAINT "UQ_8eadedb8470c92966389ecc2165" UNIQUE ("name"), CONSTRAINT "PK_efba48c6a0c7a9b6260f771b165" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `ALTER TABLE "BlackListTokens" ADD CONSTRAINT "FK_cdc1a37ed0c7c822197d00589c2" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "UserBranches" ADD CONSTRAINT "FK_90e31feeea7df9f559f081aa559" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "UserBranches" ADD CONSTRAINT "FK_642af956079ca1674c4dc678a44" FOREIGN KEY ("branch_id") REFERENCES "Branches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "Users" ADD CONSTRAINT "FK_3bad667ed90ba9cb4c834118416" FOREIGN KEY ("role_id") REFERENCES "Roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "Users" DROP CONSTRAINT "FK_3bad667ed90ba9cb4c834118416"`,
        );
        await queryRunner.query(
            `ALTER TABLE "UserBranches" DROP CONSTRAINT "FK_642af956079ca1674c4dc678a44"`,
        );
        await queryRunner.query(
            `ALTER TABLE "UserBranches" DROP CONSTRAINT "FK_90e31feeea7df9f559f081aa559"`,
        );
        await queryRunner.query(
            `ALTER TABLE "BlackListTokens" DROP CONSTRAINT "FK_cdc1a37ed0c7c822197d00589c2"`,
        );
        await queryRunner.query(`DROP TABLE "Roles"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_users_email_active_unique"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_users_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_users_deleted_at"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_users_role"`);
        await queryRunner.query(`DROP TABLE "Users"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_user_branches_user_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_user_branches_branch_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_user_branches_user_branch_unique"`);
        await queryRunner.query(`DROP TABLE "UserBranches"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_branches_name"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_branches_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_branches_deleted_at"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_branches_created_at"`);
        await queryRunner.query(`DROP TABLE "Branches"`);
        await queryRunner.query(`DROP TABLE "BlackListTokens"`);
    }
}
