import { MigrationInterface, QueryRunner } from "typeorm";

export class bannerAndAvatarBase64InComplex1664033462553
  implements MigrationInterface
{
  name = "bannerAndAvatarBase64InComplex\n1664033462553";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("ALTER TABLE `complexes` DROP COLUMN `banner`");
    await queryRunner.query(
      "ALTER TABLE `complexes` ADD `banner` longtext NULL"
    );
    await queryRunner.query("ALTER TABLE `complexes` DROP COLUMN `avatar`");
    await queryRunner.query(
      "ALTER TABLE `complexes` ADD `avatar` longtext NULL"
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("ALTER TABLE `complexes` DROP COLUMN `avatar`");
    await queryRunner.query(
      "ALTER TABLE `complexes` ADD `avatar` varchar(255) NULL"
    );
    await queryRunner.query("ALTER TABLE `complexes` DROP COLUMN `banner`");
    await queryRunner.query(
      "ALTER TABLE `complexes` ADD `banner` varchar(255) NULL"
    );
  }
}
