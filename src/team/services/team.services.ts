import { Request, Response } from "express";
import { Brackets, getCustomRepository, getRepository } from "typeorm";
import { EventRepository } from "../../event/entities/repositories/event.repository";
import { User } from "../../user/entities/user.entity";
import { CreateTeamUserDto } from "../dto/create-team-user.dto";
import { CreateTeamDto } from "../dto/create-team.dto";
import { UpdateTeamDto } from "../dto/update-team.dto";
import { Team } from "../entities/team.entity";
import { TeamUsers } from "../entities/team.users.entity";
import { TeamRepository } from "../repositories/team.repository";
import { TeamUsersRepository } from "../repositories/team.users.repository";
import { StatisticsService } from "./statistics.services";

export class TeamService {
  static listMyTeams = async (request: Request, response: Response) => {
    const teamUsersRepository = getRepository(TeamUsers);

    const myTeams = await teamUsersRepository.find({
      where: {
        playerId: response.locals.jwt.userId,
      },
      relations: ["team"],
    });

    const teamCustomRepository = getCustomRepository(TeamRepository);
    const eventCustomRepository = getCustomRepository(EventRepository);

    const similiarTeams = await teamCustomRepository
      .createQueryBuilder("teams")
      .innerJoin("teams_users", "tu", "teams.id = tu.teamId")
      .where("tu.playerId != :id", { id: response.locals.jwt.userId })
      .limit(5)
      .offset(+request.query.page || 0 * 5)
      .getMany();

    const myTeamsIds = myTeams.map((player) => player.team.id);
    const similiarTeamsIds = similiarTeams.map((teams) => teams.id);
    let myWins = [];
    let myLoses = [];
    let myDraws = [];
    let similiarWins = [];
    let similiarLoses = [];
    let similiarDraws = [];
    if (myTeamsIds.length) {
      myWins = await StatisticsService.getMyWins(myTeamsIds);
      myLoses = await StatisticsService.getMyLoses(myTeamsIds);
      myDraws = await StatisticsService.getMyDraws(myTeamsIds);
    }

    // if (similiarTeamsIds.length) {
    //   similiarWins = await StatisticsService.getMyWins(similiarTeamsIds);
    // }

    const myTeamsWinsMapped = {};
    if (myWins.length) {
      for (const win of myWins) {
        myTeamsWinsMapped[win.winnerId] = win;
      }
    }

    const myTeamsLosesMapped = {};
    if (myLoses.length) {
      for (const lose of myLoses) {
        myTeamsLosesMapped[lose.loserId] = lose;
      }
    }

    const myTeamsDrawsMapped = {};
    if (myDraws.length) {
      for (const draw of myDraws) {
        if (!myTeamsDrawsMapped[draw.organiser])
          myTeamsDrawsMapped[draw.organiser] = 0;
        myTeamsDrawsMapped[draw.organiser] += 1;
        if (!myTeamsDrawsMapped[draw.receiver])
          myTeamsDrawsMapped[draw.receiver] = 0;
        myTeamsDrawsMapped[draw.receiver] += 1;
      }
    }

    const myTeamsData = myTeams.map((team) => ({
      ...team.team,
      wins: Object.keys(myTeamsWinsMapped).length
        ? +myTeamsWinsMapped[team.team.id].wins
        : 0,
      loses: Object.keys(myTeamsLosesMapped).length
        ? +myTeamsLosesMapped[team.team.id].loses
        : 0,
      draws: Object.keys(myTeamsDrawsMapped).length
        ? myTeamsDrawsMapped[team.team.id]
        : 0,
    }));

    const responseData = {
      myTeamsData,
      similiarTeams,
    };

    return responseData;
  };

  static insert = async (
    teamPayload: CreateTeamDto,
    request: Request,
    response: Response
  ) => {
    const teamRepository = getRepository(Team);

    const isExisting = await teamRepository.findOne({
      where: { name: teamPayload.name, sport: teamPayload.sport },
    });
    if (isExisting) throw "Team with this name already exists";

    if (request.files) {
      for (const file of request.files as Array<Express.Multer.File>) {
        if (file.originalname === teamPayload.avatarName) {
          teamPayload.avatar = file.path;
        }
        if (file.originalname === teamPayload.bannerName) {
          teamPayload.banner = file.path;
        }
      }
    }

    teamPayload.userId = response.locals.jwt.userId;
    const createdTeam = teamRepository.create(teamPayload);
    const savedTeam = await teamRepository.save(createdTeam);

    const teamUsersRepository = getRepository(TeamUsers);

    const teamUserDto = new CreateTeamUserDto();
    teamUserDto.sport = savedTeam.sport;
    teamUserDto.isConfirmed = true;
    teamUserDto.playerId = response.locals.jwt.userId;
    teamUserDto.teamId = savedTeam.id;

    const createdTeamUser = teamUsersRepository.create(teamUserDto);
    await teamUsersRepository.save(createdTeamUser);

    return savedTeam;
  };

  static getById = async (teamId: number) => {
    const teamRepository = getCustomRepository(TeamRepository);

    const team = await teamRepository.findById(teamId);

    const teamUsersRepository = getCustomRepository(TeamUsersRepository);

    if (team) {
      const players = await teamUsersRepository
        .createQueryBuilder("teamUsers")
        .leftJoinAndSelect("teamUsers.player", "player")
        .where("teamId = :teamId", { teamId })
        .getMany();

      team["players"] = players;
    }

    return team;
  };

  static update = async (
    teamPayload: UpdateTeamDto,
    currentTeam: Team,
    request: Request
  ) => {
    const teamRepository = getRepository(Team);

    if (request.files) {
      for (const file of request.files as Array<Express.Multer.File>) {
        if (file.originalname === teamPayload.avatarName) {
          teamPayload.avatar = file.path;
        }
        if (file.originalname === teamPayload.bannerName) {
          teamPayload.banner = file.path;
        }
      }
    }

    const updatedTeam = teamRepository.merge(currentTeam, teamPayload);
    await teamRepository.save(updatedTeam);

    return updatedTeam;
  };

  static deleteById = async (team: Team) => {
    const teamRepository = getRepository(Team);

    await teamRepository.softDelete(team.id);

    const teamUsersRepository = getCustomRepository(TeamUsersRepository);

    teamUsersRepository
      .createQueryBuilder("teamUsers")
      .delete()
      .where("teamId = :teamId", { teamId: team.id })
      .execute();
  };

  static exit = async (team: Team, response: Response) => {
    const teamUsersRepository = getCustomRepository(TeamUsersRepository);

    const teamRepository = getCustomRepository(TeamRepository);
    const creator = await teamRepository
      .createQueryBuilder("team")
      .where("id = :teamId", { teamId: team.id })
      .andWhere("userId = :userId", { userId: response.locals.jwt.userId })
      .getOne();

    if (creator)
      throw "You are a creator! You can not remove yourself from the team";

    teamUsersRepository
      .createQueryBuilder("teamUsers")
      .delete()
      .where("teamId = :teamId", { teamId: team.id })
      .andWhere("playerId = :userId", { userId: response.locals.jwt.userId })
      .execute();
  };
}
