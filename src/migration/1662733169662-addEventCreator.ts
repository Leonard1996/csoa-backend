import {MigrationInterface, QueryRunner} from "typeorm";

export class addEventCreator1662733169662 implements MigrationInterface {
    name = 'addEventCreator1662733169662'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `events` ADD `creatorId` int NULL");
        await queryRunner.query("ALTER TABLE `events` ADD CONSTRAINT `FK_c621508a2b84ae21d3f971cdb47` FOREIGN KEY (`creatorId`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `events` DROP FOREIGN KEY `FK_c621508a2b84ae21d3f971cdb47`");
        await queryRunner.query("ALTER TABLE `events` DROP COLUMN `creatorId`");
    }

}
