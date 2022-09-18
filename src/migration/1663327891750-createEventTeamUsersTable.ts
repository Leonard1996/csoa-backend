import {MigrationInterface, QueryRunner} from "typeorm";

export class createEventTeamUsersTable1663327891750 implements MigrationInterface {
    name = 'createEventTeamUsersTable1663327891750'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `event_teams_users` (`id` int NOT NULL AUTO_INCREMENT, `ts_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, `ts_last_modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, `ts_deleted` datetime(6) NULL, `teamUserId` int NULL, `eventId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `event_teams_users` ADD CONSTRAINT `FK_e7e6e77090eb7f03c51744e07aa` FOREIGN KEY (`teamUserId`) REFERENCES `teams_users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `event_teams_users` ADD CONSTRAINT `FK_f9bfa6e1e8c7b02ad0d619b68e4` FOREIGN KEY (`eventId`) REFERENCES `events`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `event_teams_users` DROP FOREIGN KEY `FK_f9bfa6e1e8c7b02ad0d619b68e4`");
        await queryRunner.query("ALTER TABLE `event_teams_users` DROP FOREIGN KEY `FK_e7e6e77090eb7f03c51744e07aa`");
        await queryRunner.query("DROP TABLE `event_teams_users`");
    }

}
