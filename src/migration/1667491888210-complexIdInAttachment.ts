import {MigrationInterface, QueryRunner} from "typeorm";

export class complexIdInAttachment1667491888210 implements MigrationInterface {
    name = 'complexIdInAttachment1667491888210'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `attachments` ADD `complexId` int NULL");
        await queryRunner.query("ALTER TABLE `attachments` ADD CONSTRAINT `FK_2465431bb045a3d100df8cd60b4` FOREIGN KEY (`complexId`) REFERENCES `complexes`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `attachments` DROP FOREIGN KEY `FK_2465431bb045a3d100df8cd60b4`");
        await queryRunner.query("ALTER TABLE `attachments` DROP COLUMN `complexId`");
    }

}
