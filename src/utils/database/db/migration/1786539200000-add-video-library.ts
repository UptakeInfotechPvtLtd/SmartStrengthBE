import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVideoLibrary1786539200000 implements MigrationInterface {
    name = 'AddVideoLibrary1786539200000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "VideoLibrary" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "exercise_name" character varying(150) NOT NULL, "video_url" text NOT NULL, "muscle_group" character varying(50) NOT NULL, "difficulty" character varying(50) NOT NULL, "video_source" character varying(50) NOT NULL, "target_muscle" jsonb NOT NULL DEFAULT '[]', "status" character varying(20) NOT NULL DEFAULT 'draft', "members_only" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_3ca402b6e91ee4b5c29f7fdce77" PRIMARY KEY ("id"))`,
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
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_video_library_exercise_name"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_video_library_muscle_group"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_video_library_difficulty"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_video_library_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_video_library_deleted_at"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_video_library_created_at"`);
        await queryRunner.query(`DROP TABLE "VideoLibrary"`);
    }
}
