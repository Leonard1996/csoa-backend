import {MigrationInterface, QueryRunner} from "typeorm";

export class complexIdInUser1666630730824 implements MigrationInterface {
    name = 'complexIdInUser1666630730824'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `users` ADD `complexId` int NULL");
        await queryRunner.query("ALTER TABLE `users` ADD CONSTRAINT `FK_0d1877980ffd614b65f2e0078f9` FOREIGN KEY (`complexId`) REFERENCES `complexes`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `users` DROP FOREIGN KEY `FK_0d1877980ffd614b65f2e0078f9`");
        await queryRunner.query("ALTER TABLE `users` DROP COLUMN `complexId`");
    }

}
