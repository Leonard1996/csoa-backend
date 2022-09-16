import {MigrationInterface, QueryRunner} from "typeorm";

export class dropCompositeReviews1662758403252 implements MigrationInterface {
    name = 'dropCompositeReviews1662758403252'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP INDEX `IDX_e74cd44cea927412831c477c82` ON `reviews`");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE UNIQUE INDEX `IDX_e74cd44cea927412831c477c82` ON `reviews` (`senderId`, `receiverId`)");
    }

}
