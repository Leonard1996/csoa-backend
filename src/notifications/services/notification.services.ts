import Axios from "axios";
import { Request, Response } from "express";
import { getCustomRepository, getRepository } from "typeorm";
import { Notification } from "../entities/notification.entity";
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
