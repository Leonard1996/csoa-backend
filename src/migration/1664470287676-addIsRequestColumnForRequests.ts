import {MigrationInterface, QueryRunner} from "typeorm";

export class addIsRequestColumnForRequests1664470287676 implements MigrationInterface {
    name = 'addIsRequestColumnForRequests1664470287676'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `requests` ADD `isRequest` tinyint NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `requests` DROP COLUMN `isRequest`");
    }

}
