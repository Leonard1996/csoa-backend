import { Request, Response } from "express";
import { Team } from "../entities/team.entity";
import { User } from "../../user/entities/user.entity";
import { getCustomRepository, getRepository } from "typeorm";
import { UserRepository } from "../../user/repositories/user.repository";
import { TeamUsers, TeamUserStatus } from "../entities/team.users.entity";
import { TeamUsersRepository } from "../repositories/team.users.repository";

export class TeamUsersService {
  static listPossiblePlayers = async (team: Team, request: Request, response: Response) => {
    const usersRepository = getCustomRepository(UserRepository);
    const sport = team.sport;
    const sportsMapped = {
      Futboll: "football",
      Basketboll: "basketball",
      Tenis: "tenis",
      Volejboll: "voleyball",
    };

    const possibleUsers = usersRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.receivedReviews", "review")
      .where(`user.sports LIKE '%"${sportsMapped[sport]}":{"picked":true%'`)
      .andWhere(`user.id NOT IN (select playerId from teams_users where teamId = ${team.id} )`);

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

    // if (request.body.playedBefore === true) {
    //   const myTeams = await teamsUsersRepository
    //     .createQueryBuilder("tu")
    //     .select("tu.teamId")
    //     .where("tu.playerId = :userId", { userId: response.locals.jwt.userId })
    //     .getMany();

    //   const myTeamsMapped = myTeams.map((el) => el.teamId);

    //   const usersPlayedBefore = await eventRepository
    //     .createQueryBuilder("e")
    //     .select("DISTINCT u.id")
    //     .innerJoin("teams_users", "tu", "e.organiserTeamId = tu.teamId OR e.receiverTeamId = tu.teamId")
    //     .innerJoin("event_teams_users", "etu", "tu.id = etu.teamUserId and e.id = etu.eventId")
    //     .innerJoin("users", "u", "u.id = tu.playerId")
    //     .where("e.status = :status", { status: EventStatus.COMPLETED })
    //     .andWhere(`tu.teamId NOT IN (${myTeamsMapped})`)
    //     .andWhere(`(e.receiverTeamId IN (${myTeamsMapped}) or e.organiserTeamId IN (${myTeamsMapped}))`)
    //     .getRawMany();

    //   const usersPlayedBeforeMapped = usersPlayedBefore.map((el) => el.id);

    //   possibleUsers.andWhere(`user.id IN (${usersPlayedBeforeMapped})`);
    // }

    return possibleUsers.getMany();
  };

  static inviteUser = async (team: Team, user: User, request: Request, response: Response) => {
    const teamUsersRepository = getCustomRepository(TeamUsersRepository);

    const payload = {
      sport: team.sport,
      isConfirmed: false,
      playerId: user.id,
      teamId: team.id,
      status: TeamUserStatus.WAITING_FOR_CONFIRMATION,
    };

    const createdInvitation = teamUsersRepository.create(payload);
    await teamUsersRepository.save(createdInvitation);

    return createdInvitation;
  };

  static listInvitationsForTeam = async (team: Team, request: Request, response: Response) => {
    const teamUsersRepository = getCustomRepository(TeamUsersRepository);
    const invitations = teamUsersRepository
      .createQueryBuilder("tu")
      .where("tu.teamId = :teamId", { teamId: team.id })
      .getMany();

    return invitations;
  };

  static findOne = async (teamUserId: number) => {
    const teamUsersRepository = getCustomRepository(TeamUsersRepository);

    const teamUser = await teamUsersRepository
      .createQueryBuilder("tu")
      .where("tu.id = :id", { id: teamUserId })
      .getOne();

    return teamUser;
  };

  static updateInvitation = async (invitationPayload, teamUser: TeamUsers, request: Request) => {
    const teamUsersRepository = getCustomRepository(TeamUsersRepository);
    let invitationToBeConfirmed = false;
    let invitationToBeRefused = false;
    // if (
    //   teamUser.status === TeamUserStatus.WAITING_FOR_CONFIRMATION &&
    //   invitationPayload.status === TeamUserStatus.CONFIRMED
    // ) {
    //   invitationToBeConfirmed = true;
    // }
    // if (
    //   teamUser.status === TeamUserStatus.WAITING_FOR_CONFIRMATION &&
    //   invitationPayload.status === TeamUserStatus.REFUSED
    // ) {
    //   invitationToBeRefused = true;
    // }
    const mergedInvitation = teamUsersRepository.merge(teamUser, invitationPayload);
    const updatedInvitation = await teamUsersRepository.save(mergedInvitation);
    // if (invitationToBeConfirmed === true && updatedInvitation.status === TeamUserStatus.CONFIRMED) {
    //   let notifications = [];
    //   const notificationBody = {
    //     receiverId: teamUser.playerId,
    //     type: NotificationType.REQUEST_CONFIRMED,
    //     payload: {
    //       eventName: updatedInvitation.event.name,
    //       playerName: updatedInvitation.receiver.name,
    //       requestId: updatedInvitation.id,
    //     },
    //   };
    //   notifications.push(notificationBody);
    //   await NotificationService.storeNotification(notifications);
    // }
    // if (invitationToBeRefused === true && updatedInvitation.status === TeamUserStatus.REFUSED) {
    //   let notifications = [];
    //   const notificationBody = {
    //     receiverId: teamUser.event.creatorId,
    //     type: NotificationType.REQUEST_REFUSED,
    //     payload: {
    //       eventName: updatedInvitation1.event.name,
    //       playerName: updatedInvitation1.receiver.name,
    //       requestId: updatedInvitation1.id,
    //     },
    //   };
    //   notifications.push(notificationBody);
    //   await NotificationService.storeNotification(notifications);
    // }
    return "Request successfully updated!";
  };

  static deleteById = async (teamUser: TeamUsers) => {
    const teamUserRepository = getRepository(TeamUsers);

    await teamUserRepository.softDelete(teamUser.id);
  };
}
