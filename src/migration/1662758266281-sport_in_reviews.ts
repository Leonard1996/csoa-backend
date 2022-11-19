import {MigrationInterface, QueryRunner} from "typeorm";

export class sportInReviews1662758266281 implements MigrationInterface {
    name = 'sportInReviews1662758266281'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `reviews` ADD `sport` varchar(255) NULL");
        await queryRunner.query("CREATE UNIQUE INDEX `IDX_23bdc4b1edd012192314961c64` ON `reviews` (`senderId`, `receiverId`, `sport`)");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP INDEX `IDX_23bdc4b1edd012192314961c64` ON `reviews`");
        await queryRunner.query("ALTER TABLE `reviews` DROP COLUMN `sport`");
    }

}
