import {MigrationInterface, QueryRunner} from "typeorm";

export class addWinnerAndLoserTeamsAtEvent1662716375424 implements MigrationInterface {
    name = 'addWinnerAndLoserTeamsAtEvent1662716375424'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `events` ADD `isDraw` tinyint NULL");
        await queryRunner.query("ALTER TABLE `events` ADD `winnerTeamId` int NULL");
        await queryRunner.query("ALTER TABLE `events` ADD `loserTeamId` int NULL");
        await queryRunner.query("CREATE INDEX `IDX_a19e885f0fd2b9dd8d6d296308` ON `events` (`isDraw`)");
        await queryRunner.query("ALTER TABLE `events` ADD CONSTRAINT `FK_4dccd316b9c5f860651b69b9e1e` FOREIGN KEY (`winnerTeamId`) REFERENCES `teams`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `events` ADD CONSTRAINT `FK_aa198f4c53b08353567afdfc183` FOREIGN KEY (`loserTeamId`) REFERENCES `teams`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `events` DROP FOREIGN KEY `FK_aa198f4c53b08353567afdfc183`");
        await queryRunner.query("ALTER TABLE `events` DROP FOREIGN KEY `FK_4dccd316b9c5f860651b69b9e1e`");
        await queryRunner.query("DROP INDEX `IDX_a19e885f0fd2b9dd8d6d296308` ON `events`");
        await queryRunner.query("ALTER TABLE `events` DROP COLUMN `loserTeamId`");
        await queryRunner.query("ALTER TABLE `events` DROP COLUMN `winnerTeamId`");
        await queryRunner.query("ALTER TABLE `events` DROP COLUMN `isDraw`");
    }

}
