import { Request, Response } from "express";
import { Brackets, getCustomRepository, getRepository } from "typeorm";
import { Functions } from "../../common/utilities/Functions";
import { RequestStatus } from "../../request/entities/request.entity";
import { UserService } from "../../user/services/user.service";
import { Event, EventStatus } from "../entities/event.entity";
import { EventRepository } from "../repositories/event.repository";
import { TeamUsers } from "../../team/entities/team.users.entity";
import { CreateEventDto } from "../dto/create-event.dto";

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
      .innerJoin("event.eventRequests", "request", "request.eventId = event.id")
      .innerJoinAndSelect("event.location", "location")
      .innerJoinAndSelect("location.complex", "complex")
      .innerJoinAndSelect("event.organiserTeam", "senderTeam")
      .innerJoinAndSelect("event.receiverTeam", "receiverTeam")
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

    return savedEvent;
  };

  static getById = async (eventId: number) => {
    const eventRepository = getCustomRepository(EventRepository);

    const event = await eventRepository
      .createQueryBuilder("event")
      .innerJoinAndSelect("event.location", "location")
      .innerJoinAndSelect("location.complex", "complex")
      .where("event.id = :eventId", { eventId })
      .getOne();

    // const teamUsersRepository = getCustomRepository(TeamUsersRepository);

    return event;
  };

  // static update = async (
  //   teamPayload: UpdateTeamDto,
  //   currentTeam: Team,
  //   request: Request
  // ) => {
  //   const teamRepository = getRepository(Team);

  //   if (request.files) {
  //     for (const file of request.files as Array<Express.Multer.File>) {
  //       if (file.originalname === teamPayload.avatarName) {
  //         teamPayload.avatar = file.path;
  //       }
  //       if (file.originalname === teamPayload.bannerName) {
  //         teamPayload.banner = file.path;
  //       }
  //     }
  //   }

  //   const updatedTeam = teamRepository.merge(currentTeam, teamPayload);
  //   await teamRepository.save(updatedTeam);

  //   return updatedTeam;
  // };

  // static deleteById = async (team: Team) => {
  //   const teamRepository = getRepository(Team);

  //   await teamRepository.softDelete(team.id);

  //   const teamUsersRepository = getCustomRepository(TeamUsersRepository);

  //   teamUsersRepository
  //     .createQueryBuilder("teamUsers")
  //     .delete()
  //     .where("teamId = :teamId", { teamId: team.id })
  //     .execute();
  // };

  // static exit = async (team: Team, response: Response) => {
  //   const teamUsersRepository = getCustomRepository(TeamUsersRepository);

  //   const teamRepository = getCustomRepository(TeamRepository);
  //   const creator = await teamRepository
  //     .createQueryBuilder("team")
  //     .where("id = :teamId", { teamId: team.id })
  //     .andWhere("userId = :userId", { userId: response.locals.jwt.userId })
  //     .getOne();

  //   if (creator)
  //     throw "You are a creator! You can not remove yourself from the team";

  //   teamUsersRepository
  //     .createQueryBuilder("teamUsers")
  //     .delete()
  //     .where("teamId = :teamId", { teamId: team.id })
  //     .andWhere("playerId = :userId", { userId: response.locals.jwt.userId })
  //     .execute();
  // };

  // static upload = async (request: Request, response: Response) => {
  //   if (request.files.length) {
  //     const files = [...(request.files as any)];
  //     const attachmentRepository = getCustomRepository(AtachmentRepository);
  //     return attachmentRepository
  //       .createQueryBuilder("attachments")
  //       .insert()
  //       .into(Attachment)
  //       .values(
  //         files.map((file) => {
  //           return {
  //             name: file.filename,
  //             originalName: file.originalname,
  //             mimeType: file.mimetype,
  //             extension: file.mimetype.split("/")[1],
  //             sizeInBytes: file.size,
  //             path: file.path,
  //             teamId: +request.params.teamId,
  //             userId: null,
  //           };
  //         })
  //       )
  //       .execute();
  //   }
  // };
}
