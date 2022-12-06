import { Request, Response } from "express";
import { Brackets, getCustomRepository, getManager, getRepository } from "typeorm";
import { Functions } from "../../common/utilities/Functions";
import { RequestStatus } from "../../request/entities/request.entity";
import { UserService } from "../../user/services/user.service";
import { Event, EventStatus } from "../entities/event.entity";
import { EventRepository } from "../repositories/event.repository";
import { TeamUsers } from "../../team/entities/team.users.entity";
import { RequestRepository } from "../../request/repositories/request.repository";
import { TeamRepository } from "../../team/repositories/team.repository";
import { EventTeamUsersRepository } from "../repositories/event.team.users.repository";
import { NotificationService } from "../../notifications/services/notification.services";
import { NotificationType } from "../../notifications/entities/notification.entity";
import { CreateEventDto } from "../dto/create-event.dto";
import { WeeklyEventGroup } from "../entities/weekly.event.group.entity";

export class EventService {
  static listMyEvents = async (request: Request, response: Response) => {
    const eventsRepository = getCustomRepository(EventRepository);
    const teamUsersRepository = getRepository(TeamUsers);
    let todayDate = Functions.formatCurrentDate(new Date());
    const userId = +response.locals.jwt.userId;
    const user = await UserService.findOne(userId);
    let mySports = [];
    for (const sport in user.sports as any) {
      if (user.sports[sport].picked) {
        mySports.push(sport);
      }
    }

    const myTeams = await teamUsersRepository.find({
      where: {
        playerId: response.locals.jwt.userId,
      },
      relations: ["team"],
    });

    const myTeamsIds = myTeams.map((player) => player.team.id).push(-1);

    const queryBuilder = eventsRepository
      .createQueryBuilder("event")
      .leftJoin("event.eventRequests", "request", "request.eventId = event.id AND request.status = 'confirmed'")
      .leftJoinAndSelect("event.location", "location")
      .leftJoinAndSelect("location.complex", "complex")
      .leftJoinAndSelect("event.organiserTeam", "senderTeam")
      .leftJoinAndSelect("event.receiverTeam", "receiverTeam")
      .where("event.status IN (:...statuses)", {
        statuses: [
          EventStatus.DRAFT,
          EventStatus.WAITING_FOR_CONFIRMATION,
          EventStatus.CONFIRMED,
          EventStatus.COMPLETED,
        ],
      })
      .andWhere("event.startDate > :todayStart", {
        todayStart: todayDate + " 00:00:00",
      })
      .andWhere(
        new Brackets((qb) => {
          qb.where("request.receiverId = :id", { id: userId })
            .orWhere("request.senderId = :id", { id: userId })
            .orWhere("request.senderTeamId IN (:...myTeamsIds)", { myTeamsIds })
            .orWhere("request.receiverTeamId IN (:...myTeamsIds)", {
              myTeamsIds,
            });
        })
      );

    if (request.query && request.query.todayEvents === "true") {
      queryBuilder.andWhere("event.startDate < :todayEnd", {
        todayEnd: todayDate + " 23:59:59",
      });
    }

    const myEvents = await queryBuilder.getMany();
    const myEventIds = myEvents.map((event) => event.id).concat(-1);

    const qb = eventsRepository
      .createQueryBuilder("event")
      .leftJoin("event.eventRequests", "request")
      .leftJoinAndSelect("event.location", "location")
      .leftJoinAndSelect("location.complex", "complex")
      .leftJoinAndSelect("event.organiserTeam", "senderTeam")
      .leftJoinAndSelect("event.receiverTeam", "receiverTeam")
      .where("event.sport IN (:...mySports)", { mySports: mySports.length ? mySports : [-1] })
      .andWhere("event.isPublic = :public", { public: true })
      .andWhere("event.status IN (:...statuses)", {
        statuses: [EventStatus.CONFIRMED, EventStatus.WAITING_FOR_CONFIRMATION],
      })
      .andWhere("event.startDate > :todayStart", {
        todayStart: todayDate + " 00:00:00",
      })
      .andWhere(
        new Brackets((qb) => {
          qb.where("request.receiverId != :receiverId", {
            receiverId: userId,
          });
          qb.orWhere("request.receiverId IS NULL");
        })
      )
      .andWhere(
        new Brackets((qb) => {
          qb.where("request.senderId != :senderId", {
            senderId: userId,
          });
          qb.orWhere("request.senderId IS NULL");
        })
      )
      .andWhere(
        new Brackets((qb) => {
          qb.where("request.senderTeamId NOT IN (:...senderTeamIds)", {
            senderTeamIds: myTeamsIds,
          });
          qb.orWhere("request.senderTeamId IS NULL");
        })
      )
      .andWhere(
        new Brackets((qb) => {
          qb.where("request.receiverTeamId NOT IN (:...receiverTeamIds)", {
            receiverTeamIds: myTeamsIds,
          });
          qb.orWhere("request.receiverTeamId IS NULL");
        })
      )
      .andWhere("event.id NOT IN (:...myEventIds)", { myEventIds });

    if (request.query && request.query.todayEvents === "true") {
      qb.andWhere("event.startDate < :todayEnd", {
        todayEnd: todayDate + " 23:59:59",
      });
    }

    const publicEvents = await qb.getMany();

    const responseData = {
      myEvents: myEvents.map((event) => event.toResponse),
      publicEvents: publicEvents.map((event) => event.toResponse),
    };

    return responseData;
  };

  static list = async (request: Request, response: Response) => {
    const eventRepository = getRepository(Event);
    const count = await eventRepository.count({ withDeleted: true });
    const events = await eventRepository
      .createQueryBuilder("e")
      .select([
        "u.name as creator",
        "startDate",
        "sport",
        "c.name as name",
        "e.id as id",
        "e.tsDeleted as tsDeleted",
        "e.status as status",
        "l.name as location",
        "e.ts_Created as tsCreated",
      ])
      .innerJoin("locations", "l", "l.id = e.locationId")
      .innerJoin("complexes", "c", "c.id = l.complexId")
      .leftJoin("users", "u", "u.id = e.creatorId")
      .where("(e.isDraft is null OR e.isDraft = 0)")
      .orderBy("e.ts_Created", "DESC")
      .withDeleted()
      .limit(15)
      .offset(+request.query.page * 15)
      .getRawMany();
    return {
      count,
      events,
    };
  };

  static getPlayers = async (request: Request, response: Response) => {
    const requestRepository = getCustomRepository(RequestRepository);
    const teamPlayers = await requestRepository
      .createQueryBuilder("r")
      .select("u.name, u.profile_picture, t.name as team, r.status")
      .innerJoin("teams", "t", "t.id = r.senderTeamId OR t.id = r.receiverTeamId")
      .innerJoin("teams_users", "tu", "tu.teamId = t.id")
      .innerJoin("users", "u", "u.id = tu.playerId")
      .where("r.eventId = :id", { id: request.params.id })
      .getRawMany();

    if (teamPlayers.length) return teamPlayers;

    return requestRepository
      .createQueryBuilder("r")
      .select("u.name, u.profile_picture")
      .innerJoin("users", "u", "u.id = r.receiverId OR u.id = r.senderId")
      .where("r.eventId = :id", { id: request.params.id })
      .getRawMany();
  };

  static async createAdminEvent(request: Request, response: Response) {
    const {
      body: { startDate, endDate, notes, name, locationId, sport, status, isWeekly },
    } = request;
    if (new Date(startDate) < new Date()) {
      throw new Error();
    }

    const queryRunner = getManager().connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      let createdEvent: any = false;
      let upgradedStartDate = startDate;
      let upgradedEndDate = endDate;
      let eventsToBeInserted = [];
      for (let i = 0; i <= (isWeekly ? 11 : 0); i++) {
        const incrementedStartDate = EventService.addDays(upgradedStartDate, i);
        const incrementedEndDate = EventService.addDays(upgradedEndDate, i);
        const overlappingEvent = await queryRunner.manager
          .createQueryBuilder()
          .from("events", "e")
          .where(`e.locationId = '${locationId}'`)
          .andWhere("e.status NOT IN (:...statuses)", {
            statuses: [EventStatus.DRAFT, EventStatus.CANCELED, EventStatus.REFUSED],
          })
          .andWhere(
            new Brackets((qb) => {
              qb.where(
                `(e.startDate < '${incrementedEndDate.toISOString()}' AND e.endDate > '${incrementedStartDate.toISOString()}')`
              );
              qb.orWhere(
                `(e.startDate = '${incrementedStartDate.toISOString()}' AND e.endDate = '${incrementedEndDate.toISOString()}')`
              );
            })
          )
          .andWhere("e.ts_deleted IS NULL")
          .setLock("pessimistic_read")
          .getRawOne();

        if (!overlappingEvent) {
          const event = new CreateEventDto();
          event.startDate = incrementedStartDate;
          event.endDate = incrementedEndDate;
          event.isUserReservation = false;
          event.creatorId = response.locals.jwt.userId;
          event.notes = notes;
          event.name = name;
          event.locationId = locationId;
          event.sport = sport;
          event.status = status;
          event.isWeekly = isWeekly ? true : false;
          eventsToBeInserted.push(event);
        }
        if ((isWeekly && eventsToBeInserted.length === 12) || (!isWeekly && eventsToBeInserted.length === 1)) {
          createdEvent = queryRunner.manager.create(Event, eventsToBeInserted);
          if (isWeekly) {
            const weeklyEventGroup = new WeeklyEventGroup();
            weeklyEventGroup.startDate = eventsToBeInserted[0].startDate;
            weeklyEventGroup.endDate = eventsToBeInserted[11].endDate;
            weeklyEventGroup.status = EventStatus.CONFIRMED;
            queryRunner.manager.create(WeeklyEventGroup, new WeeklyEventGroup());
            const createdWeekly = await queryRunner.manager.save(weeklyEventGroup);
            for (const event of eventsToBeInserted) {
              event.weeklyGroupedId = createdWeekly.id;
            }
          }

          createdEvent = await queryRunner.manager.save(createdEvent);
        }
      }

      await queryRunner.commitTransaction();
      return createdEvent;
    } catch (error) {
      console.log({ error });
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  static insert = async (request: Request, response: Response) => {
    const {
      body: {
        startDate,
        endDate,
        notes,
        name,
        locationId,
        sport,
        status,
        isPublic,
        isTeam,
        playersAge,
        playersNumber,
        isWeekly,
        level,
        isUserReservation,
        organiserTeamId,
      },
    } = request;
    if (new Date(startDate) < new Date()) {
      throw new Error();
    }

    const queryRunner = getManager().connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      let createdEvent: any = false;
      let upgradedStartDate = startDate;
      let upgradedEndDate = endDate;
      let eventsToBeInserted = [];
      for (let i = 0; i <= (isWeekly ? 11 : 0); i++) {
        const incrementedStartDate = EventService.addDays(upgradedStartDate, i);
        const incrementedEndDate = EventService.addDays(upgradedEndDate, i);
        const overlappingEvent = await queryRunner.manager
          .createQueryBuilder()
          .from("events", "e")
          .where(`e.locationId = '${locationId}'`)
          .andWhere("e.status NOT IN (:...statuses)", {
            statuses: [EventStatus.DRAFT, EventStatus.CANCELED, EventStatus.REFUSED],
          })
          .andWhere(
            new Brackets((qb) => {
              qb.where(
                `(e.startDate < '${incrementedEndDate.toISOString()}' AND e.endDate > '${incrementedStartDate.toISOString()}')`
              );
              qb.orWhere(
                `(e.startDate = '${incrementedStartDate.toISOString()}' AND e.endDate = '${incrementedEndDate.toISOString()}')`
              );
            })
          )
          .andWhere("e.ts_deleted IS NULL")
          .setLock("pessimistic_read")
          .getRawOne();

        if (!overlappingEvent) {
          const event = new CreateEventDto();
          event.startDate = incrementedStartDate;
          event.endDate = incrementedEndDate;
          event.isUserReservation = false;
          event.creatorId = response.locals.jwt.userId;
          event.notes = notes;
          event.name = name;
          event.locationId = locationId;
          event.sport = sport;
          event.status = status;
          event.isWeekly = isWeekly ? true : false;
          event.isUserReservation = isUserReservation;
          event.isPublic = isPublic;
          event.isTeam = isTeam;
          event.playersAge = playersAge;
          event.playersNumber = playersNumber;
          event.isWeekly = isWeekly;
          event.level = level;
          event.organiserTeamId = organiserTeamId ?? null;
          eventsToBeInserted.push(event);
        }
        if ((isWeekly && eventsToBeInserted.length === 12) || (!isWeekly && eventsToBeInserted.length === 1)) {
          createdEvent = queryRunner.manager.create(Event, eventsToBeInserted);
          if (isWeekly) {
            const weeklyEventGroup = new WeeklyEventGroup();
            weeklyEventGroup.startDate = eventsToBeInserted[0].startDate;
            weeklyEventGroup.endDate = eventsToBeInserted[11].endDate;
            weeklyEventGroup.status = EventStatus.CONFIRMED;
            queryRunner.manager.create(WeeklyEventGroup, new WeeklyEventGroup());
            const createdWeekly = await queryRunner.manager.save(weeklyEventGroup);
            for (const event of eventsToBeInserted) {
              event.weeklyGroupedId = createdWeekly.id;
            }
          }

          createdEvent = await queryRunner.manager.save(createdEvent);
        }
      }

      await queryRunner.commitTransaction();
      return createdEvent;
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  };

  static createDummyTeams = async (event: Event) => {
    const teamRepository = getCustomRepository(TeamRepository);
    const eventRepository = getCustomRepository(EventRepository);
    const dummyTeams = await teamRepository
      .createQueryBuilder("team")
      .insert()
      .values([
        { name: "Ekipi blu", sport: event.sport, isDummy: true },
        { name: "Ekipi kuq", sport: event.sport, isDummy: true },
      ])
      .execute();

    event.organiserTeamId = dummyTeams.generatedMaps[0].id;
    event.receiverTeamId = dummyTeams.generatedMaps[1].id;
    await eventRepository.save(event);
  };

  static createRequest = async (event: Event) => {
    const requestRepository = getCustomRepository(RequestRepository);
    await requestRepository
      .createQueryBuilder("request")
      .insert()
      .values([
        {
          senderId: event.creatorId,
          receiverId: event.creatorId,
          eventId: event.id,
          sport: event.sport,
          status: RequestStatus.CONFIRMED,
        },
      ])
      .execute();
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

    const event = await eventRepository.createQueryBuilder("event").where("event.id = :id", { id: eventId }).getOne();

    return event;
  };

  static patch = async (eventPayload, currentEvent: Event, request: Request) => {
    const eventRepository = getCustomRepository(EventRepository);
    const eventTeamsUsersRepository = getCustomRepository(EventTeamUsersRepository);

    let eventForConfirmation = false;
    let eventToBeCompleted = false;
    if (currentEvent.status === EventStatus.WAITING_FOR_CONFIRMATION) {
      eventForConfirmation = true;
    }
    if (currentEvent.status == EventStatus.CONFIRMED) {
      eventToBeCompleted = true;
    }
    const mergedEvent = eventRepository.merge(currentEvent, eventPayload);
    const updatedEvent = await eventRepository.save(mergedEvent);

    if (eventForConfirmation === true && updatedEvent.status === EventStatus.CONFIRMED) {
      const eventPlayers = await eventTeamsUsersRepository
        .createQueryBuilder("etu")
        .leftJoinAndSelect("etu.teamUser", "tu", "tu.id = etu.teamUserId")
        .leftJoinAndSelect("tu.player", "p", "p.id = tu.playerId")
        .where("etu.eventId = :eventId", { eventId: updatedEvent.id })
        .getMany();

      const mappedPlayersIds = eventPlayers.map((eventPlayers) => eventPlayers.teamUser.player.id);
      let notifications = [];
      for (const player of mappedPlayersIds) {
        const notificationBody = {
          receiverId: player,
          type: NotificationType.EVENT_CONFIRMED,
          payload: { eventId: updatedEvent.id, eventName: updatedEvent.name },
        };
        notifications.push(notificationBody);
      }
      await NotificationService.storeNotification(notifications);
    }

    if (eventToBeCompleted === true && updatedEvent.status === EventStatus.COMPLETED) {
      const eventPlayers = await eventTeamsUsersRepository
        .createQueryBuilder("etu")
        .leftJoinAndSelect("etu.teamUser", "tu", "tu.id = etu.teamUserId")
        .leftJoinAndSelect("tu.player", "p", "p.id = tu.playerId")
        .leftJoinAndSelect("tu.team", "t", "t.id = tu.teamId")
        .where("etu.eventId = :eventId", { eventId: updatedEvent.id })
        .getMany();

      const mappedPlayersIds = eventPlayers.map((eventPlayers) => {
        return {
          id: eventPlayers.teamUser.player.id,
          teamId: eventPlayers.teamUser.team.id,
        };
      });
      const organiserTeamPlayersIds = mappedPlayersIds
        .filter((teamPlayers) => teamPlayers.teamId === updatedEvent.organiserTeamId)
        .map((player) => player.id);
      const receiverTeamPlayersIds = mappedPlayersIds
        .filter((teamPlayers) => teamPlayers.teamId === updatedEvent.receiverTeamId)
        .map((player) => player.id);
      let notifications = [];
      for (const player of mappedPlayersIds) {
        const resultNotificationBody = {
          receiverId: player.id,
          type: NotificationType.EVENT_COMPLETED_RESULT,
          payload: { eventId: updatedEvent.id, eventName: updatedEvent.name },
        };
        const reviewNotificationBody = {
          receiverId: player.id,
          type: NotificationType.EVENT_COMPLETED_REVIEW,
          // TODO: Find opposite players
          payload: {
            eventId: updatedEvent.id,
            eventName: updatedEvent.name,
            oppositePlayersIds:
              player.teamId === updatedEvent.organiserTeamId ? receiverTeamPlayersIds : organiserTeamPlayersIds,
          },
        };
        notifications.push(resultNotificationBody);
        notifications.push(reviewNotificationBody);
      }

      await NotificationService.storeNotification(notifications);
    }

    return updatedEvent;
  };

  static addDays = (date, counter) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + counter * 7);
    newDate.setHours(newDate.getHours());
    newDate.setMinutes(newDate.getMinutes());
    return new Date(newDate.setSeconds(0));
  };
}
