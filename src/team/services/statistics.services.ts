import { Brackets, getCustomRepository } from "typeorm";
import { EventRepository } from "../../event/entities/repositories/event.repository";

export class StatisticsService {
  static getMyWins = async (ids: number[]) => {
    const eventCustomRepository = getCustomRepository(EventRepository);
    return await eventCustomRepository
      .createQueryBuilder("events")
      .select("COUNT(events.id) as wins, events.winnerTeamId as winnerId")
      .where("events.winnerTeamId IN (:...ids)", { ids })
      .andWhere(
        new Brackets((qb) => {
          qb.where("events.organiserTeamId IN (:...ids)", {
            ids,
          }).orWhere("events.receiverTeamId IN (:...ids)", {
            ids,
          });
        })
      )
      .groupBy("events.winnerTeamId")
      .getRawMany();
  };

  static getMyLoses = async (ids: number[]) => {
    const eventCustomRepository = getCustomRepository(EventRepository);
    return await eventCustomRepository
      .createQueryBuilder("events")
      .select("COUNT(events.id) as loses, events.loserTeamId as loserId")
      .where("events.loserTeamId IN (:...ids)", { ids })
      .andWhere(
        new Brackets((qb) => {
          qb.where("events.organiserTeamId IN (:...ids)", {
            ids,
          }).orWhere("events.receiverTeamId IN (:...ids)", {
            ids,
          });
        })
      )
      .groupBy("events.loserTeamId")
      .getRawMany();
  };

  static getMyDraws = async (ids: number[]) => {
    const eventCustomRepository = getCustomRepository(EventRepository);
    return await eventCustomRepository
      .createQueryBuilder("events")
      .select(
        "COUNT(events.id) as draws, events.isDraw as isDraw, events.organiserTeamId as organiser, events.receiverTeamId as receiver "
      )
      .where("events.isDraw = :isDraw", { isDraw: 1 })
      .andWhere(
        new Brackets((qb) => {
          qb.where("events.organiserTeamId IN (:...ids)", {
            ids,
          }).orWhere("events.receiverTeamId IN (:...ids)", {
            ids,
          });
        })
      )
      .groupBy("events.id")
      .getRawMany();
  };
}
