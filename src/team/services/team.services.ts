import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { User } from "../../user/entities/user.entity";
import { CreateTeamDto } from "../dto/create-team.dto";
import { Team } from "../entities/team.entity";
import { TeamUsers } from "../entities/team.users.entity";

export class TeamService {
  static listMyTeams = async (request: Request, response: Response) => {
    const teamUsersRepository = getRepository(TeamUsers);

    const results = await teamUsersRepository.find({
      where: {
        playerId: response.locals.jwt.userId,
      },
      relations: ["team"],
    });

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

    const userRepository = getRepository(User);

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
    return teamRepository.save(createdTeam);
  };
}
