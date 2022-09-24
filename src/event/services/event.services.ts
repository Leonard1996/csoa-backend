import { Request, Response } from "express";
import { Brackets, getCustomRepository, getRepository } from "typeorm";
import { Functions } from "../../common/utilities/Functions";
import { RequestStatus } from "../../request/entities/request.entity";
import { UserService } from "../../user/services/user.service";
import { Event, EventStatus } from "../entities/event.entity";
import { EventRepository } from "../repositories/event.repository";
import { TeamUsers } from "../../team/entities/team.users.entity";
import { CreateEventDto } from "../dto/create-event.dto";
import { UpdateEventDto } from "../dto/update-event.dto";
import { RequestRepository } from "../../request/repositories/request.repository";

export class EventService {
  static listMyEvents = async (request: Request, response: Response) => {
    const eventsRepository = getCustomRepository(EventRepository);
    let todayDate = Functions.formatCurrentDate(new Date());
    const userId = +response.locals.jwt.userId;
    const user = await UserService.findOne(userId);
    let mySports = [];
    for (const sport in user.sports as any) {
      if (user.sports[sport].picked) {
        mySports.push(sport);
      }
    }

    const teamUsersRepository = getRepository(TeamUsers);

    const myTeams = await teamUsersRepository.find({
      where: {
        playerId: response.locals.jwt.userId,
      },
      relations: ["team"],
    });

    const myTeamsIds = myTeams.map((player) => player.team.id);

    const myEvents = await eventsRepository
      .createQueryBuilder("event")
      .innerJoin("event.eventRequests", "request", "request.eventId = event.id")
      .innerJoinAndSelect("event.location", "location")
      .innerJoinAndSelect("location.complex", "complex")
      .innerJoinAndSelect("event.organiserTeam", "senderTeam")
      .innerJoinAndSelect("event.receiverTeam", "receiverTeam")
      .where("event.status IN (:statuses)", {
        statuses: [
          EventStatus.DRAFT,
          EventStatus.WAITING_FOR_CONFIRMATION,
          EventStatus.CONFIRMED,
        ],
      })
      .andWhere("event.startDate > :todayStart", {
        todayStart: todayDate + " 00:00:00",
      })
      .andWhere("event.startDate < :todayEnd", {
        todayEnd: todayDate + " 23:59:59",
      })
      .andWhere("request.status = :status", {
        status: RequestStatus.CONFIRMED,
      })
      .andWhere(
        new Brackets((qb) => {
          qb.where("request.receiverId = :id", { id: userId })
            .orWhere("request.senderId = :id", { id: userId })
            .orWhere("request.senderTeamId IN (:...myTeamsIds)", {
              myTeamsIds,
            })
            .orWhere("request.receiverTeamId IN (:...myTeamsIds)", {
              myTeamsIds,
            });
        })
      )
      .getMany();

    const publicEvents = await eventsRepository
      .createQueryBuilder("event")
      .leftJoin("event.eventRequests", "request", "request.eventId = event.id")
      .leftJoinAndSelect("event.location", "location")
      .leftJoinAndSelect("location.complex", "complex")
      .leftJoinAndSelect("event.organiserTeam", "senderTeam")
      .leftJoinAndSelect("event.receiverTeam", "receiverTeam")
      .where("event.sport IN (:mySports)", { mySports })
      .andWhere("event.isPublic = true")
      .andWhere("event.status IN (:statuses)", {
        statuses: [EventStatus.CONFIRMED, EventStatus.WAITING_FOR_CONFIRMATION],
      })
      .andWhere("request.status = :status", {
        status: RequestStatus.CONFIRMED,
      })
      .andWhere(
        new Brackets((qb) => {
          qb.where("request.receiverId != :id", {
            id: userId,
          });
          qb.orWhere("request.receiverId IS NULL");
        })
      )
      .andWhere(
        new Brackets((qb) => {
          qb.where("request.senderId != :id", {
            id: userId,
          });
          qb.orWhere("request.senderId IS NULL");
        })
      )
      .andWhere(
        new Brackets((qb) => {
          qb.where("request.senderTeamId NOT IN (:...myTeamsIds)", {
            myTeamsIds,
          });
          qb.orWhere("request.senderTeamId IS NULL");
        })
      )
      .andWhere(
        new Brackets((qb) => {
          qb.where("request.receiverTeamId NOT IN (:...myTeamsIds)", {
            myTeamsIds,
          });
          qb.orWhere("request.receiverTeamId IS NULL");
        })
      )
      .getMany();

    const responseData = {
      myEvents: myEvents.map((event) => event.toResponse),
      publicEvents: publicEvents.map((event) => event.toResponse),
    };

    return responseData;
  };

  static insert = async (
    eventPayload: CreateEventDto,
    request: Request,
    response: Response
  ) => {
    const eventRepository = getCustomRepository(EventRepository);

    eventPayload.creatorId = response.locals.jwt.userId;
    const createdEvent = eventRepository.create(eventPayload);
    const savedEvent = await eventRepository.save(createdEvent);

    const requestRepository = getCustomRepository(RequestRepository);
    if (!savedEvent.isTeam) {
      await requestRepository
        .createQueryBuilder("request")
        .insert()
        .values([
          {
            senderId: savedEvent.creatorId,
            receiverId: savedEvent.creatorId,
            eventId: savedEvent.id,
            sport: savedEvent.sport,
            status: RequestStatus.CONFIRMED,
          },
        ])
        .execute();
    }

    return savedEvent;
  };

  static getById = async (eventId: number) => {
    const eventRepository = getCustomRepository(EventRepository);

    const event = await eventRepository
      .createQueryBuilder("event")
      .leftJoinAndSelect("event.location", "location")
      .leftJoinAndSelect("location.complex", "complex")
      .leftJoinAndSelect("event.organiserTeam", "organiserTeam")
      .leftJoinAndSelect("event.receiverTeam", "receiverTeam")
      .where("event.id = :id", { id: eventId })
      .getOne();

    return event.toResponse;
  };

  static findById = async (eventId: number) => {
    const eventRepository = getCustomRepository(EventRepository);

    const event = await eventRepository
      .createQueryBuilder("event")
      .where("event.id = :id", { id: eventId })
      .getOne();

    return event;
  };

  static update = async (
    eventPayload: UpdateEventDto,
    currentEvent: Event,
    request: Request
  ) => {
    const eventRepository = getCustomRepository(EventRepository);

    const updatedEvent = eventRepository.merge(currentEvent, eventPayload);
    await eventRepository.save(updatedEvent);

    return updatedEvent;
  };
}
