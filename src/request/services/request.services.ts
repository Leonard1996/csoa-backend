import { Request, Response } from "express";
import { User } from "../../user/entities/user.entity";
import { Team } from "../../team/entities/team.entity";
import { Brackets, getCustomRepository } from "typeorm";
import { Event, EventStatus } from "../../event/entities/event.entity";
import { UserRepository } from "../../user/repositories/user.repository";
import { RequestRepository } from "../repositories/request.repository";
import { TeamRepository } from "../../team/repositories/team.repository";
import { StatisticsService } from "../../team/services/statistics.services";
import { EventRepository } from "../../event/repositories/event.repository";
import { Request as Invitation, RequestStatus } from "../entities/request.entity";
import { NotificationType } from "../../notifications/entities/notification.entity";
import { TeamUsersRepository } from "../../team/repositories/team.users.repository";
import { NotificationService } from "../../notifications/services/notification.services";

export class RequestService {
  static listPossibleUsersForEvent = async (event: Event, request: Request, response: Response) => {
    const usersRepository = getCustomRepository(UserRepository);
    const teamsUsersRepository = getCustomRepository(TeamUsersRepository);
    const eventRepository = getCustomRepository(EventRepository);
    const sport = event.sport;
    const possibleUsers = usersRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.receivedReviews", "review")
      .where(`user.sports LIKE '%"${sport}":{"picked":true%'`)
      .andWhere(`user.id NOT IN (select receiverId from requests where eventId = ${event.id} )`);

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

    if (request.body.rating) {
      possibleUsers.andWhere(
        `(SELECT SUM(review.value)/COUNT(review.id) AS averageRating group by review.receiverId, review.sport having averageRating >= ${request.body.rating.minRating} and averageRating <= ${request.body.rating.maxRating})`
      );
    }

    if (request.body.playedBefore === true) {
      const myTeams = await teamsUsersRepository
        .createQueryBuilder("tu")
        .select("tu.teamId")
        .where("tu.playerId = :userId", { userId: response.locals.jwt.userId })
        .getMany();

      const myTeamsMapped = myTeams.map((el) => el.teamId);

      const usersPlayedBefore = await eventRepository
        .createQueryBuilder("e")
        .select("DISTINCT u.id")
        .innerJoin("teams_users", "tu", "e.organiserTeamId = tu.teamId OR e.receiverTeamId = tu.teamId")
        .innerJoin("event_teams_users", "etu", "tu.id = etu.teamUserId and e.id = etu.eventId")
        .innerJoin("users", "u", "u.id = tu.playerId")
        .where("e.status = :status", { status: EventStatus.COMPLETED })
        .andWhere(`tu.teamId NOT IN (${myTeamsMapped})`)
        .andWhere(`(e.receiverTeamId IN (${myTeamsMapped}) or e.organiserTeamId IN (${myTeamsMapped}))`)
        .getRawMany();

      const usersPlayedBeforeMapped = usersPlayedBefore.map((el) => el.id);

      possibleUsers.andWhere(`user.id IN (${usersPlayedBeforeMapped})`);
    }

    return possibleUsers.getMany();
  };

  static listInvitationsForEvent = async (event: Event, request: Request, response: Response) => {
    const requestRepository = getCustomRepository(RequestRepository);
    const requests = requestRepository
      .createQueryBuilder("request")
      .innerJoinAndSelect("request.receiver", "receiver")
      .where("request.eventId = :eventId", { eventId: event.id })
      .andWhere("request.senderId != request.receiverId")
      .getMany();

    return requests;
  };

  static inviteUser = async (event: Event, user: User, request: Request, response: Response) => {
    const requestRepository = getCustomRepository(RequestRepository);

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

  static requestToEnter = async (event: Event, request: Request, response: Response) => {
    const requestRepository = getCustomRepository(RequestRepository);
    const receiverId = +response.locals.jwt.userId;

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
      .leftJoinAndSelect("request.event", "e")
      .leftJoinAndSelect("request.receiver", "r")
      .where("request.id = :id", { id: requestId })
      .getOne();
    return request;
  };

  static deleteById = async (request: Invitation) => {
    const requestRepository = getCustomRepository(RequestRepository);
    await requestRepository.delete(request.id);
  };

  static updateRequest = async (requestPayload, originalRequest: Invitation, request: Request) => {
    const requestRepository = getCustomRepository(RequestRepository);
    let requestToBeConfirmed = false;
    let requestToBeRefused = false;
    if (
      originalRequest.status === RequestStatus.WAITING_FOR_CONFIRMATION &&
      requestPayload.status === RequestStatus.CONFIRMED
    ) {
      requestToBeConfirmed = true;
    }
    if (
      originalRequest.status === RequestStatus.WAITING_FOR_CONFIRMATION &&
      requestPayload.status === RequestStatus.REFUSED
    ) {
      requestToBeRefused = true;
    }
    const mergedRequest = requestRepository.merge(originalRequest, requestPayload);
    const updatedRequest = await requestRepository.save(mergedRequest);
    if (requestToBeConfirmed === true && updatedRequest.status === RequestStatus.CONFIRMED) {
      let notifications = [];
      const notificationBody = {
        receiverId: originalRequest.event.creatorId,
        type: NotificationType.REQUEST_CONFIRMED,
        payload: {
          eventName: updatedRequest.event.name,
          playerName: updatedRequest.receiver.name,
          requestId: updatedRequest.id,
        },
      };
      notifications.push(notificationBody);
      await NotificationService.storeNotification(notifications);
    }
    if (requestToBeRefused === true && updatedRequest.status === RequestStatus.REFUSED) {
      let notifications = [];
      const notificationBody = {
        receiverId: originalRequest.event.creatorId,
        type: NotificationType.REQUEST_REFUSED,
        payload: {
          eventName: updatedRequest.event.name,
          playerName: updatedRequest.receiver.name,
          requestId: updatedRequest.id,
        },
      };
      notifications.push(notificationBody);
      await NotificationService.storeNotification(notifications);
    }
    return "Request successfully updated!";
  };

  static listPossibleTeamsForEvent = async (event: Event, request: Request, response: Response) => {
    const teamsRepository = getCustomRepository(TeamRepository);
    const eventRepository = getCustomRepository(EventRepository);
    const sport = event.sport;
    const possibleTeams = teamsRepository
      .createQueryBuilder("team")
      .where("team.sport = :sport", { sport })
      .andWhere("team.isDummy = false")
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

    if (request.body.playedBefore === true) {
      const playedBeforeTeams = await eventRepository
        .createQueryBuilder("event")
        .select("event.organiserTeamId, event.receiverTeamId")
        .where("event.isTeam = true")
        .andWhere("event.status = :status", { status: EventStatus.COMPLETED })
        .andWhere(
          new Brackets((qb) => {
            qb.where("event.organiserTeamId = :organiserTeamId", {
              organiserTeamId: event.organiserTeamId,
            }).orWhere("event.receiverTeamId = :receiverTeamId", {
              receiverTeamId: event.organiserTeamId,
            });
          })
        )
        .getRawMany();

      const playedBeforeTeamsMapped = playedBeforeTeams.map((el) =>
        el.organiserTeamId === event.organiserTeamId ? el.receiverTeamId : el.organiserTeamId
      );
      possibleTeams.andWhere("team.id IN (:playedBeforeTeamsMapped)", {
        playedBeforeTeamsMapped,
      });
    }

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
        if (!possibleTeamsDrawsMapped[draw.organiser]) possibleTeamsDrawsMapped[draw.organiser] = 0;
        possibleTeamsDrawsMapped[draw.organiser] += 1;
        if (!possibleTeamsDrawsMapped[draw.receiver]) possibleTeamsDrawsMapped[draw.receiver] = 0;
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

  static listTeamsInvitationsForEvent = async (event: Event, request: Request, response: Response) => {
    const requestRepository = getCustomRepository(RequestRepository);
    const requests = await requestRepository
      .createQueryBuilder("request")
      .innerJoinAndSelect("request.receiverTeam", "receiverTeam")
      .where("request.eventId = :eventId", { eventId: event.id })
      .getMany();

    const invitedTeamIds = requests.map((invitedTeam) => invitedTeam.receiverTeam.id);

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
        if (!invitedTeamsDrawsMapped[draw.organiser]) invitedTeamsDrawsMapped[draw.organiser] = 0;
        invitedTeamsDrawsMapped[draw.organiser] += 1;
        if (!invitedTeamsDrawsMapped[draw.receiver]) invitedTeamsDrawsMapped[draw.receiver] = 0;
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

  static inviteTeam = async (event: Event, team: Team, request: Request, response: Response) => {
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
