import {MigrationInterface, QueryRunner} from "typeorm";

export class addNotificationType1665416951374 implements MigrationInterface {
    name = 'addNotificationType1665416951374'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `notifications` ADD `type` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `notifications` CHANGE `isRead` `isRead` tinyint NULL DEFAULT 0");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `notifications` CHANGE `isRead` `isRead` tinyint NULL");
        await queryRunner.query("ALTER TABLE `notifications` DROP COLUMN `type`");
    }

}
