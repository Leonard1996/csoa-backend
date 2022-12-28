import Axios from "axios";
import { Request, Response } from "express";
import { getCustomRepository, getRepository } from "typeorm";
import { Request as Invitation, RequestStatus } from "../../request/entities/request.entity";
import { TeamUsers } from "../../team/entities/team.users.entity";
import { User } from "../../user/entities/user.entity";
import { Notification, NotificationType } from "../entities/notification.entity";
import { NotificationRepository } from "../repositories/notification.repository";

export class NotificationService {
  static listMyNotifications = async (request: Request, response: Response) => {
    const notificationRepository = getCustomRepository(NotificationRepository);
    const userId = response.locals.jwt.userId;

    const myNotifications = await notificationRepository
      .createQueryBuilder("notification")
      .where("receiverId = :userId", { userId })
      .getMany();

    return myNotifications;
  };

  static listMyComplexNotifications = async (request: Request, response: Response) => {
    const notificationRepository = getCustomRepository(NotificationRepository);
    const eventId = request.params.complexId;

    const myNotifications = await notificationRepository
      .createQueryBuilder("notification")
      .where("complexId = :eventId", { eventId })
      .getMany();

    return myNotifications;
  };

  static findById = async (id: number) => {
    const notificationRepository = getCustomRepository(NotificationRepository);

    const notification = await notificationRepository
      .createQueryBuilder("notification")
      .where("notification.id = :id", { id })
      .getOne();

    return notification;
  };

  static updateNotification = async (notification: Notification) => {
    const notificationRepository = getRepository(Notification);

    const updatedNotification = await notificationRepository.update(notification, { isRead: true });

    return updatedNotification;
  };

  static pushChatNotification = async (request: Request, response: Response) => {
    const userRepository = getRepository(User);
    const body = request.body;
    if (body.type === NotificationType.CHAT_USER) {
      const receiverId = body.payload.userId;
      const senderId = response.locals.jwt.userId;
      const receiverUser = await userRepository
        .createQueryBuilder("user")
        .where("user.id = :receiverId", { receiverId })
        .getOne();
      const senderUser = await userRepository
        .createQueryBuilder("user")
        .where("user.id = :senderId", { senderId })
        .getOne();
      const notificationBody = {
        receiverId: receiverUser.id,
        senderId: senderUser.id,
        type: NotificationType.CHAT_USER,
        payload: {
          eventChat: body.eventChat,
          exponentPushToken: receiverUser.pushToken,
          title: `Mesazh i ri nga ${senderUser.name}`,
          body: body.payload.message,
        },
      };
      const pushNotifications = [];
      const pushNotificationBody = {
        to: receiverUser.pushToken,
        title: `Mesazh i ri nga ${senderUser.name}`,
        body: body.payload.message,
        data: { eventChat: body.eventChat },
      };
      pushNotifications.push(pushNotificationBody);
      NotificationService.storeNotification(notificationBody);
      NotificationService.pushNotification(pushNotifications);
    }

    if (body.type === NotificationType.CHAT_TEAM) {
      const teamUsersRepository = getRepository(TeamUsers);
      const teamPlayers = await teamUsersRepository
        .createQueryBuilder("teamUser")
        .leftJoinAndSelect("teamUser.player", "user")
        .where("teamUser.teamId = :teamId", { teamId: body.payload.teamId })
        .andWhere("teamUser.status = :status", { status: RequestStatus.CONFIRMED })
        .getMany();
      const senderId = response.locals.jwt.userId;
      const senderName = await userRepository
        .createQueryBuilder("user")
        .select("user.name")
        .where("user.id = :senderId", { senderId })
        .getOne();
      let notifications = [];
      for (const teamPlayer of teamPlayers) {
        const notificationBody = {
          receiverId: teamPlayer.player.id,
          senderId: senderId,
          type: NotificationType.CHAT_TEAM,
          payload: {
            eventChat: body.eventChat,
            exponentPushToken: teamPlayer.player.pushToken,
            title: `Mesazh i ri nga ${senderName}`,
            body: body.payload.message,
          },
        };
        notifications.push(notificationBody);
      }
      NotificationService.storeNotification(notifications);

      const tokens = teamPlayers.map((teamPlayer) => teamPlayer.player.pushToken);
      const pushNotifications = [];
      const pushNotificationBody = {
        to: tokens,
        title: `Mesazh i ri nga ${senderName}`,
        body: body.payload.message,
        data: { eventChat: body.eventChat },
      };
      pushNotifications.push(pushNotificationBody);
      NotificationService.pushNotification(pushNotifications);
    }

    if (body.type === NotificationType.CHAT_EVENT) {
      const requestsRepository = getRepository(Invitation);
      const eventPlayers = await requestsRepository
        .createQueryBuilder("request")
        .leftJoinAndSelect("request.receiver", "user")
        .where("request.eventId = :eventId", { eventId: body.payload.eventId })
        .andWhere("request.status = :status", { status: RequestStatus.CONFIRMED })
        .getMany();
      const senderId = response.locals.jwt.userId;
      const senderName = await userRepository
        .createQueryBuilder("user")
        .select("user.name")
        .where("user.id = :senderId", { senderId })
        .getOne();
      let notifications = [];
      for (const eventPlayer of eventPlayers) {
        const notificationBody = {
          receiverId: eventPlayer.receiver.id,
          senderId: senderId,
          type: NotificationType.CHAT_EVENT,
          payload: {
            eventChat: body.eventChat,
            exponentPushToken: eventPlayer.receiver.pushToken,
            title: `Mesazh i ri nga ${senderName}`,
            body: body.payload.message,
          },
        };
        notifications.push(notificationBody);
      }
      NotificationService.storeNotification(notifications);

      const tokens = eventPlayers.map((eventPlayer) => eventPlayer.receiver.pushToken);
      const pushNotifications = [];
      const pushNotificationBody = {
        to: tokens,
        title: `Mesazh i ri nga ${senderName}`,
        body: body.payload.message,
        data: { eventChat: body.eventChat },
      };
      pushNotifications.push(pushNotificationBody);
      NotificationService.pushNotification(pushNotifications);
    }
  };

  static storeNotification = async (payload) => {
    const notificationRepository = getCustomRepository(NotificationRepository);
    await notificationRepository.createQueryBuilder("notification").insert().values(payload).execute();
    return "Notification successfully created!";
  };

  static pushNotification = async (payload) => {
    const PUSH_TOKEN_BASE_API = "https://exp.host/--/api/v2/push/send";
    const headers = {
      host: "exp.host",
      accept: "application/json",
      "accept-encoding": "gzip, deflate",
      "content-type": "application/json",
    };

    for (const body of payload) {
      const response = await Axios.post(PUSH_TOKEN_BASE_API, body, { headers });
    }
  };
}
