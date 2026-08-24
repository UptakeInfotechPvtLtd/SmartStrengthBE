import { MigrationInterface, QueryRunner } from "typeorm";

export class VideoLibraryEntityChangesTables1787559973939 implements MigrationInterface {
    name = 'VideoLibraryEntityChangesTables1787559973939'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_video_library_exercise_name"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_video_library_muscle_group"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_video_library_difficulty"`);
        await queryRunner.query(`ALTER TABLE "VideoLibrary" DROP COLUMN "members_only"`);
        await queryRunner.query(`ALTER TABLE "VideoLibrary" DROP COLUMN "target_muscle"`);
        await queryRunner.query(`ALTER TABLE "VideoLibrary" DROP COLUMN "difficulty"`);
        await queryRunner.query(`ALTER TABLE "VideoLibrary" DROP COLUMN "muscle_group"`);
        await queryRunner.query(`ALTER TABLE "VideoLibrary" DROP COLUMN "exercise_name"`);
        await queryRunner.query(`ALTER TABLE "VideoLibrary" ADD "title" character varying(150) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "VideoLibrary" ADD "target_muscle_group" character varying(150) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "VideoLibrary" ADD "description" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "VideoLibrary" ADD "guidline" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "VideoLibrary" ADD "active_member_only" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "VideoLibrary" ALTER COLUMN "status" SET DEFAULT 'active'`);
        await queryRunner.query(`CREATE INDEX "IDX_video_library_target_muscle_group" ON "VideoLibrary" ("target_muscle_group") `);
        await queryRunner.query(`CREATE INDEX "IDX_video_library_title" ON "VideoLibrary" ("title") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_video_library_title"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_video_library_target_muscle_group"`);
        await queryRunner.query(`ALTER TABLE "VideoLibrary" ALTER COLUMN "status" SET DEFAULT 'draft'`);
        await queryRunner.query(`ALTER TABLE "VideoLibrary" DROP COLUMN "active_member_only"`);
        await queryRunner.query(`ALTER TABLE "VideoLibrary" DROP COLUMN "guidline"`);
        await queryRunner.query(`ALTER TABLE "VideoLibrary" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "VideoLibrary" DROP COLUMN "target_muscle_group"`);
        await queryRunner.query(`ALTER TABLE "VideoLibrary" DROP COLUMN "title"`);
        await queryRunner.query(`ALTER TABLE "VideoLibrary" ADD "exercise_name" character varying(150) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "VideoLibrary" ADD "muscle_group" character varying(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "VideoLibrary" ADD "difficulty" character varying(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "VideoLibrary" ADD "target_muscle" jsonb NOT NULL DEFAULT '[]'`);
        await queryRunner.query(`ALTER TABLE "VideoLibrary" ADD "members_only" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`CREATE INDEX "IDX_video_library_difficulty" ON "VideoLibrary" ("difficulty") `);
        await queryRunner.query(`CREATE INDEX "IDX_video_library_muscle_group" ON "VideoLibrary" ("muscle_group") `);
        await queryRunner.query(`CREATE INDEX "IDX_video_library_exercise_name" ON "VideoLibrary" ("exercise_name") `);
    }

}
