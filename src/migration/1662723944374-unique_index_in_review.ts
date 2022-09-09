import {MigrationInterface, QueryRunner} from "typeorm";

export class uniqueIndexInReview1662723944374 implements MigrationInterface {
    name = 'uniqueIndexInReview1662723944374'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE UNIQUE INDEX `IDX_e74cd44cea927412831c477c82` ON `reviews` (`senderId`, `receiverId`)");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP INDEX `IDX_e74cd44cea927412831c477c82` ON `reviews`");
    }

}
