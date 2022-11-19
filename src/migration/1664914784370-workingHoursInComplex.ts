import {MigrationInterface, QueryRunner} from "typeorm";

export class workingHoursInComplex1664914784370 implements MigrationInterface {
    name = 'workingHoursInComplex1664914784370'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `complexes` ADD `workingHours` json NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `complexes` DROP COLUMN `workingHours`");
    }

}
