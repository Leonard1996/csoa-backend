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

    return possibleTeams.getMany();
  };

  static listTeamsInvitationsForEvent = async (
    event: Event,
    request: Request,
    response: Response
  ) => {
    const requestRepository = getCustomRepository(RequestRepository);
    const requests = requestRepository
      .createQueryBuilder("request")
      .innerJoinAndSelect("request.receiverTeam", "receiverTeam")
      .where("request.eventId = :eventId", { eventId: event.id })
      .getMany();

    return requests;
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
