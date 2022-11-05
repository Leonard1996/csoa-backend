import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { eventEmitter } from "../../app";
import { AttachmentService } from "../../attachment/services/attachment.services";
import { ERROR_MESSAGES } from "../../common/utilities/ErrorMessages";
import { ErrorResponse } from "../../common/utilities/ErrorResponse";
import { Helper } from "../../common/utilities/Helper";
import { HttpStatusCode } from "../../common/utilities/HttpStatusCodes";
import { SuccessResponse } from "../../common/utilities/SuccessResponse";
import { Location } from "../../complex/entities/location.entity";
import { User } from "../../user/entities/user.entity";
import { Event } from "../entities/event.entity";
import { EventService } from "../services/event.services";
const events = require("events");

export class EventController {
  static listMyEvents = async (request: Request, response: Response) => {
    try {
      const results = await EventService.listMyEvents(request, response);
      return response
        .status(HttpStatusCode.OK)
        .send(new SuccessResponse({ results }));
    } catch (err) {
      console.log({ err });
      return response
        .status(404)
        .send(new ErrorResponse("Could not get my events list"));
    }
  };

  static list = async (request: Request, response: Response) => {
    try {
      const { events, count } = await EventService.list(request, response);
      return response
        .status(HttpStatusCode.OK)
        .send(new SuccessResponse({ events, count }));
    } catch (err) {
      console.log({ err });
      return response
        .status(404)
        .send(new ErrorResponse("Could not get my events"));
    }
  };

  public static async toggleEvent(request: Request, response: Response) {
    try {
      const eventRepository = getRepository(Event);
      const event = await eventRepository.findOneOrFail({
        where: { id: +request.params.id },
        withDeleted: true,
      });
      if (!event.tsDeleted) await eventRepository.softDelete(event.id);
      else {
        event.tsDeleted = null;
        await eventRepository.save(event);
      }
      return response.status(200).send(new SuccessResponse({ event }));
    } catch (err) {
      console.log({ err });
      return response
        .status(404)
        .send(new ErrorResponse("Could not update event status"));
    }
  }

  static getPlayers = async (request: Request, response: Response) => {
    try {
      const players = await EventService.getPlayers(request, response);
      return response
        .status(HttpStatusCode.OK)
        .send(new SuccessResponse({ players }));
    } catch (err) {
      console.log({ err });
      return response
        .status(404)
        .send(new ErrorResponse("Could not get my players"));
    }
  };

  static insert = async (request: Request, response: Response) => {
    try {
      const event = await EventService.insert(request.body, request, response);
      response.status(HttpStatusCode.OK).send(new SuccessResponse({ event }));
    } catch (err) {
      console.log(err);
      return response.status(400).send(new ErrorResponse(err));
    }
  };

  static createAdminEvent = async (request: Request, response: Response) => {
    try {
      const event = await EventService.createAdminEvent(request, response);
      eventEmitter.emit("new-event", event);
      if (!event) throw Error();
      return response
        .status(HttpStatusCode.OK)
        .send(new SuccessResponse({ event }));
    } catch (err) {
      console.log(err);
      return response
        .status(404)
        .send(new ErrorResponse("Eventi nuk u krijua"));
    }
  };

  static newEventsEmitter = async (request: Request, response: any) => {
    try {
      eventEmitter.once("new-event", async (payload) => {
        if (!payload) return;
        const user = await getRepository(User).findOne({
          where: { id: request.params.userId },
        });
        if (user.role === "admin") {
          response.sse("new-event", {
            welcomeMsg: "Connection established!",
          });
        } else if (user.role === "company") {
          const { complexId } = await getRepository(Location).findOne({
            where: { id: payload.locationId },
          });
          if (complexId === user.complexId) {
            response.sse("new-event", {
              welcomeMsg: "Connection established!",
            });
          }
        }
      });
    } catch (err) {
      console.log({ err });
      return response
        .status(404)
        .send(new ErrorResponse("Could not get my events list"));
    }
  };

  // static insert = async (request: Request, response: Response) => {
  //   try {
  //     const teamPayload = JSON.parse(request.body.body);
  //     const team = await TeamService.insert(teamPayload, request, response);
  //     response.status(HttpStatusCode.OK).send(new SuccessResponse({ team }));
  //   } catch (err) {
  //     console.log(err);
  //     return response.status(400).send(new ErrorResponse(err));
  //   }
  // };

  static getById = async (request: Request, response: Response) => {
    try {
      const result = await EventService.getById(+request.params.eventId);
      if (Helper.isDefined(result)) {
        response.status(HttpStatusCode.OK).send(new SuccessResponse(result));
      } else {
        response
          .status(HttpStatusCode.NOT_FOUND)
          .send(new ErrorResponse(ERROR_MESSAGES.RECORD_NOT_FOUND));
      }
    } catch (err) {
      console.log(err);
      response
        .status(HttpStatusCode.NOT_FOUND)
        .send(new ErrorResponse(ERROR_MESSAGES.RECORD_NOT_FOUND));
    }
  };

  static putById = async (request: Request, response: Response) => {
    try {
      const event = await EventService.findById(+request.params.eventId);
      if (Helper.isDefined(event)) {
        const updatedTeam = await EventService.update(
          request.body,
          event,
          request
        );
        response
          .status(HttpStatusCode.OK)
          .send(new SuccessResponse(updatedTeam));
      } else {
        return response
          .status(HttpStatusCode.NOT_FOUND)
          .send(new ErrorResponse(ERROR_MESSAGES.RECORD_NOT_FOUND));
      }
      response.status(HttpStatusCode.OK).send();
    } catch (err) {
      console.log(err);
      return response.status(400).send(new ErrorResponse(err));
    }
  };
}
