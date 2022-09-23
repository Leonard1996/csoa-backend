import {MigrationInterface, QueryRunner} from "typeorm";

export class changeEventPlayersNumberType1663947349079 implements MigrationInterface {
    name = 'changeEventPlayersNumberType1663947349079'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `events` DROP COLUMN `playersNumber`");
        await queryRunner.query("ALTER TABLE `events` ADD `playersNumber` varchar(255) NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `events` DROP COLUMN `playersNumber`");
        await queryRunner.query("ALTER TABLE `events` ADD `playersNumber` int NULL");
    }

}
