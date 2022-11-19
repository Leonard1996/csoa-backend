import {MigrationInterface, QueryRunner} from "typeorm";

export class removeDeletedColumn1662638933256 implements MigrationInterface {
    name = 'removeDeletedColumn1662638933256'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP INDEX `IDX_57f4205162470cedb447cc1486` ON `attachments`");
        await queryRunner.query("DROP INDEX `IDX_b334c70c3902ca84fa1130b220` ON `complexes`");
        await queryRunner.query("DROP INDEX `IDX_817f84e49e365c71a1aab50f93` ON `locations`");
        await queryRunner.query("DROP INDEX `IDX_7d2d117c3fe07a5bcff70bc642` ON `teams_users`");
        await queryRunner.query("DROP INDEX `IDX_19718b1568d9e85d7abd018810` ON `teams`");
        await queryRunner.query("DROP INDEX `IDX_9f9d0ea9ff574794ff726ea72b` ON `events`");
        await queryRunner.query("DROP INDEX `IDX_4cfb73b5e325098f79cae305c2` ON `notifications`");
        await queryRunner.query("DROP INDEX `IDX_2ddf9f5bdb7eb4c9b252999499` ON `reviews`");
        await queryRunner.query("DROP INDEX `IDX_b147a0c758f65b438f114cc193` ON `users`");
        await queryRunner.query("DROP INDEX `IDX_bfa93e337c02e070a5b2c0289a` ON `codes`");
        await queryRunner.query("ALTER TABLE `attachments` DROP COLUMN `deleted`");
        await queryRunner.query("ALTER TABLE `complexes` DROP COLUMN `deleted`");
        await queryRunner.query("ALTER TABLE `locations` DROP COLUMN `deleted`");
        await queryRunner.query("ALTER TABLE `teams_users` DROP COLUMN `deleted`");
        await queryRunner.query("ALTER TABLE `teams` DROP COLUMN `deleted`");
        await queryRunner.query("ALTER TABLE `events` DROP COLUMN `deleted`");
        await queryRunner.query("ALTER TABLE `notifications` DROP COLUMN `deleted`");
        await queryRunner.query("ALTER TABLE `reviews` DROP COLUMN `deleted`");
        await queryRunner.query("ALTER TABLE `users` DROP COLUMN `deleted`");
        await queryRunner.query("ALTER TABLE `codes` DROP COLUMN `deleted`");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `codes` ADD `deleted` tinyint(1) NOT NULL DEFAULT '0'");
        await queryRunner.query("ALTER TABLE `users` ADD `deleted` tinyint(1) NOT NULL DEFAULT '0'");
        await queryRunner.query("ALTER TABLE `reviews` ADD `deleted` tinyint(1) NOT NULL DEFAULT '0'");
        await queryRunner.query("ALTER TABLE `notifications` ADD `deleted` tinyint(1) NOT NULL DEFAULT '0'");
        await queryRunner.query("ALTER TABLE `events` ADD `deleted` tinyint(1) NOT NULL DEFAULT '0'");
        await queryRunner.query("ALTER TABLE `teams` ADD `deleted` tinyint(1) NOT NULL DEFAULT '0'");
        await queryRunner.query("ALTER TABLE `teams_users` ADD `deleted` tinyint(1) NOT NULL DEFAULT '0'");
        await queryRunner.query("ALTER TABLE `locations` ADD `deleted` tinyint(1) NOT NULL DEFAULT '0'");
        await queryRunner.query("ALTER TABLE `complexes` ADD `deleted` tinyint(1) NOT NULL DEFAULT '0'");
        await queryRunner.query("ALTER TABLE `attachments` ADD `deleted` tinyint(1) NOT NULL DEFAULT '0'");
        await queryRunner.query("CREATE INDEX `IDX_bfa93e337c02e070a5b2c0289a` ON `codes` (`deleted`)");
        await queryRunner.query("CREATE INDEX `IDX_b147a0c758f65b438f114cc193` ON `users` (`deleted`)");
        await queryRunner.query("CREATE INDEX `IDX_2ddf9f5bdb7eb4c9b252999499` ON `reviews` (`deleted`)");
        await queryRunner.query("CREATE INDEX `IDX_4cfb73b5e325098f79cae305c2` ON `notifications` (`deleted`)");
        await queryRunner.query("CREATE INDEX `IDX_9f9d0ea9ff574794ff726ea72b` ON `events` (`deleted`)");
        await queryRunner.query("CREATE INDEX `IDX_19718b1568d9e85d7abd018810` ON `teams` (`deleted`)");
        await queryRunner.query("CREATE INDEX `IDX_7d2d117c3fe07a5bcff70bc642` ON `teams_users` (`deleted`)");
        await queryRunner.query("CREATE INDEX `IDX_817f84e49e365c71a1aab50f93` ON `locations` (`deleted`)");
        await queryRunner.query("CREATE INDEX `IDX_b334c70c3902ca84fa1130b220` ON `complexes` (`deleted`)");
        await queryRunner.query("CREATE INDEX `IDX_57f4205162470cedb447cc1486` ON `attachments` (`deleted`)");
    }

}
