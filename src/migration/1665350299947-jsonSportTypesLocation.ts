import {MigrationInterface, QueryRunner} from "typeorm";

export class jsonSportTypesLocation1665350299947 implements MigrationInterface {
    name = 'jsonSportTypesLocation1665350299947'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `locations` DROP COLUMN `isFootball`");
        await queryRunner.query("ALTER TABLE `locations` ADD `isFootball` json NULL");
        await queryRunner.query("ALTER TABLE `locations` DROP COLUMN `isBasketball`");
        await queryRunner.query("ALTER TABLE `locations` ADD `isBasketball` json NULL");
        await queryRunner.query("ALTER TABLE `locations` DROP COLUMN `isTennis`");
        await queryRunner.query("ALTER TABLE `locations` ADD `isTennis` json NULL");
        await queryRunner.query("ALTER TABLE `locations` DROP COLUMN `isVolleyball`");
        await queryRunner.query("ALTER TABLE `locations` ADD `isVolleyball` json NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `locations` DROP COLUMN `isVolleyball`");
        await queryRunner.query("ALTER TABLE `locations` ADD `isVolleyball` tinyint NULL");
        await queryRunner.query("ALTER TABLE `locations` DROP COLUMN `isTennis`");
        await queryRunner.query("ALTER TABLE `locations` ADD `isTennis` tinyint NULL");
        await queryRunner.query("ALTER TABLE `locations` DROP COLUMN `isBasketball`");
        await queryRunner.query("ALTER TABLE `locations` ADD `isBasketball` tinyint NULL");
        await queryRunner.query("ALTER TABLE `locations` DROP COLUMN `isFootball`");
        await queryRunner.query("ALTER TABLE `locations` ADD `isFootball` tinyint NULL");
    }

}
