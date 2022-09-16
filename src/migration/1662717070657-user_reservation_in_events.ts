import {MigrationInterface, QueryRunner} from "typeorm";

export class userReservationInEvents1662717070657 implements MigrationInterface {
    name = 'userReservationInEvents1662717070657'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `events` ADD `isUserReservation` tinyint NOT NULL");
        await queryRunner.query("CREATE INDEX `IDX_409e9d92aee704f83dacaf1cbe` ON `events` (`isUserReservation`)");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP INDEX `IDX_409e9d92aee704f83dacaf1cbe` ON `events`");
        await queryRunner.query("ALTER TABLE `events` DROP COLUMN `isUserReservation`");
    }

}
