import {MigrationInterface, QueryRunner} from "typeorm";

export class createBusinessLogicTables1662416787340 implements MigrationInterface {
    name = 'createBusinessLogicTables1662416787340'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `complexes` (`deleted` tinyint(1) NOT NULL DEFAULT '0', `id` int NOT NULL AUTO_INCREMENT, `ts_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, `ts_last_modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, `name` varchar(255) NULL, `phone` varchar(255) NULL, `facilities` json NULL, `banner` varchar(255) NULL, `avatar` varchar(255) NULL, INDEX `IDX_b334c70c3902ca84fa1130b220` (`deleted`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `locations` (`deleted` tinyint(1) NOT NULL DEFAULT '0', `id` int NOT NULL AUTO_INCREMENT, `ts_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, `ts_last_modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, `name` varchar(255) NULL, `longitude` decimal NULL, `latitude` decimal NULL, `dimensions` varchar(255) NULL, `price` varchar(255) NULL, `complexId` int NULL, INDEX `IDX_817f84e49e365c71a1aab50f93` (`deleted`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `teams_users` (`deleted` tinyint(1) NOT NULL DEFAULT '0', `id` int NOT NULL AUTO_INCREMENT, `ts_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, `ts_last_modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, `sport` varchar(255) NULL, `isConfirmed` tinyint NULL, `playerId` int NULL, `teamId` int NULL, INDEX `IDX_7d2d117c3fe07a5bcff70bc642` (`deleted`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `teams` (`deleted` tinyint(1) NOT NULL DEFAULT '0', `id` int NOT NULL AUTO_INCREMENT, `ts_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, `ts_last_modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, `banner` varchar(255) NULL, `avatar` varchar(255) NULL, `name` varchar(255) NULL, `sport` varchar(255) NULL, `ageRange` varchar(255) NULL, `level` varchar(255) NULL, `userId` int NULL, INDEX `IDX_19718b1568d9e85d7abd018810` (`deleted`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `events` (`deleted` tinyint(1) NOT NULL DEFAULT '0', `id` int NOT NULL AUTO_INCREMENT, `ts_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, `ts_last_modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, `sport` varchar(255) NULL, `startDate` timestamp NULL, `endDate` timestamp NULL, `isDraft` tinyint NULL, `isPublic` tinyint NULL, `name` varchar(255) NULL, `isTeam` tinyint NULL, `level` int NULL, `playersNumber` int NULL, `playersAge` varchar(255) NULL, `status` varchar(255) NULL, `isWeekly` tinyint NULL, `result` varchar(255) NULL, `lineups` json NULL, `locationId` int NULL, `receiverTeamCaptainId` int NULL, `organiserTeamCaptainId` int NULL, `organiserTeamId` int NULL, `receiverTeamId` int NULL, INDEX `IDX_9f9d0ea9ff574794ff726ea72b` (`deleted`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `notifications` (`deleted` tinyint(1) NOT NULL DEFAULT '0', `id` int NOT NULL AUTO_INCREMENT, `ts_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, `ts_last_modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, `isRead` tinyint NULL, `payload` json NULL, `complexId` int NULL, `senderId` int NULL, `receiverId` int NULL, INDEX `IDX_4cfb73b5e325098f79cae305c2` (`deleted`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `reviews` (`deleted` tinyint(1) NOT NULL DEFAULT '0', `id` int NOT NULL AUTO_INCREMENT, `ts_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, `ts_last_modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, `value` decimal NULL, `senderId` int NULL, `receiverId` int NULL, INDEX `IDX_2ddf9f5bdb7eb4c9b252999499` (`deleted`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `locations` ADD CONSTRAINT `FK_370127b2e8da09edf008ea0ff0e` FOREIGN KEY (`complexId`) REFERENCES `complexes`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `teams_users` ADD CONSTRAINT `FK_96c157f43165f1cb7bf7204b62d` FOREIGN KEY (`playerId`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `teams_users` ADD CONSTRAINT `FK_61562c3f531008097b6cab0c513` FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `teams` ADD CONSTRAINT `FK_5c5696b2c3c57698f890b2cbbdd` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `events` ADD CONSTRAINT `FK_55ad94f5c1b4c97960d6d7dc115` FOREIGN KEY (`locationId`) REFERENCES `locations`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `events` ADD CONSTRAINT `FK_241c22452de3d3e01dd85aec192` FOREIGN KEY (`receiverTeamCaptainId`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `events` ADD CONSTRAINT `FK_c487895d96ca34e9317a4316ee7` FOREIGN KEY (`organiserTeamCaptainId`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `events` ADD CONSTRAINT `FK_c0c52b3c8fdbd45689e66f99726` FOREIGN KEY (`organiserTeamId`) REFERENCES `teams`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `events` ADD CONSTRAINT `FK_ae8396a25ec30417dd543982a67` FOREIGN KEY (`receiverTeamId`) REFERENCES `teams`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `notifications` ADD CONSTRAINT `FK_cbadd26cf1ca715c4b7785df14d` FOREIGN KEY (`complexId`) REFERENCES `complexes`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `notifications` ADD CONSTRAINT `FK_ddb7981cf939fe620179bfea33a` FOREIGN KEY (`senderId`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `notifications` ADD CONSTRAINT `FK_d1e9b2452666de3b9b4d271cca0` FOREIGN KEY (`receiverId`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `reviews` ADD CONSTRAINT `FK_3c888cf2a2de493dc5178cf69e1` FOREIGN KEY (`senderId`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `reviews` ADD CONSTRAINT `FK_93452d8b6b611370eb583779c0d` FOREIGN KEY (`receiverId`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `reviews` DROP FOREIGN KEY `FK_93452d8b6b611370eb583779c0d`");
        await queryRunner.query("ALTER TABLE `reviews` DROP FOREIGN KEY `FK_3c888cf2a2de493dc5178cf69e1`");
        await queryRunner.query("ALTER TABLE `notifications` DROP FOREIGN KEY `FK_d1e9b2452666de3b9b4d271cca0`");
        await queryRunner.query("ALTER TABLE `notifications` DROP FOREIGN KEY `FK_ddb7981cf939fe620179bfea33a`");
        await queryRunner.query("ALTER TABLE `notifications` DROP FOREIGN KEY `FK_cbadd26cf1ca715c4b7785df14d`");
        await queryRunner.query("ALTER TABLE `events` DROP FOREIGN KEY `FK_ae8396a25ec30417dd543982a67`");
        await queryRunner.query("ALTER TABLE `events` DROP FOREIGN KEY `FK_c0c52b3c8fdbd45689e66f99726`");
        await queryRunner.query("ALTER TABLE `events` DROP FOREIGN KEY `FK_c487895d96ca34e9317a4316ee7`");
        await queryRunner.query("ALTER TABLE `events` DROP FOREIGN KEY `FK_241c22452de3d3e01dd85aec192`");
        await queryRunner.query("ALTER TABLE `events` DROP FOREIGN KEY `FK_55ad94f5c1b4c97960d6d7dc115`");
        await queryRunner.query("ALTER TABLE `teams` DROP FOREIGN KEY `FK_5c5696b2c3c57698f890b2cbbdd`");
        await queryRunner.query("ALTER TABLE `teams_users` DROP FOREIGN KEY `FK_61562c3f531008097b6cab0c513`");
        await queryRunner.query("ALTER TABLE `teams_users` DROP FOREIGN KEY `FK_96c157f43165f1cb7bf7204b62d`");
        await queryRunner.query("ALTER TABLE `locations` DROP FOREIGN KEY `FK_370127b2e8da09edf008ea0ff0e`");
        await queryRunner.query("DROP INDEX `IDX_2ddf9f5bdb7eb4c9b252999499` ON `reviews`");
        await queryRunner.query("DROP TABLE `reviews`");
        await queryRunner.query("DROP INDEX `IDX_4cfb73b5e325098f79cae305c2` ON `notifications`");
        await queryRunner.query("DROP TABLE `notifications`");
        await queryRunner.query("DROP INDEX `IDX_9f9d0ea9ff574794ff726ea72b` ON `events`");
        await queryRunner.query("DROP TABLE `events`");
        await queryRunner.query("DROP INDEX `IDX_19718b1568d9e85d7abd018810` ON `teams`");
        await queryRunner.query("DROP TABLE `teams`");
        await queryRunner.query("DROP INDEX `IDX_7d2d117c3fe07a5bcff70bc642` ON `teams_users`");
        await queryRunner.query("DROP TABLE `teams_users`");
        await queryRunner.query("DROP INDEX `IDX_817f84e49e365c71a1aab50f93` ON `locations`");
        await queryRunner.query("DROP TABLE `locations`");
        await queryRunner.query("DROP INDEX `IDX_b334c70c3902ca84fa1130b220` ON `complexes`");
        await queryRunner.query("DROP TABLE `complexes`");
    }

}
