import {MigrationInterface, QueryRunner} from "typeorm";

export class addDeletedAtCommonColumn1662624249015 implements MigrationInterface {
    name = 'addDeletedAtCommonColumn1662624249015'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `attachments` ADD `ts_deleted` datetime(6) NULL");
        await queryRunner.query("ALTER TABLE `complexes` ADD `ts_deleted` datetime(6) NULL");
        await queryRunner.query("ALTER TABLE `locations` ADD `ts_deleted` datetime(6) NULL");
        await queryRunner.query("ALTER TABLE `teams_users` ADD `ts_deleted` datetime(6) NULL");
        await queryRunner.query("ALTER TABLE `teams` ADD `ts_deleted` datetime(6) NULL");
        await queryRunner.query("ALTER TABLE `events` ADD `ts_deleted` datetime(6) NULL");
        await queryRunner.query("ALTER TABLE `notifications` ADD `ts_deleted` datetime(6) NULL");
        await queryRunner.query("ALTER TABLE `reviews` ADD `ts_deleted` datetime(6) NULL");
        await queryRunner.query("ALTER TABLE `users` ADD `ts_deleted` datetime(6) NULL");
        await queryRunner.query("ALTER TABLE `codes` ADD `ts_deleted` datetime(6) NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `codes` DROP COLUMN `ts_deleted`");
        await queryRunner.query("ALTER TABLE `users` DROP COLUMN `ts_deleted`");
        await queryRunner.query("ALTER TABLE `reviews` DROP COLUMN `ts_deleted`");
        await queryRunner.query("ALTER TABLE `notifications` DROP COLUMN `ts_deleted`");
        await queryRunner.query("ALTER TABLE `events` DROP COLUMN `ts_deleted`");
        await queryRunner.query("ALTER TABLE `teams` DROP COLUMN `ts_deleted`");
        await queryRunner.query("ALTER TABLE `teams_users` DROP COLUMN `ts_deleted`");
        await queryRunner.query("ALTER TABLE `locations` DROP COLUMN `ts_deleted`");
        await queryRunner.query("ALTER TABLE `complexes` DROP COLUMN `ts_deleted`");
        await queryRunner.query("ALTER TABLE `attachments` DROP COLUMN `ts_deleted`");
    }

}
