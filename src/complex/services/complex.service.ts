import { getCustomRepository, getRepository } from "typeorm";
import { EventRepository } from "../../event/repositories/event.repository";
import { Complex } from "../entities/complex.entity";

export class ComplexService {
  public static list() {
    const complexRepository = getRepository(Complex);
    return complexRepository.find({ withDeleted: true });
  }
  public static create(payload) {
    const complexRepository = getRepository(Complex);

    let complex = complexRepository.create(payload as any);
    complex["facilities"] = {
      "Fushë e mbyllur": payload["Fushë e mbyllur"],
      Dushe: payload["Dushe"],
      "Kend Lojrash": payload["Kend Lojrash"],
      Bar: payload["Bar"],
      Parkim: payload["Parkim"],
    };
    complex["sports"] = {
      Futboll: payload.Futboll,
      Basketboll: payload.Basketboll,
      Tenis: payload.Tenis,
      Volejboll: payload.Volejboll,
    };

    if (complex["latitude"] === "") complex["latitude"] = null;
    if (complex["longitude"] === "") complex["longitude"] = null;

    return complexRepository.save(complex as any);
  }

  public static async update(payload) {
    const complexRepository = getRepository(Complex);

    if (JSON.stringify(payload["latitude"]) === JSON.stringify([""]))
      payload["latitude"] = null;
    if (JSON.stringify(payload["longitude"]) === JSON.stringify([""]))
      payload["longitude"] = null;

    return complexRepository.update({ id: payload.id }, payload);
  }
  public static getById(request) {
    const complexRepository = getRepository(Complex);
    return complexRepository.find({
      withDeleted: true,
      where: { id: request.params.id },
    });
  }

  static getEvents(id: number) {
    const eventRepository = getCustomRepository(EventRepository);
    return eventRepository
      .createQueryBuilder("e")
      .withDeleted()
      .select(
        "e.id, u.name, e.startDate, e.endDate, l.name as locationName, l.price, e.status, e.isUserReservation"
      )
      .innerJoin("locations", "l", "l.id = e.locationId")
      .innerJoin("complexes", "c", "c.id = l.complexId")
      .innerJoin("users", "u", "u.id = e.creatorId")
      .where("c.id = :id", { id })
      .orderBy("e.id", "DESC")
      .getRawMany();
  }

  static getFilteredEvents(request) {
    const { body } = request;
    let userReserved = `true`;

    if (body.type["Nga aplikacioni"] && !body.type["Nga sistemi"]) {
      userReserved = `e.isUserReserved = true`;
    }
    if (body.type["Nga sistemi"] && !body.type["Nga aplikacioni"]) {
      userReserved = `e.isUserReserved = false`;
    }

    const selectedStatus = Object.keys(body.status).filter(
      (key) => body.status[key]
    );

    let statusCondition = `e.status IN ('${selectedStatus.join("','")}')`;

    const eventRepository = getCustomRepository(EventRepository);
    return eventRepository
      .createQueryBuilder("e")
      .withDeleted()
      .select(
        "e.id, u.name, e.startDate, e.endDate, l.name as locationName, l.price, e.status, e.isUserReservation"
      )
      .innerJoin("locations", "l", "l.id = e.locationId")
      .innerJoin("complexes", "c", "c.id = l.complexId")
      .innerJoin("users", "u", "u.id = e.creatorId")
      .where("c.id = :id", { id: request.params.id })
      .andWhere(statusCondition)
      .andWhere(userReserved)
      .andWhere("e.startDate >= :startDate", {
        startDate: body.time.from,
      })
      .andWhere("e.endDate <= :endDate", { endDate: body.time.to })
      .orderBy("e.id", "DESC")
      .getRawMany();
  }

  static fetchEventsByLocationdId(request) {
    const eventRepository = getCustomRepository(EventRepository);
    return eventRepository
      .createQueryBuilder("e")
      .withDeleted()
      .select(
        "e.id, e.name as name, e.startDate, e.endDate,l.id as locationId, l.name as locationName, l.price, e.status, c.workingHours, e.sport"
      )
      .innerJoin("locations", "l", "l.id = e.locationId")
      .innerJoin("complexes", "c", "c.id = l.complexId")
      .where("c.id = :id", { id: request.params.id })
      .andWhere("e.startDate >= :startDate", {
        startDate: request.body.from,
      })
      .andWhere("e.endDate <= :endDate", { endDate: request.body.to })
      .andWhere("l.id = :locationId", { locationId: request.params.locationId })
      .orderBy("e.id", "DESC")
      .getRawMany();
  }
}
