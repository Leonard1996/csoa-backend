import {MigrationInterface, QueryRunner} from "typeorm";

export class EditLocation1667660894488 implements MigrationInterface {
    name = 'EditLocation1667660894488'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `locations` ADD `slotRange` int NULL");
        await queryRunner.query("ALTER TABLE `locations` DROP COLUMN `isFootball`");
        await queryRunner.query("ALTER TABLE `locations` ADD `isFootball` tinyint NULL");
        await queryRunner.query("ALTER TABLE `locations` DROP COLUMN `isBasketball`");
        await queryRunner.query("ALTER TABLE `locations` ADD `isBasketball` tinyint NULL");
        await queryRunner.query("ALTER TABLE `locations` DROP COLUMN `isTennis`");
        await queryRunner.query("ALTER TABLE `locations` ADD `isTennis` tinyint NULL");
        await queryRunner.query("ALTER TABLE `locations` DROP COLUMN `isVolleyball`");
        await queryRunner.query("ALTER TABLE `locations` ADD `isVolleyball` tinyint NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `locations` DROP COLUMN `isVolleyball`");
        await queryRunner.query("ALTER TABLE `locations` ADD `isVolleyball` json NULL");
        await queryRunner.query("ALTER TABLE `locations` DROP COLUMN `isTennis`");
        await queryRunner.query("ALTER TABLE `locations` ADD `isTennis` json NULL");
        await queryRunner.query("ALTER TABLE `locations` DROP COLUMN `isBasketball`");
        await queryRunner.query("ALTER TABLE `locations` ADD `isBasketball` json NULL");
        await queryRunner.query("ALTER TABLE `locations` DROP COLUMN `isFootball`");
        await queryRunner.query("ALTER TABLE `locations` ADD `isFootball` json NULL");
        await queryRunner.query("ALTER TABLE `locations` DROP COLUMN `slotRange`");
    }

}
