import { MigrationInterface, QueryRunner } from "typeorm";

export class addTeamYear1669056976960 implements MigrationInterface {
  name = "addTeamYear1669056976960";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("ALTER TABLE `teams` ADD `year` int NULL");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("ALTER TABLE `teams` DROP COLUMN `year`");
  }
}
