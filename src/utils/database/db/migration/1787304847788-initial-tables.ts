import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialTables1787304847788 implements MigrationInterface {
    name = 'InitialTables1787304847788';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "BlackListTokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "token" text NOT NULL, "user_id" uuid, CONSTRAINT "PK_0290b2eb4184607b262280ff089" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "Sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "session_name" character varying(150) NOT NULL, "price" numeric(10,2) NOT NULL, "duration" integer NOT NULL, "description" text, "status" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_0ff5532d98863bc618809d2d401" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_sessions_created_at" ON "Sessions" ("created_at") `,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_sessions_deleted_at" ON "Sessions" ("deleted_at") `,
        );
        await queryRunner.query(`CREATE INDEX "IDX_sessions_status" ON "Sessions" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_sessions_name" ON "Sessions" ("session_name") `);
        await queryRunner.query(
            `CREATE TABLE "SessionBranches" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "session_id" uuid, "branch_id" uuid, CONSTRAINT "PK_48258d27b52e4cf978382b678c3" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE UNIQUE INDEX "IDX_session_branches_session_branch_unique" ON "SessionBranches" ("session_id", "branch_id") `,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_session_branches_branch_id" ON "SessionBranches" ("branch_id") `,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_session_branches_session_id" ON "SessionBranches" ("session_id") `,
        );
        await queryRunner.query(
            `CREATE TABLE "Branches" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(150) NOT NULL, "contact_number" character varying(20), "map_link" text, "address" text, "opening_time" TIME, "closing_time" TIME, "branch_images" jsonb DEFAULT '[]', "status" character varying(30) NOT NULL DEFAULT 'Active', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_239def2db2f16e60df4a159b05b" PRIMARY KEY ("id"))`,
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
            `CREATE TABLE "UserPerformanceMetrics" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "metric_date" date NOT NULL, "metrics" jsonb NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, CONSTRAINT "PK_847e15ce07ea7b91effcbde098f" PRIMARY KEY ("id"))`,
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
            `CREATE TABLE "Users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "full_name" character varying(200), "email" character varying(255), "password" character varying(400), "age" integer, "dob" date, "gender" character varying(10), "phone_no" character varying(20), "user_type" character varying(20), "profile_image_url" character varying(500), "description" text, "experience_in_years" numeric(5,2), "is_terms_agreed" boolean NOT NULL DEFAULT false, "signup_otp" character varying(10), "signup_otp_expires_at" TIMESTAMP, "signup_otp_resend_attempts" integer NOT NULL DEFAULT '0', "signup_otp_locked_until" TIMESTAMP, "is_email_verified" boolean NOT NULL DEFAULT false, "status" character varying(10) NOT NULL DEFAULT 'active', "forgot_password_otp" character varying(10), "forgot_password_otp_expires_at" TIMESTAMP, "forgot_password_otp_attempts" integer NOT NULL DEFAULT '0', "forgot_password_otp_locked_until" TIMESTAMP, "is_forgot_password_otp_verified" boolean NOT NULL DEFAULT false, "forgot_password_otp_verified_until" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "role_id" uuid, CONSTRAINT "PK_16d4f7d636df336db11d87413e3" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(`CREATE INDEX "IDX_users_created_at" ON "Users" ("created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_users_phone_no" ON "Users" ("phone_no") `);
        await queryRunner.query(`CREATE INDEX "IDX_users_full_name" ON "Users" ("full_name") `);
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
            `CREATE TABLE "Packages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "package_name" character varying(150) NOT NULL, "price" numeric(10,2) NOT NULL, "number_of_sessions" integer NOT NULL, "validity_in_days" integer NOT NULL, "best_for" character varying(255) NOT NULL, "description" text, "status" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_2c81b9c345c28dbba72e54bfc0b" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_packages_created_at" ON "Packages" ("created_at") `,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_packages_deleted_at" ON "Packages" ("deleted_at") `,
        );
        await queryRunner.query(`CREATE INDEX "IDX_packages_status" ON "Packages" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_packages_name" ON "Packages" ("package_name") `);
        await queryRunner.query(
            `CREATE UNIQUE INDEX "IDX_packages_name_active_unique" ON "Packages" ("package_name") WHERE "deleted_at" IS NULL`,
        );
        await queryRunner.query(
            `CREATE TABLE "VideoLibrary" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "exercise_name" character varying(150) NOT NULL, "video_url" text NOT NULL, "muscle_group" character varying(50) NOT NULL, "difficulty" character varying(50) NOT NULL, "video_source" character varying(50) NOT NULL, "target_muscle" jsonb NOT NULL DEFAULT '[]', "status" character varying(20) NOT NULL DEFAULT 'draft', "members_only" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_350e9fd1d546d72cad2874fd8b0" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_video_library_created_at" ON "VideoLibrary" ("created_at") `,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_video_library_deleted_at" ON "VideoLibrary" ("deleted_at") `,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_video_library_status" ON "VideoLibrary" ("status") `,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_video_library_difficulty" ON "VideoLibrary" ("difficulty") `,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_video_library_muscle_group" ON "VideoLibrary" ("muscle_group") `,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_video_library_exercise_name" ON "VideoLibrary" ("exercise_name") `,
        );
        await queryRunner.query(
            `CREATE TABLE "AccessControls" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "permission" character varying(20) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "module_id" uuid, "role_id" uuid, "user_id" uuid, CONSTRAINT "PK_dcbb1e9be8b814e8a6faf304ce8" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE UNIQUE INDEX "IDX_access_controls_unique_user" ON "AccessControls" ("module_id", "user_id", "permission") WHERE "role_id" IS NULL AND "deleted_at" IS NULL`,
        );
        await queryRunner.query(
            `CREATE UNIQUE INDEX "IDX_access_controls_unique_role" ON "AccessControls" ("module_id", "role_id", "permission") WHERE "user_id" IS NULL AND "deleted_at" IS NULL`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_access_controls_permission" ON "AccessControls" ("permission") `,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_access_controls_user_id" ON "AccessControls" ("user_id") `,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_access_controls_role_id" ON "AccessControls" ("role_id") `,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_access_controls_module_id" ON "AccessControls" ("module_id") `,
        );
        await queryRunner.query(
            `CREATE TABLE "AccessModules" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "key" character varying(100) NOT NULL, "name" character varying(150) NOT NULL, "sort_order" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_0e7c0caa11b2cb5db8be340327b" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_access_modules_sort_order" ON "AccessModules" ("sort_order") `,
        );
        await queryRunner.query(
            `CREATE UNIQUE INDEX "IDX_access_modules_key_unique" ON "AccessModules" ("key") WHERE "deleted_at" IS NULL`,
        );
        await queryRunner.query(
            `ALTER TABLE "BlackListTokens" ADD CONSTRAINT "FK_cdc1a37ed0c7c822197d00589c2" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "SessionBranches" ADD CONSTRAINT "FK_95aaae8ae2244cdfb6c2929b60f" FOREIGN KEY ("session_id") REFERENCES "Sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "SessionBranches" ADD CONSTRAINT "FK_f5bf559a632c160ed57392bf702" FOREIGN KEY ("branch_id") REFERENCES "Branches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "UserBranches" ADD CONSTRAINT "FK_90e31feeea7df9f559f081aa559" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "UserBranches" ADD CONSTRAINT "FK_642af956079ca1674c4dc678a44" FOREIGN KEY ("branch_id") REFERENCES "Branches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "UserPerformanceMetrics" ADD CONSTRAINT "FK_93d8b62bbfcd167486516157776" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "Users" ADD CONSTRAINT "FK_3bad667ed90ba9cb4c834118416" FOREIGN KEY ("role_id") REFERENCES "Roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "AccessControls" ADD CONSTRAINT "FK_02d445e5fec50b38a0e02ff03b9" FOREIGN KEY ("module_id") REFERENCES "AccessModules"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "AccessControls" ADD CONSTRAINT "FK_650364995d84f9f833af4cba16e" FOREIGN KEY ("role_id") REFERENCES "Roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "AccessControls" ADD CONSTRAINT "FK_d23c134292b2058fd80cf73deae" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "AccessControls" DROP CONSTRAINT "FK_d23c134292b2058fd80cf73deae"`,
        );
        await queryRunner.query(
            `ALTER TABLE "AccessControls" DROP CONSTRAINT "FK_650364995d84f9f833af4cba16e"`,
        );
        await queryRunner.query(
            `ALTER TABLE "AccessControls" DROP CONSTRAINT "FK_02d445e5fec50b38a0e02ff03b9"`,
        );
        await queryRunner.query(
            `ALTER TABLE "Users" DROP CONSTRAINT "FK_3bad667ed90ba9cb4c834118416"`,
        );
        await queryRunner.query(
            `ALTER TABLE "UserPerformanceMetrics" DROP CONSTRAINT "FK_93d8b62bbfcd167486516157776"`,
        );
        await queryRunner.query(
            `ALTER TABLE "UserBranches" DROP CONSTRAINT "FK_642af956079ca1674c4dc678a44"`,
        );
        await queryRunner.query(
            `ALTER TABLE "UserBranches" DROP CONSTRAINT "FK_90e31feeea7df9f559f081aa559"`,
        );
        await queryRunner.query(
            `ALTER TABLE "SessionBranches" DROP CONSTRAINT "FK_f5bf559a632c160ed57392bf702"`,
        );
        await queryRunner.query(
            `ALTER TABLE "SessionBranches" DROP CONSTRAINT "FK_95aaae8ae2244cdfb6c2929b60f"`,
        );
        await queryRunner.query(
            `ALTER TABLE "BlackListTokens" DROP CONSTRAINT "FK_cdc1a37ed0c7c822197d00589c2"`,
        );
        await queryRunner.query(`DROP INDEX "public"."IDX_access_modules_key_unique"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_access_modules_sort_order"`);
        await queryRunner.query(`DROP TABLE "AccessModules"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_access_controls_module_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_access_controls_role_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_access_controls_user_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_access_controls_permission"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_access_controls_unique_role"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_access_controls_unique_user"`);
        await queryRunner.query(`DROP TABLE "AccessControls"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_video_library_exercise_name"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_video_library_muscle_group"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_video_library_difficulty"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_video_library_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_video_library_deleted_at"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_video_library_created_at"`);
        await queryRunner.query(`DROP TABLE "VideoLibrary"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_packages_name_active_unique"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_packages_name"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_packages_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_packages_deleted_at"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_packages_created_at"`);
        await queryRunner.query(`DROP TABLE "Packages"`);
        await queryRunner.query(`DROP TABLE "Roles"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_users_email_active_unique"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_users_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_users_deleted_at"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_users_role"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_users_full_name"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_users_phone_no"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_users_created_at"`);
        await queryRunner.query(`DROP TABLE "Users"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_user_performance_metrics_user_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_user_performance_metrics_metric_date"`);
        await queryRunner.query(
            `DROP INDEX "public"."IDX_user_performance_metrics_user_date_unique"`,
        );
        await queryRunner.query(`DROP TABLE "UserPerformanceMetrics"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_user_branches_user_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_user_branches_branch_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_user_branches_user_branch_unique"`);
        await queryRunner.query(`DROP TABLE "UserBranches"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_branches_name"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_branches_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_branches_deleted_at"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_branches_created_at"`);
        await queryRunner.query(`DROP TABLE "Branches"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_session_branches_session_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_session_branches_branch_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_session_branches_session_branch_unique"`);
        await queryRunner.query(`DROP TABLE "SessionBranches"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_sessions_name"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_sessions_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_sessions_deleted_at"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_sessions_created_at"`);
        await queryRunner.query(`DROP TABLE "Sessions"`);
        await queryRunner.query(`DROP TABLE "BlackListTokens"`);
    }
}
