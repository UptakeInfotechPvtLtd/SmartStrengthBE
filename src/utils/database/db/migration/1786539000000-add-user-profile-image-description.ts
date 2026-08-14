import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserProfileImageDescription1786539000000 implements MigrationInterface {
    name = 'AddUserProfileImageDescription1786539000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "Users" ADD "profile_image_url" character varying(500)`,
        );
        await queryRunner.query(`ALTER TABLE "Users" ADD "description" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Users" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "Users" DROP COLUMN "profile_image_url"`);
    }
}
