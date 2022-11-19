import {MigrationInterface, QueryRunner} from "typeorm";

export class notesInEvents1666186652462 implements MigrationInterface {
    name = 'notesInEvents1666186652462'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `events` ADD `notes` text NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `events` DROP COLUMN `notes`");
    }

}
