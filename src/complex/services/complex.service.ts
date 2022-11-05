import { Request } from "express";
import { getCustomRepository, getRepository } from "typeorm";
import { Attachment } from "../../attachment/entities/attachment.entity";
import { File } from "../../common/utilities/File";
import { EventStatus } from "../../event/entities/event.entity";
import { EventRepository } from "../../event/repositories/event.repository";
import { User } from "../../user/entities/user.entity";
import { Complex } from "../entities/complex.entity";
import { Location } from "../entities/location.entity";

export class ComplexService {
  public static list() {
    const complexRepository = getRepository(Complex);
    // return complexRepository
    //   .createQueryBuilder("c")
    //   .select([
    //     "name",
    //     "phone",
    //     "facilities",
    //     "city",
    //     "sports",
    //     "longitude",
    //     "latitude",
    //     "workingHours",
    //     "banner",
    //     "avatar",
    //   ])
    //   .withDeleted()
    //   .getRawMany();
    return complexRepository.find({ withDeleted: true });
  }
  public static listMinified() {
    const complexRepository = getRepository(Complex);
    return complexRepository
      .createQueryBuilder("c")
      .select(["c.name", "c.id"])
      .getMany();
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
      .andWhere(`e.status != '${EventStatus.DRAFT}'`)
      .orderBy("e.id", "DESC")
      .limit(350)
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
        "e.id, e.name as name, e.startDate, e.endDate,l.id as locationId, l.name as locationName, l.price, e.status, c.workingHours, e.sport, e.notes"
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

  static async upsert(request: Request) {
    const fields = JSON.parse(request.body.fields);

    let complex;
    if (fields.id) {
      // complex = await getRepository(Complex).update()
    }
    if (!fields.id) {
      complex = new Complex();
      complex.name = fields.name;
      complex.phone = fields.phone;
      complex.facilities = JSON.stringify({
        Bar: fields.Bar || false,
        Dushe: fields.Dushe || false,
        Parkim: fields.Parkim || false,
        "Kënd Lojrash": fields["Kënd Lojrash"] || false,
        "Fushë e mbyllur": fields["Fushë e mbyllur"] || false,
      });
      complex.sports = JSON.stringify({
        Tenis: fields.Tenis || false,
        Futboll: fields.Futboll || false,
        Volejboll: fields.Volejboll || false,
        Basketboll: fields.Basketboll || false,
      });
      complex.longitude = fields.longitude ? +fields.longitude : null;
      complex.latitude = fields.latitude ? +fields.latitude : null;
      complex.banner = fields?.fileBanner?.base64;
      complex.avatar = fields?.fileAvatar?.base64;
      let from: any = new Date(fields.from);
      let hours = from.getHours();
      let minutes = from.getMinutes();
      minutes = minutes > 30 ? 1.0 : 0.0;
      hours = hours + minutes;
      from = hours;

      let to: any = new Date(fields.to);
      hours = to.getHours();
      minutes = to.getMinutes();
      minutes = minutes > 30 ? 1.0 : 0.0;
      hours = hours + minutes;
      to = hours;

      complex.workingHours = JSON.stringify({
        from,
        to,
      });
      complex.city = fields.city;

      complex = await getRepository(Complex).save(complex);

      if (request.files) {
        let attachments: Attachment[] = [];
        for (const file of request.files as Express.Multer.File[]) {
          attachments.push(
            ComplexService.createAttachmentForComplex(file, complex.id)
          );
        }
        if (attachments.length) {
          await getRepository(Attachment)
            .createQueryBuilder()
            .insert()
            .values(attachments)
            .execute();
        }
      }
    }

    let locations: Location[] = [];
    for (const field of fields.locations) {
      const location = new Location();
      location.name = field.location;
      location.complexId = complex.id;
      location.price = field.price;
      location.dimensions = `${field.length} x ${fields.width}`;
      if (field.isFootball)
        location.isFootball = JSON.stringify({
          name: "futboll",
          slotRange: field?.isFootball?.time,
        });
      if (field.isBasketball)
        location.isBasketball = JSON.stringify({
          name: "basketboll",
          slotRange: field?.isBasketball?.time,
        });
      if (field.isTennis)
        location.isTennis = JSON.stringify({
          name: "tenis",
          slotRange: field?.isTennis?.time,
        });
      if (field.isVolleyball)
        location.isVolleyball = JSON.stringify({
          name: "volejboll",
          slotRange: field?.isVolleyball?.time,
        });
      locations.push(location);
    }

    if (locations.length) {
      await getRepository(Location)
        .createQueryBuilder()
        .insert()
        .values(locations)
        .execute();
    }

    return complex;
  }

  static createAttachmentForComplex = (
    file: Express.Multer.File,
    complexId: number
  ) => {
    const attachment = new Attachment();
    attachment.name = file.filename;
    attachment.originalName = file.originalname;
    attachment.mimeType = file.mimetype;
    attachment.sizeInBytes = file.size;
    attachment.extension = File.getFileExtension(file.originalname);
    attachment.path = file.path;
    attachment.complexId = complexId;
    return attachment;
  };

  static getLocationsByComplexOwner(id: number) {
    return getRepository(Location)
      .createQueryBuilder("l")
      .select(["l.*"])
      .innerJoin("complexes", "c", "c.id = l.complexId")
      .innerJoin("users", "u", "c.id = u.complexId")
      .where("u.id = :id", { id })
      .withDeleted()
      .getRawMany();
  }

  static getEventsByComplexOwner(id: number) {
    const eventRepository = getCustomRepository(EventRepository);
    return eventRepository
      .createQueryBuilder("e")
      .withDeleted()
      .select(
        "e.id, u.name, e.startDate, e.endDate, l.name as locationName, l.price, e.status, e.isUserReservation"
      )
      .innerJoin("locations", "l", "l.id = e.locationId")
      .innerJoin("complexes", "c", "c.id = l.complexId")
      .innerJoin("users", "u", "u.complexId = c.id")
      .where("u.id = :id", { id })
      .andWhere(`e.status != '${EventStatus.DRAFT}'`)
      .orderBy("e.id", "DESC")
      .limit(200)
      .getRawMany();
  }
}
