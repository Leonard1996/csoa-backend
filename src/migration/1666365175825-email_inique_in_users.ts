import {MigrationInterface, QueryRunner} from "typeorm";

export class emailIniqueInUsers1666365175825 implements MigrationInterface {
    name = 'emailIniqueInUsers1666365175825'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `users` ADD UNIQUE INDEX `IDX_97672ac88f789774dd47f7c8be` (`email`)");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `users` DROP INDEX `IDX_97672ac88f789774dd47f7c8be`");
    }

}
