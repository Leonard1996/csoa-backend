import {MigrationInterface, QueryRunner} from "typeorm";

export class addTeamIdAndUserIdAtAttachments1663193471470 implements MigrationInterface {
    name = 'addTeamIdAndUserIdAtAttachments1663193471470'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `attachments` ADD `teamId` int NULL");
        await queryRunner.query("ALTER TABLE `attachments` ADD `userId` int NULL");
        await queryRunner.query("ALTER TABLE `attachments` ADD CONSTRAINT `FK_7894270afcd395b0cf5da005630` FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `attachments` ADD CONSTRAINT `FK_35138b11d46d53c48ed932afa47` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `attachments` DROP FOREIGN KEY `FK_35138b11d46d53c48ed932afa47`");
        await queryRunner.query("ALTER TABLE `attachments` DROP FOREIGN KEY `FK_7894270afcd395b0cf5da005630`");
        await queryRunner.query("ALTER TABLE `attachments` DROP COLUMN `userId`");
        await queryRunner.query("ALTER TABLE `attachments` DROP COLUMN `teamId`");
    }

}
