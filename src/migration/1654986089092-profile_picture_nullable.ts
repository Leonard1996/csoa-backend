import {MigrationInterface, QueryRunner} from "typeorm";

export class profilePictureNullable1654986089092 implements MigrationInterface {
    name = 'profilePictureNullable1654986089092'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `users` CHANGE `profile_picture` `profile_picture` varchar(256) NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `users` CHANGE `profile_picture` `profile_picture` varchar(256) NOT NULL");
    }

}
