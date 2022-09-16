import { EntityRepository } from "typeorm";
import { CommonRepository } from "../../common/repositories/common.repository";
import { Review } from "../entities/review.entity";

@EntityRepository(Review)
export class ReviewRepository extends CommonRepository<Review> {
  getStars(ids: number[]) {
    return this.createQueryBuilder("r")
      .select("SUM(r.value)/COUNT(r.id) as stars, receiverId as userId, sport")
      .where("r.receiverId IN (:...ids)", { ids })
      .groupBy("r.receiverId, r.sport")
      .getRawMany();
  }
}
