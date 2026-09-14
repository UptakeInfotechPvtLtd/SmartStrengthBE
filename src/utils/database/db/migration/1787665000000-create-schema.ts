import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSchema1787665000000 implements MigrationInterface {
    name = 'CreateSchema1787665000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

        await queryRunner.query(
            `CREATE TABLE "Roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "description" text, CONSTRAINT "UQ_roles_name" UNIQUE ("name"), CONSTRAINT "PK_roles_id" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "AccessModules" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "key" character varying(100) NOT NULL, "name" character varying(150) NOT NULL, "sort_order" integer NOT NULL DEFAULT 0, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_access_modules_id" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "Branches" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "branch_name" character varying(150) NOT NULL, "map_url" text, "address" text, "opening_time" TIME, "closing_time" TIME, "status" character varying(30) NOT NULL DEFAULT 'Active', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_branches_id" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "Sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "session_name" character varying(150) NOT NULL, "price" numeric(10,2) NOT NULL, "description" text, "status" boolean NOT NULL DEFAULT true, "is_sachin_status" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_sessions_id" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "Packages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "package_type" character varying(50) NOT NULL, "price" numeric(10,2) NOT NULL, "number_of_sessions" integer NOT NULL, "valid_days" integer NOT NULL, "status" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_packages_id" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "VideoLibrary" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(150) NOT NULL, "video_source" character varying(50) NOT NULL, "video_url" text NOT NULL, "target_muscle_group" character varying(150) NOT NULL, "description" text NOT NULL, "guidline" text NOT NULL, "status" character varying(20) NOT NULL DEFAULT 'active', "active_member_only" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_video_library_id" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "Users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "full_name" character varying(200), "email" character varying(255), "password" character varying(400), "age" integer, "dob" date, "gender" character varying(10), "phone_no" character varying(20), "user_type" character varying(20), "profile_image_url" character varying(500), "description" text, "experience_in_years" numeric(5,2), "is_terms_agreed" boolean NOT NULL DEFAULT false, "signup_otp" character varying(10), "signup_otp_expires_at" TIMESTAMP, "signup_otp_resend_attempts" integer NOT NULL DEFAULT 0, "signup_otp_locked_until" TIMESTAMP, "is_email_verified" boolean NOT NULL DEFAULT false, "status" character varying(10) NOT NULL DEFAULT 'active', "forgot_password_otp" character varying(10), "forgot_password_otp_expires_at" TIMESTAMP, "forgot_password_otp_attempts" integer NOT NULL DEFAULT 0, "forgot_password_otp_locked_until" TIMESTAMP, "is_forgot_password_otp_verified" boolean NOT NULL DEFAULT false, "forgot_password_otp_verified_until" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "role_id" uuid, CONSTRAINT "PK_users_id" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "BlackListTokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "token" text NOT NULL, "user_id" uuid, CONSTRAINT "PK_black_list_tokens_id" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "SessionBranches" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "session_id" uuid, "branch_id" uuid, CONSTRAINT "PK_session_branches_id" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "UserBranches" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, "branch_id" uuid, CONSTRAINT "PK_user_branches_id" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "UserPerformanceMetrics" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "metric_date" date NOT NULL, "metrics" jsonb NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, CONSTRAINT "PK_user_performance_metrics_id" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "BranchAvailabilitySettings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" character varying(20) NOT NULL DEFAULT 'open', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "branch_id" uuid, CONSTRAINT "PK_branch_availability_settings_id" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "BranchMaintenances" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "maintenance_date" date NOT NULL, "time_from" TIME NOT NULL, "time_to" TIME NOT NULL, "reason" character varying(500) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "branch_id" uuid, CONSTRAINT "PK_branch_maintenances_id" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "TrainerAvailabilities" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" character varying(20) NOT NULL DEFAULT 'available', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "trainer_id" uuid, CONSTRAINT "PK_trainer_availabilities_id" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "TrainerMaintenances" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "maintenance_date" date NOT NULL, "time_from" TIME NOT NULL, "time_to" TIME NOT NULL, "reason" character varying(500) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "trainer_id" uuid, CONSTRAINT "PK_trainer_maintenances_id" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "TrainerRosters" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "day_of_week" character varying(20) NOT NULL, "start_time" TIME NOT NULL, "end_time" TIME NOT NULL, "status" character varying(20) NOT NULL DEFAULT 'working', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "branch_id" uuid, "trainer_id" uuid, CONSTRAINT "PK_trainer_rosters_id" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "Enquiries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "enquiry_type" character varying(80) NOT NULL, "full_name" character varying(150) NOT NULL, "email" character varying(255) NOT NULL, "mobile_number" character varying(20) NOT NULL, "branch_id" uuid NOT NULL, "details" jsonb NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_enquiries_id" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "UserPackages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "package_id" uuid NOT NULL, "package_type" character varying(50) NOT NULL, "price" numeric(10,2) NOT NULL, "number_of_sessions" integer NOT NULL, "remaining_sessions" integer NOT NULL, "valid_days" integer NOT NULL, "purchased_at" TIMESTAMP NOT NULL, "expired_at" TIMESTAMP NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_user_packages_id" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "Bookings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "session_id" uuid NOT NULL, "branch_id" uuid NOT NULL, "trainer_id" uuid NOT NULL, "user_package_id" uuid, "booking_date" date NOT NULL, "start_time" TIME NOT NULL, "end_time" TIME NOT NULL, "status" character varying(20) NOT NULL DEFAULT 'confirmed', "is_direct_booking" boolean NOT NULL DEFAULT false, "cancelled_at" TIMESTAMP, "rescheduled_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_bookings_id" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "Testimonials" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "rating_count" integer NOT NULL, "experience" text, "status" character varying(20) NOT NULL DEFAULT 'Pending', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_testimonials_id" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "AccessControls" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "permission" character varying(20) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "module_id" uuid, "role_id" uuid, "user_id" uuid, CONSTRAINT "PK_access_controls_id" PRIMARY KEY ("id"))`,
        );

        await queryRunner.query(
            `CREATE INDEX "IDX_access_modules_sort_order" ON "AccessModules" ("sort_order")`,
        );
        await queryRunner.query(
            `CREATE UNIQUE INDEX "IDX_access_modules_key_unique" ON "AccessModules" ("key") WHERE "deleted_at" IS NULL`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_branches_branch_name" ON "Branches" ("branch_name")`,
        );
        await queryRunner.query(`CREATE INDEX "IDX_branches_status" ON "Branches" ("status")`);
        await queryRunner.query(
            `CREATE INDEX "IDX_branches_deleted_at" ON "Branches" ("deleted_at")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_branches_created_at" ON "Branches" ("created_at")`,
        );
        await queryRunner.query(`CREATE INDEX "IDX_sessions_name" ON "Sessions" ("session_name")`);
        await queryRunner.query(`CREATE INDEX "IDX_sessions_status" ON "Sessions" ("status")`);
        await queryRunner.query(
            `CREATE INDEX "IDX_sessions_is_sachin_status" ON "Sessions" ("is_sachin_status")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_sessions_deleted_at" ON "Sessions" ("deleted_at")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_sessions_created_at" ON "Sessions" ("created_at")`,
        );
        await queryRunner.query(`CREATE INDEX "IDX_packages_type" ON "Packages" ("package_type")`);
        await queryRunner.query(`CREATE INDEX "IDX_packages_status" ON "Packages" ("status")`);
        await queryRunner.query(
            `CREATE INDEX "IDX_packages_deleted_at" ON "Packages" ("deleted_at")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_packages_created_at" ON "Packages" ("created_at")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_video_library_title" ON "VideoLibrary" ("title")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_video_library_target_muscle_group" ON "VideoLibrary" ("target_muscle_group")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_video_library_status" ON "VideoLibrary" ("status")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_video_library_deleted_at" ON "VideoLibrary" ("deleted_at")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_video_library_created_at" ON "VideoLibrary" ("created_at")`,
        );
        await queryRunner.query(
            `CREATE UNIQUE INDEX "IDX_users_email_active_unique" ON "Users" ("email") WHERE "deleted_at" IS NULL`,
        );
        await queryRunner.query(`CREATE INDEX "IDX_users_status" ON "Users" ("status")`);
        await queryRunner.query(`CREATE INDEX "IDX_users_deleted_at" ON "Users" ("deleted_at")`);
        await queryRunner.query(`CREATE INDEX "IDX_users_role" ON "Users" ("role_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_users_full_name" ON "Users" ("full_name")`);
        await queryRunner.query(`CREATE INDEX "IDX_users_phone_no" ON "Users" ("phone_no")`);
        await queryRunner.query(`CREATE INDEX "IDX_users_created_at" ON "Users" ("created_at")`);
        await queryRunner.query(
            `CREATE INDEX "IDX_session_branches_session_id" ON "SessionBranches" ("session_id")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_session_branches_branch_id" ON "SessionBranches" ("branch_id")`,
        );
        await queryRunner.query(
            `CREATE UNIQUE INDEX "IDX_session_branches_session_branch_unique" ON "SessionBranches" ("session_id", "branch_id")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_user_branches_user_id" ON "UserBranches" ("user_id")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_user_branches_branch_id" ON "UserBranches" ("branch_id")`,
        );
        await queryRunner.query(
            `CREATE UNIQUE INDEX "IDX_user_branches_user_branch_unique" ON "UserBranches" ("user_id", "branch_id")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_user_performance_metrics_user_id" ON "UserPerformanceMetrics" ("user_id")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_user_performance_metrics_metric_date" ON "UserPerformanceMetrics" ("metric_date")`,
        );
        await queryRunner.query(
            `CREATE UNIQUE INDEX "IDX_branch_availability_settings_branch_unique" ON "BranchAvailabilitySettings" ("branch_id") WHERE "deleted_at" IS NULL`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_branch_availability_settings_status" ON "BranchAvailabilitySettings" ("status")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_branch_maintenances_branch_date" ON "BranchMaintenances" ("branch_id", "maintenance_date")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_branch_maintenances_time_range" ON "BranchMaintenances" ("time_from", "time_to")`,
        );
        await queryRunner.query(
            `CREATE UNIQUE INDEX "IDX_trainer_availabilities_trainer_unique" ON "TrainerAvailabilities" ("trainer_id") WHERE "deleted_at" IS NULL`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_trainer_availabilities_status" ON "TrainerAvailabilities" ("status")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_trainer_maintenances_trainer_date" ON "TrainerMaintenances" ("trainer_id", "maintenance_date")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_trainer_maintenances_time_range" ON "TrainerMaintenances" ("time_from", "time_to")`,
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
        await queryRunner.query(`CREATE INDEX "IDX_enquiries_email" ON "Enquiries" ("email")`);
        await queryRunner.query(
            `CREATE INDEX "IDX_enquiries_type" ON "Enquiries" ("enquiry_type")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_enquiries_branch_id" ON "Enquiries" ("branch_id")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_enquiries_deleted_at" ON "Enquiries" ("deleted_at")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_enquiries_created_at" ON "Enquiries" ("created_at")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_user_packages_user_id" ON "UserPackages" ("user_id")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_user_packages_package_id" ON "UserPackages" ("package_id")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_user_packages_purchased_at" ON "UserPackages" ("purchased_at")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_user_packages_expired_at" ON "UserPackages" ("expired_at")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_user_packages_deleted_at" ON "UserPackages" ("deleted_at")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_user_packages_created_at" ON "UserPackages" ("created_at")`,
        );
        await queryRunner.query(`CREATE INDEX "IDX_bookings_user_id" ON "Bookings" ("user_id")`);
        await queryRunner.query(
            `CREATE INDEX "IDX_bookings_branch_id" ON "Bookings" ("branch_id")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_bookings_trainer_id" ON "Bookings" ("trainer_id")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_bookings_session_id" ON "Bookings" ("session_id")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_bookings_user_package_id" ON "Bookings" ("user_package_id")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_bookings_booking_date" ON "Bookings" ("booking_date")`,
        );
        await queryRunner.query(`CREATE INDEX "IDX_bookings_status" ON "Bookings" ("status")`);
        await queryRunner.query(
            `CREATE INDEX "IDX_bookings_time_range" ON "Bookings" ("start_time", "end_time")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_bookings_deleted_at" ON "Bookings" ("deleted_at")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_bookings_created_at" ON "Bookings" ("created_at")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_testimonials_user_id" ON "Testimonials" ("user_id")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_testimonials_status" ON "Testimonials" ("status")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_testimonials_deleted_at" ON "Testimonials" ("deleted_at")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_testimonials_created_at" ON "Testimonials" ("created_at")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_access_controls_module_id" ON "AccessControls" ("module_id")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_access_controls_role_id" ON "AccessControls" ("role_id")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_access_controls_user_id" ON "AccessControls" ("user_id")`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_access_controls_permission" ON "AccessControls" ("permission")`,
        );
        await queryRunner.query(
            `CREATE UNIQUE INDEX "IDX_access_controls_unique_role" ON "AccessControls" ("module_id", "role_id", "permission") WHERE "user_id" IS NULL AND "deleted_at" IS NULL`,
        );
        await queryRunner.query(
            `CREATE UNIQUE INDEX "IDX_access_controls_unique_user" ON "AccessControls" ("module_id", "user_id", "permission") WHERE "role_id" IS NULL AND "deleted_at" IS NULL`,
        );

        await queryRunner.query(
            `ALTER TABLE "Users" ADD CONSTRAINT "FK_users_role_id" FOREIGN KEY ("role_id") REFERENCES "Roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "BlackListTokens" ADD CONSTRAINT "FK_black_list_tokens_user_id" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "SessionBranches" ADD CONSTRAINT "FK_session_branches_session_id" FOREIGN KEY ("session_id") REFERENCES "Sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "SessionBranches" ADD CONSTRAINT "FK_session_branches_branch_id" FOREIGN KEY ("branch_id") REFERENCES "Branches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "UserBranches" ADD CONSTRAINT "FK_user_branches_user_id" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "UserBranches" ADD CONSTRAINT "FK_user_branches_branch_id" FOREIGN KEY ("branch_id") REFERENCES "Branches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "UserPerformanceMetrics" ADD CONSTRAINT "FK_user_performance_metrics_user_id" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "BranchAvailabilitySettings" ADD CONSTRAINT "FK_branch_availability_settings_branch_id" FOREIGN KEY ("branch_id") REFERENCES "Branches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "BranchMaintenances" ADD CONSTRAINT "FK_branch_maintenances_branch_id" FOREIGN KEY ("branch_id") REFERENCES "Branches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "TrainerAvailabilities" ADD CONSTRAINT "FK_trainer_availabilities_trainer_id" FOREIGN KEY ("trainer_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "TrainerMaintenances" ADD CONSTRAINT "FK_trainer_maintenances_trainer_id" FOREIGN KEY ("trainer_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "TrainerRosters" ADD CONSTRAINT "FK_trainer_rosters_branch_id" FOREIGN KEY ("branch_id") REFERENCES "Branches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "TrainerRosters" ADD CONSTRAINT "FK_trainer_rosters_trainer_id" FOREIGN KEY ("trainer_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "Enquiries" ADD CONSTRAINT "FK_enquiries_branch_id" FOREIGN KEY ("branch_id") REFERENCES "Branches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "UserPackages" ADD CONSTRAINT "FK_user_packages_user_id" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "UserPackages" ADD CONSTRAINT "FK_user_packages_package_id" FOREIGN KEY ("package_id") REFERENCES "Packages"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "Bookings" ADD CONSTRAINT "FK_bookings_user_id" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "Bookings" ADD CONSTRAINT "FK_bookings_session_id" FOREIGN KEY ("session_id") REFERENCES "Sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "Bookings" ADD CONSTRAINT "FK_bookings_branch_id" FOREIGN KEY ("branch_id") REFERENCES "Branches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "Bookings" ADD CONSTRAINT "FK_bookings_trainer_id" FOREIGN KEY ("trainer_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "Bookings" ADD CONSTRAINT "FK_bookings_user_package_id" FOREIGN KEY ("user_package_id") REFERENCES "UserPackages"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "Testimonials" ADD CONSTRAINT "FK_testimonials_user_id" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "AccessControls" ADD CONSTRAINT "FK_access_controls_module_id" FOREIGN KEY ("module_id") REFERENCES "AccessModules"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "AccessControls" ADD CONSTRAINT "FK_access_controls_role_id" FOREIGN KEY ("role_id") REFERENCES "Roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "AccessControls" ADD CONSTRAINT "FK_access_controls_user_id" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "AccessControls"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "Testimonials"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "Bookings"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "UserPackages"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "Enquiries"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "TrainerRosters"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "TrainerMaintenances"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "TrainerAvailabilities"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "BranchMaintenances"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "BranchAvailabilitySettings"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "UserPerformanceMetrics"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "UserBranches"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "SessionBranches"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "BlackListTokens"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "Users"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "VideoLibrary"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "Packages"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "Sessions"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "Branches"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "AccessModules"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "Roles"`);
    }
}
