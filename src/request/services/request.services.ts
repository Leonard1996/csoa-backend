import { Request, Response } from "express";
import { getCustomRepository, getRepository } from "typeorm";
import {
  Request as Invitation,
  RequestStatus,
} from "../entities/request.entity";
import { Event } from "../../event/entities/event.entity";
import { UserRepository } from "../../user/repositories/user.repository";
import { RequestRepository } from "../repositories/request.repository";
import { User } from "../../user/entities/user.entity";
import { TeamRepository } from "../../team/repositories/team.repository";
import { Team } from "../../team/entities/team.entity";
import { StatisticsService } from "../../team/services/statistics.services";

export class RequestService {
  static listPossibleUsersForEvent = async (
    event: Event,
    request: Request,
    response: Response
  ) => {
    const usersRepository = getCustomRepository(UserRepository);
    const sport = event.sport;
    const possibleUsers = usersRepository
      .createQueryBuilder("user")
      .where(`user.sports LIKE '%"${sport}": {"picked": true%'`)
      .andWhere(
        `user.id NOT IN (select receiverId from requests where eventId = ${event.id} )`
      );

    let userQb = `(user.sports `;

    if (request.body.positions?.length) {
      request.body.positions.forEach((position, _index) => {
        if (_index === 0) {
          userQb += `LIKE '%${position}%' `;
        } else userQb += ` OR '%${position}%' `;
      });
      userQb += ")";
      possibleUsers.andWhere(userQb);
    }

    if (request.body.level) {
      const level = request.body.level;
      possibleUsers.andWhere(`user.sports LIKE '%${level}%'`);
    }

    //TODO: Implement reviewFilter and playedBeforeFilter

    return possibleUsers.getMany();
  };

  static listInvitationsForEvent = async (
    event: Event,
    request: Request,
    response: Response
  ) => {
    const requestRepository = getCustomRepository(RequestRepository);
    const requests = requestRepository
      .createQueryBuilder("request")
      .innerJoinAndSelect("request.receiver", "receiver")
      .where("request.eventId = :eventId", { eventId: event.id })
      .andWhere("request.senderId != request.receiverId")
      .getMany();

    return requests;
  };

  static inviteUser = async (
    event: Event,
    user: User,
    request: Request,
    response: Response
  ) => {
    const requestRepository = getCustomRepository(RequestRepository);
    console.log(response.locals.jwt);

    const senderId = +response.locals.jwt.userId;
    const payload = {
      senderId: senderId,
      receiverId: user.id,
      eventId: event.id,
      sport: event.sport,
      status: RequestStatus.WAITING_FOR_CONFIRMATION,
    };

    const createdRequest = requestRepository.create(payload);
    await requestRepository.save(createdRequest);

    return createdRequest;
  };

  static requestToEnter = async (
    event: Event,
    request: Request,
    response: Response
  ) => {
    const requestRepository = getCustomRepository(RequestRepository);
    const receiverId = +response.locals.jwt.userId;
    console.log(event);

    const payload = {
      senderId: event.creatorId,
      receiverId: receiverId,
      eventId: event.id,
      sport: event.sport,
      status: RequestStatus.WAITING_FOR_CONFIRMATION,
      isRequest: true,
    };

    const createdRequest = requestRepository.create(payload);
    await requestRepository.save(createdRequest);

    return createdRequest;
  };

  static findById = async (requestId: number) => {
    const requestRepository = getCustomRepository(RequestRepository);
    const request = await requestRepository
      .createQueryBuilder("request")
      .where("request.id = :id", { id: requestId })
      .getOne();
    return request;
  };

  static deleteById = async (request: Invitation) => {
    const requestRepository = getCustomRepository(RequestRepository);
    await requestRepository.delete(request.id);
  };

  static updateRequest = async (
    requestPayload,
    originalRequest: Invitation,
    request: Request
  ) => {
    const requestRepository = getCustomRepository(RequestRepository);
    const updatedRequest = requestRepository.merge(
      originalRequest,
      requestPayload
    );
    return await requestRepository.save(updatedRequest);
  };

  static listPossibleTeamsForEvent = async (
    event: Event,
    request: Request,
    response: Response
  ) => {
    const teamsRepository = getCustomRepository(TeamRepository);
    const sport = event.sport;
    const possibleTeams = teamsRepository
      .createQueryBuilder("team")
      .where("team.sport = :sport", { sport })
      .andWhere("team.id != :organiserTeamId", {
        organiserTeamId: event.organiserTeamId,
      });

    if (request.body.level) {
      possibleTeams.andWhere("team.level = :level", {
        level: request.body.level,
      });
    }

    if (request.body.ageRange) {
      possibleTeams.andWhere("team.ageRange = :ageRange", {
        ageRange: request.body.ageRange,
      });
    }

    // if (request.body.playedBefore = true) {
    //   possibleTeams.leftJoinAndSelect('events', 'event')
    //   possibleTeams.andWhere('event.organiserTeamId ')

    // }

    //TODO: Implement playedBeforeFilter

    const results = await possibleTeams.getMany();

    const possibleTeamsIds = results.map((team) => team.id);

    let possibleTeamWins = [];
    let possibleTeamLoses = [];
    let possibleTeamDraws = [];
    if (results.length) {
      possibleTeamWins = await StatisticsService.getWins(possibleTeamsIds);
      possibleTeamLoses = await StatisticsService.getLoses(possibleTeamsIds);
      possibleTeamDraws = await StatisticsService.getDraws(possibleTeamsIds);
    }

    const possibleTeamsWinsMapped = {};
    if (possibleTeamWins.length) {
      for (const win of possibleTeamWins) {
        possibleTeamsWinsMapped[win.winnerId] = win;
      }
    }

    const possibleTeamsLosesMapped = {};
    if (possibleTeamLoses.length) {
      for (const lose of possibleTeamLoses) {
        possibleTeamsLosesMapped[lose.loserId] = lose;
      }
    }

    const possibleTeamsDrawsMapped = {};
    if (possibleTeamDraws.length) {
      for (const draw of possibleTeamDraws) {
        if (!possibleTeamsDrawsMapped[draw.organiser])
          possibleTeamsDrawsMapped[draw.organiser] = 0;
        possibleTeamsDrawsMapped[draw.organiser] += 1;
        if (!possibleTeamsDrawsMapped[draw.receiver])
          possibleTeamsDrawsMapped[draw.receiver] = 0;
        possibleTeamsDrawsMapped[draw.receiver] += 1;
      }
    }

    return results.map((possibleTeam) => ({
      ...possibleTeam,
      wins: +(possibleTeamsWinsMapped[possibleTeam.id]?.wins ?? 0),
      loses: +(possibleTeamsLosesMapped[possibleTeam.id]?.wins ?? 0),
      draws: possibleTeamsDrawsMapped[possibleTeam.id] ?? 0,
    }));
  };

  static listTeamsInvitationsForEvent = async (
    event: Event,
    request: Request,
    response: Response
  ) => {
    const requestRepository = getCustomRepository(RequestRepository);
    const requests = await requestRepository
      .createQueryBuilder("request")
      .innerJoinAndSelect("request.receiverTeam", "receiverTeam")
      .where("request.eventId = :eventId", { eventId: event.id })
      .getMany();

    const invitedTeamIds = requests.map(
      (invitedTeam) => invitedTeam.receiverTeam.id
    );

    let invitedTeamsWins = [];
    let invitedTeamsLoses = [];
    let invitedTeamsDraws = [];
    if (requests.length) {
      invitedTeamsWins = await StatisticsService.getWins(invitedTeamIds);
      invitedTeamsLoses = await StatisticsService.getLoses(invitedTeamIds);
      invitedTeamsDraws = await StatisticsService.getDraws(invitedTeamIds);
    }

    const invitedTeamsWinsMapped = {};
    if (invitedTeamsWins.length) {
      for (const win of invitedTeamsWins) {
        invitedTeamsWinsMapped[win.winnerId] = win;
      }
    }

    const invitedTeamsLosesMapped = {};
    if (invitedTeamsLoses.length) {
      for (const lose of invitedTeamsLoses) {
        invitedTeamsLosesMapped[lose.loserId] = lose;
      }
    }

    const invitedTeamsDrawsMapped = {};
    if (invitedTeamsDraws.length) {
      for (const draw of invitedTeamsDraws) {
        if (!invitedTeamsDrawsMapped[draw.organiser])
          invitedTeamsDrawsMapped[draw.organiser] = 0;
        invitedTeamsDrawsMapped[draw.organiser] += 1;
        if (!invitedTeamsDrawsMapped[draw.receiver])
          invitedTeamsDrawsMapped[draw.receiver] = 0;
        invitedTeamsDrawsMapped[draw.receiver] += 1;
      }
    }

    return requests.map((request) => ({
      ...request,
      receiverTeam: {
        ...request.receiverTeam,
        wins: +(invitedTeamsWinsMapped[request.receiverTeam.id]?.wins ?? 0),
        loses: +(invitedTeamsLosesMapped[request.receiverTeam.id]?.wins ?? 0),
        draws: invitedTeamsDrawsMapped[request.receiverTeam.id] ?? 0,
      },
    }));
  };

  static inviteTeam = async (
    event: Event,
    team: Team,
    request: Request,
    response: Response
  ) => {
    const requestRepository = getCustomRepository(RequestRepository);
    const payload = {
      senderTeamId: event.organiserTeamId,
      receiverTeamId: team.id,
      eventId: event.id,
      sport: event.sport,
      status: RequestStatus.WAITING_FOR_CONFIRMATION,
    };

    const createdRequest = requestRepository.create(payload);
    await requestRepository.save(createdRequest);

    return createdRequest;
  };
}
