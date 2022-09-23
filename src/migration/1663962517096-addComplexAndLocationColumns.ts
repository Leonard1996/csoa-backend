import { MigrationInterface, QueryRunner } from "typeorm";

export class addComplexAndLocationColumns1663962517096
  implements MigrationInterface
{
  name = "addComplexAndLocationColumns1663962517096";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("ALTER TABLE `locations` DROP COLUMN `latitude`");
    await queryRunner.query("ALTER TABLE `locations` DROP COLUMN `longitude`");
    await queryRunner.query(
      "ALTER TABLE `locations` ADD `isFootball` tinyint NULL"
    );
    await queryRunner.query(
      "ALTER TABLE `locations` ADD `isBasketball` tinyint NULL"
    );
    await queryRunner.query(
      "ALTER TABLE `locations` ADD `isTennis` tinyint NULL"
    );
    await queryRunner.query(
      "ALTER TABLE `locations` ADD `isVolleyball` tinyint NULL"
    );
    await queryRunner.query("ALTER TABLE `complexes` ADD `sports` json NULL");
    await queryRunner.query(
      "ALTER TABLE `complexes` ADD `longitude` decimal NULL"
    );
    await queryRunner.query(
      "ALTER TABLE `complexes` ADD `latitude` decimal NULL"
    );
    await queryRunner.query(
      "ALTER TABLE `events` ADD `createdYear` varchar(255) NULL"
    );
    await queryRunner.query("ALTER TABLE `events` DROP COLUMN `level`");
    await queryRunner.query("ALTER TABLE `events` ADD `level` int NULL");
    await queryRunner.query("ALTER TABLE `events` DROP COLUMN `playersNumber`");
    await queryRunner.query(
      "ALTER TABLE `events` ADD `playersNumber` int NULL"
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("ALTER TABLE `events` DROP COLUMN `playersNumber`");
    await queryRunner.query(
      "ALTER TABLE `events` ADD `playersNumber` varchar(255) NULL"
    );
    await queryRunner.query("ALTER TABLE `events` DROP COLUMN `level`");
    await queryRunner.query(
      "ALTER TABLE `events` ADD `level` varchar(255) NULL"
    );
    await queryRunner.query("ALTER TABLE `events` DROP COLUMN `createdYear`");
    await queryRunner.query("ALTER TABLE `complexes` DROP COLUMN `latitude`");
    await queryRunner.query("ALTER TABLE `complexes` DROP COLUMN `longitude`");
    await queryRunner.query("ALTER TABLE `complexes` DROP COLUMN `sports`");
    await queryRunner.query(
      "ALTER TABLE `locations` DROP COLUMN `isVolleyball`"
    );
    await queryRunner.query("ALTER TABLE `locations` DROP COLUMN `isTennis`");
    await queryRunner.query(
      "ALTER TABLE `locations` DROP COLUMN `isBasketball`"
    );
    await queryRunner.query("ALTER TABLE `locations` DROP COLUMN `isFootball`");
    await queryRunner.query(
      "ALTER TABLE `locations` ADD `longitude` decimal NULL"
    );
    await queryRunner.query(
      "ALTER TABLE `locations` ADD `latitude` decimal NULL"
    );
  }
}
