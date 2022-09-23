import { Request, Response } from "express";
import { getCustomRepository, getRepository } from "typeorm";
import { Attachment } from "../../attachment/entities/attachment.entity";
import { AtachmentRepository } from "../../attachment/repositories/attachment.repository";
import { Functions } from "../../common/utilities/Functions";
import { UserService } from "../../user/services/user.service";
import { EventStatus } from "../entities/event.entity";
import { EventRepository } from "../repositories/event.repository";

export class TeamService {
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

    const myEvents = await eventsRepository
      .createQueryBuilder("e")
      .innerJoinAndSelect("e.location", "l")
      .where("e.status IN (:statuses)", {
        statuses: [
          EventStatus.DRAFT,
          EventStatus.WAITING_FOR_CONFIRMATION,
          EventStatus.CONFIRMED,
        ],
      })
      .andWhere("e.startDate > :todayStart", {
        todayStart: todayDate + " 00:00:00",
      })
      .andWhere("e.startDate < :todayEnd", {
        todayEnd: todayDate + " 23:59:59",
      })
      .getMany();

    const publicEvents = await eventsRepository
      .createQueryBuilder("e")
      .where("e.sport IN (:mySports)", { mySports })
      .andWhere("e.isPublic = true")
      .andWhere("e.status = :statuses", {
        statuses: [EventStatus.CONFIRMED, EventStatus.WAITING_FOR_CONFIRMATION],
      });

    console.log(myEvents);

    const responseData = {
      myEvents: myEvents.map((event) => event.toResponse),
    };

    return responseData;
  };

  // static insert = async (
  //   teamPayload: CreateTeamDto,
  //   request: Request,
  //   response: Response
  // ) => {
  //   const teamRepository = getRepository(Team);

  //   const isExisting = await teamRepository.findOne({
  //     where: { name: teamPayload.name, sport: teamPayload.sport },
  //   });
  //   if (isExisting) throw "Team with this name already exists";

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

  //   teamPayload.userId = response.locals.jwt.userId;
  //   const createdTeam = teamRepository.create(teamPayload);
  //   const savedTeam = await teamRepository.save(createdTeam);

  //   const teamUsersRepository = getRepository(TeamUsers);

  //   const teamUserDto = new CreateTeamUserDto();
  //   teamUserDto.sport = savedTeam.sport;
  //   teamUserDto.isConfirmed = true;
  //   teamUserDto.playerId = response.locals.jwt.userId;
  //   teamUserDto.teamId = savedTeam.id;

  //   const createdTeamUser = teamUsersRepository.create(teamUserDto);
  //   await teamUsersRepository.save(createdTeamUser);

  //   return savedTeam;
  // };

  // static getById = async (teamId: number) => {
  //   const teamRepository = getCustomRepository(TeamRepository);

  //   const team = await teamRepository.findById(teamId);

  //   const teamUsersRepository = getCustomRepository(TeamUsersRepository);

  //   if (team) {
  //     const players = await teamUsersRepository
  //       .createQueryBuilder("teamUsers")
  //       .leftJoinAndSelect("teamUsers.player", "player")
  //       .where("teamId = :teamId", { teamId })
  //       .getMany();

  //     const wins = await StatisticsService.getWins([team.id]);
  //     const loses = await StatisticsService.getLoses([team.id]);
  //     const draws = await StatisticsService.getDraws([team.id]);
  //     let lastMatches = await StatisticsService.getLastMatches(team.id);
  //     lastMatches = lastMatches.map((lastMatch) => {
  //       if (lastMatch.isDraw) {
  //         return "draw";
  //       }
  //       if (lastMatch.winnerTeamId === team.id) {
  //         return "win";
  //       }
  //       return "loss";
  //     });
  //     let drawsMapped = {};
  //     for (const draw of draws) {
  //       if (!drawsMapped[draw.organiser]) drawsMapped[draw.organiser] = 0;
  //       drawsMapped[draw.organiser] += 1;
  //       if (!drawsMapped[draw.receiver]) drawsMapped[draw.receiver] = 0;
  //       drawsMapped[draw.receiver] += 1;
  //     }
  //     team["wins"] = +(wins[0]?.wins ?? 0);
  //     team["loses"] = +(loses[0]?.loses ?? 0);
  //     team["draws"] = drawsMapped[team.id] ?? 0;
  //     team["lastMatches"] = lastMatches;
  //     team["players"] = players;
  //   }

  //   return team;
  // };

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
