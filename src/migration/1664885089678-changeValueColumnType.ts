import {MigrationInterface, QueryRunner} from "typeorm";

export class changeValueColumnType1664885089678 implements MigrationInterface {
    name = 'changeValueColumnType1664885089678'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `reviews` CHANGE `value` `value` decimal(3,2) NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `reviews` CHANGE `value` `value` decimal(10,0) NULL");
    }

}
