import { Request, Response } from "express";
import { Brackets, getCustomRepository, getRepository } from "typeorm";
import { Functions } from "../../common/utilities/Functions";
import {
  Request as Invitation,
  RequestStatus,
} from "../entities/request.entity";
import { UserService } from "../../user/services/user.service";
import { TeamUsers } from "../../team/entities/team.users.entity";
import { Event } from "../../event/entities/event.entity";
import { UserRepository } from "../../user/repositories/user.repository";
import { RequestRepository } from "../repositories/request.repository";

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
        `user.id NOT IN (select receiverId from requests where eventId =${event.id} )`
      );

    let userQb = `(user.sports `;

    if (request.body.positions.length) {
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

  static listRequestsForEvent = async (
    event: Event,
    request: Request,
    response: Response
  ) => {
    const requestRepository = getCustomRepository(RequestRepository);
    const requests = requestRepository
      .createQueryBuilder("request")
      .innerJoinAndSelect("request.receiver", "receiver")
      .where("request.eventId = :eventId", { eventId: event.id })
      .getMany();

    return requests;
  };

  // static insert = async (
  //   eventPayload: CreateEventDto,
  //   request: Request,
  //   response: Response
  // ) => {
  //   const eventRepository = getCustomRepository(EventRepository);
  //   eventPayload.creatorId = response.locals.jwt.userId;
  //   const createdEvent = eventRepository.create(eventPayload);
  //   const savedEvent = await eventRepository.save(createdEvent);
  //   return savedEvent;
  // };
  // static getById = async (eventId: number) => {
  //   const eventRepository = getCustomRepository(EventRepository);
  //   const event = await eventRepository
  //     .createQueryBuilder("event")
  //     .leftJoinAndSelect("event.location", "location")
  //     .leftJoinAndSelect("location.complex", "complex")
  //     .leftJoinAndSelect("event.organiserTeam", "organiserTeam")
  //     .leftJoinAndSelect("event.receiverTeam", "receiverTeam")
  //     .where("event.id = :id", { id: eventId })
  //     .getOne();
  //   return event.toResponse;
  // };
  // static findById = async (eventId: number) => {
  //   const eventRepository = getCustomRepository(EventRepository);
  //   const event = await eventRepository
  //     .createQueryBuilder("event")
  //     .where("event.id = :id", { id: eventId })
  //     .getOne();
  //   return event;
  // };
  // static update = async (
  //   eventPayload: UpdateEventDto,
  //   currentEvent: Event,
  //   request: Request
  // ) => {
  //   const eventRepository = getCustomRepository(EventRepository);
  //   const updatedEvent = eventRepository.merge(currentEvent, eventPayload);
  //   await eventRepository.save(updatedEvent);
  //   return updatedEvent;
  // };
}
