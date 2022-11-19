import { MigrationInterface, QueryRunner } from "typeorm";

export class addComplexAddress1668886230668 implements MigrationInterface {
  name = "addComplexAddress1668886230668";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("ALTER TABLE `complexes` ADD `address` varchar(255) NULL");
    await queryRunner.query("ALTER TABLE `events` DROP COLUMN `level`");
    await queryRunner.query("ALTER TABLE `events` ADD `level` varchar(255) NULL");
    await queryRunner.query("ALTER TABLE `events` DROP COLUMN `playersNumber`");
    await queryRunner.query("ALTER TABLE `events` ADD `playersNumber` varchar(255) NULL");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("ALTER TABLE `events` DROP COLUMN `playersNumber`");
    await queryRunner.query("ALTER TABLE `events` ADD `playersNumber` int NULL");
    await queryRunner.query("ALTER TABLE `events` DROP COLUMN `level`");
    await queryRunner.query("ALTER TABLE `events` ADD `level` int NULL");
    await queryRunner.query("ALTER TABLE `complexes` DROP COLUMN `address`");
  }
}
