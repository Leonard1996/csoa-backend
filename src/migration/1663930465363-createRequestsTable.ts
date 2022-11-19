import { MigrationInterface, QueryRunner } from "typeorm";

export class createRequestsTable1663930465363 implements MigrationInterface {
  name = "createRequestsTable1663930465363";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "CREATE TABLE `requests` (`id` int NOT NULL AUTO_INCREMENT, `ts_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, `ts_last_modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, `ts_deleted` datetime(6) NULL, `senderId` int NULL, `receiverId` int NULL, `senderTeamId` int NULL, `receiverTeamId` int NULL, `eventId` int NULL, `sport` varchar(255) NULL, `status` varchar(255) NULL, UNIQUE INDEX `IDX_7b1cfcb3379bb8b7dfb9f1c3e2` (`senderId`, `receiverId`, `sport`, `status`), PRIMARY KEY (`id`)) ENGINE=InnoDB"
    );
    await queryRunner.query(
      "ALTER TABLE `requests` ADD CONSTRAINT `FK_670f44ad50fac2e635f4213fa9b` FOREIGN KEY (`senderId`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION"
    );
    await queryRunner.query(
      "ALTER TABLE `requests` ADD CONSTRAINT `FK_df2b65da9fe84c28e82f221bcd5` FOREIGN KEY (`receiverId`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION"
    );
    await queryRunner.query(
      "ALTER TABLE `requests` ADD CONSTRAINT `FK_2c6d077e8ea32219a6ccd4f0c0d` FOREIGN KEY (`senderTeamId`) REFERENCES `teams`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION"
    );
    await queryRunner.query(
      "ALTER TABLE `requests` ADD CONSTRAINT `FK_b1387b2e2348065319346ac1f2c` FOREIGN KEY (`receiverTeamId`) REFERENCES `teams`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION"
    );
    await queryRunner.query(
      "ALTER TABLE `requests` ADD CONSTRAINT `FK_806cde43a5ea7d964eb354ed849` FOREIGN KEY (`eventId`) REFERENCES `events`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION"
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `requests` DROP FOREIGN KEY `FK_806cde43a5ea7d964eb354ed849`"
    );
    await queryRunner.query(
      "ALTER TABLE `requests` DROP FOREIGN KEY `FK_b1387b2e2348065319346ac1f2c`"
    );
    await queryRunner.query(
      "ALTER TABLE `requests` DROP FOREIGN KEY `FK_2c6d077e8ea32219a6ccd4f0c0d`"
    );
    await queryRunner.query(
      "ALTER TABLE `requests` DROP FOREIGN KEY `FK_df2b65da9fe84c28e82f221bcd5`"
    );
    await queryRunner.query(
      "ALTER TABLE `requests` DROP FOREIGN KEY `FK_670f44ad50fac2e635f4213fa9b`"
    );
    await queryRunner.query(
      "DROP INDEX `IDX_7b1cfcb3379bb8b7dfb9f1c3e2` ON `requests`"
    );
    await queryRunner.query("DROP TABLE `requests`");
  }
}
