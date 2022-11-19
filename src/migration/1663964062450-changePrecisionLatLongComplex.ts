import {MigrationInterface, QueryRunner} from "typeorm";

export class changePrecisionLatLongComplex1663964062450 implements MigrationInterface {
    name = 'changePrecisionLatLongComplex1663964062450'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `complexes` CHANGE `longitude` `longitude` decimal(10,7) NULL");
        await queryRunner.query("ALTER TABLE `complexes` CHANGE `latitude` `latitude` decimal(10,7) NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `complexes` CHANGE `latitude` `latitude` decimal(10,0) NULL");
        await queryRunner.query("ALTER TABLE `complexes` CHANGE `longitude` `longitude` decimal(10,0) NULL");
    }

}
