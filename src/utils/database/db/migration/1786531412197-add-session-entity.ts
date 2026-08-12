import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSessionEntity1786531412197 implements MigrationInterface {
    name = 'AddSessionEntity1786531412197';

    public async up(queryRunner: QueryRunner): Promise<void> {
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
        await queryRunner.query(`DROP INDEX "public"."IDX_branches_status"`);
        await queryRunner.query(`ALTER TABLE "Branches" DROP COLUMN "status"`);
        await queryRunner.query(
            `ALTER TABLE "Branches" ADD "status" character varying(30) NOT NULL DEFAULT 'Active'`,
        );
        await queryRunner.query(`CREATE INDEX "IDX_branches_status" ON "Branches" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_users_created_at" ON "Users" ("created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_users_phone_no" ON "Users" ("phone_no") `);
        await queryRunner.query(`CREATE INDEX "IDX_users_full_name" ON "Users" ("full_name") `);
        await queryRunner.query(
            `ALTER TABLE "SessionBranches" ADD CONSTRAINT "FK_95aaae8ae2244cdfb6c2929b60f" FOREIGN KEY ("session_id") REFERENCES "Sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "SessionBranches" ADD CONSTRAINT "FK_f5bf559a632c160ed57392bf702" FOREIGN KEY ("branch_id") REFERENCES "Branches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "SessionBranches" DROP CONSTRAINT "FK_f5bf559a632c160ed57392bf702"`,
        );
        await queryRunner.query(
            `ALTER TABLE "SessionBranches" DROP CONSTRAINT "FK_95aaae8ae2244cdfb6c2929b60f"`,
        );
        await queryRunner.query(`DROP INDEX "public"."IDX_users_full_name"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_users_phone_no"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_users_created_at"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_branches_status"`);
        await queryRunner.query(`ALTER TABLE "Branches" DROP COLUMN "status"`);
        await queryRunner.query(
            `ALTER TABLE "Branches" ADD "status" boolean NOT NULL DEFAULT true`,
        );
        await queryRunner.query(`CREATE INDEX "IDX_branches_status" ON "Branches" ("status") `);
        await queryRunner.query(`DROP INDEX "public"."IDX_session_branches_session_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_session_branches_branch_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_session_branches_session_branch_unique"`);
        await queryRunner.query(`DROP TABLE "SessionBranches"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_sessions_name"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_sessions_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_sessions_deleted_at"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_sessions_created_at"`);
        await queryRunner.query(`DROP TABLE "Sessions"`);
    }
}
