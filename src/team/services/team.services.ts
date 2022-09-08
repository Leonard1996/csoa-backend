import { Request, Response } from "express";
import { getCustomRepository, getRepository } from "typeorm";
import { User } from "../../user/entities/user.entity";
import { CreateTeamUserDto } from "../dto/create-team-user.dto";
import { CreateTeamDto } from "../dto/create-team.dto";
import { UpdateTeamDto } from "../dto/update-team.dto";
import { Team } from "../entities/team.entity";
import { TeamUsers } from "../entities/team.users.entity";
import { TeamRepository } from "../repositories/team.repository";
import { TeamUsersRepository } from "../repositories/team.users.repository";

export class TeamService {
  static listMyTeams = async (request: Request, response: Response) => {
    const teamUsersRepository = getRepository(TeamUsers);

    const results = await teamUsersRepository.find({
      where: {
        playerId: response.locals.jwt.userId,
      },
      relations: ["team"],
    });

    const responseData = {
      results,
    };

    return results;
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
