import {MigrationInterface, QueryRunner} from "typeorm";

export class addIsDummyBooleanAtTeam1664894529839 implements MigrationInterface {
    name = 'addIsDummyBooleanAtTeam1664894529839'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `teams` ADD `isDummy` tinyint NULL DEFAULT 0");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `teams` DROP COLUMN `isDummy`");
    }

}
