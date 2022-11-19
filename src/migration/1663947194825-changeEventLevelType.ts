import {MigrationInterface, QueryRunner} from "typeorm";

export class changeEventLevelType1663947194825 implements MigrationInterface {
    name = 'changeEventLevelType1663947194825'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `events` DROP COLUMN `level`");
        await queryRunner.query("ALTER TABLE `events` ADD `level` varchar(255) NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `events` DROP COLUMN `level`");
        await queryRunner.query("ALTER TABLE `events` ADD `level` int NULL");
    }

}
