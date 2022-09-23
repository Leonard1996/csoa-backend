import { EntityRepository } from "typeorm";
import { CommonRepository } from "../../common/repositories/common.repository";
import { Request } from "../entities/request.entity";

@EntityRepository(Request)
export class RequestRepository extends CommonRepository<Request> {
  getStars(ids: number[], sport?: string) {
    return this.createQueryBuilder("r")
      .select("SUM(r.value)/COUNT(r.id) as stars, receiverId as userId, sport")
      .where("r.receiverId IN (:...ids)", { ids })
      .andWhere(sport ? `r.sport = '${sport}'` : "true")
      .groupBy("r.receiverId, r.sport")
      .getRawMany();
  }
}
