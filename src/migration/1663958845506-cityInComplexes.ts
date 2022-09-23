import {MigrationInterface, QueryRunner} from "typeorm";

export class cityInComplexes1663958845506 implements MigrationInterface {
    name = 'cityInComplexes1663958845506'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `attachments` DROP COLUMN `is_banner`");
        await queryRunner.query("ALTER TABLE `attachments` DROP COLUMN `business_id`");
        await queryRunner.query("ALTER TABLE `complexes` ADD `city` varchar(255) NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `complexes` DROP COLUMN `city`");
        await queryRunner.query("ALTER TABLE `attachments` ADD `business_id` int NOT NULL");
        await queryRunner.query("ALTER TABLE `attachments` ADD `is_banner` tinyint(1) NULL DEFAULT '0'");
    }

}
