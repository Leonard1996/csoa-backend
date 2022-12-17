import { Request, Response } from "express";
import { getRepository, LessThan, Not } from "typeorm";
import { ERROR_MESSAGES } from "../../common/utilities/ErrorMessages";
import { ErrorResponse } from "../../common/utilities/ErrorResponse";
import { Helper } from "../../common/utilities/Helper";
import { HttpStatusCode } from "../../common/utilities/HttpStatusCodes";
import { Mailer } from "../../common/utilities/Mailer";
import { SuccessResponse } from "../../common/utilities/SuccessResponse";
import { Complex } from "../../complex/entities/complex.entity";
import { Location } from "../../complex/entities/location.entity";
import { User } from "../../user/entities/user.entity";
import { UserRole } from "../../user/utilities/UserRole";
import { Event, EventStatus } from "../entities/event.entity";
import { EventService } from "../services/event.services";

export class EventController {
  static listMyEvents = async (request: Request, response: Response) => {
    try {
      const results = await EventService.listMyEvents(request, response);
      return response.status(HttpStatusCode.OK).send(new SuccessResponse({ results }));
    } catch (err) {
      console.log({ err });
      return response.status(404).send(new ErrorResponse("Could not get my events list"));
    }
  };

  static list = async (request: Request, response: Response) => {
    try {
      const { events, count } = await EventService.list(request, response);
      return response.status(HttpStatusCode.OK).send(new SuccessResponse({ events, count }));
    } catch (err) {
      console.log({ err });
      return response.status(404).send(new ErrorResponse("Could not get my events"));
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
      return response.status(404).send(new ErrorResponse("Could not update event status"));
    }
  }

  static getPlayers = async (request: Request, response: Response) => {
    try {
      const players = await EventService.getPlayers(request, response);
      return response.status(HttpStatusCode.OK).send(new SuccessResponse({ players }));
    } catch (err) {
      console.log({ err });
      return response.status(404).send(new ErrorResponse("Could not get my players"));
    }
  };

  static insert = async (request: Request, response: Response) => {
    try {
      const event = await EventService.insert(request, response);
      if (event) {
        if (!event[0].isTeam) {
          await EventService.createDummyTeams(event);
        }
        await EventService.createRequest(event);
      }
      response.status(HttpStatusCode.OK).send(
        new SuccessResponse({
          event: event ? event : "Nje event ekziston ne kete orar",
        })
      );
    } catch (err) {
      console.log(err);
      return response.status(400).send(new ErrorResponse(err));
    }
  };

  static createAdminEvent = async (request: Request, response: Response) => {
    try {
      const event = await EventService.createAdminEvent(request, response);
      const location = await getRepository(Location).findOne(event.locationId);
      const user = await getRepository(User).findOne({
        where: { complexId: location.complexId },
      });
      const mailer = new Mailer();
      mailer.sendMail(
        user.email,
        "Rezervim i ri",
        `
      <div>
      Pershendetje, ju keni nje rezervim te ri, vizitoni aplikacionin ose panelin per me shume detaje.
      </div>
      `
      );
      if (!event) throw Error();
      return response.status(HttpStatusCode.OK).send(new SuccessResponse({ event }));
    } catch (err) {
      console.log(err);
      return response.status(404).send(new ErrorResponse("Eventi nuk u krijua"));
    }
  };

  static confirm = async (request: Request, response: Response) => {
    const weeklyGroupedId = +request.query.weeklyGroupedId;
    const firstArgument = {
      ...(!weeklyGroupedId && { id: +request.params.eventId }),
      ...(weeklyGroupedId && { weeklyGroupedId }),
    };
    try {
      const event = await getRepository(Event).update(firstArgument, {
        status: EventStatus.CONFIRMED,
      });
      return response.status(HttpStatusCode.OK).send(new SuccessResponse(event));
    } catch (err) {
      console.log({ err });
      return response.status(404).send(new ErrorResponse("Could not get my events"));
    }
  };

  static delete = async (request: Request, response: Response) => {
    const weeklyGroupedId = +request.query.weeklyGroupedId;
    try {
      await getRepository(Event).update(
        {
          ...(!weeklyGroupedId && { id: +request.params.eventId }),
          status: EventStatus.WAITING_FOR_CONFIRMATION,
          ...(weeklyGroupedId && { weeklyGroupedId }),
        },
        {
          status:
            response.locals.jwt.role === UserRole.USER
              ? EventStatus.DELETED_BY_USER_BEFORE_CONFIRMATION
              : EventStatus.REFUSED,
          tsDeleted: new Date(),
          deletedById: response.locals.jwt.userId,
        }
      );
      return response.sendStatus(204);
    } catch (err) {
      console.log({ err });
      return response.status(404).send(new ErrorResponse("Could not delete my events"));
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
        response.status(HttpStatusCode.NOT_FOUND).send(new ErrorResponse(ERROR_MESSAGES.RECORD_NOT_FOUND));
      }
    } catch (err) {
      console.log(err);
      response.status(HttpStatusCode.NOT_FOUND).send(new ErrorResponse(ERROR_MESSAGES.RECORD_NOT_FOUND));
    }
  };

  static patchById = async (request: Request, response: Response) => {
    try {
      const event = await EventService.findById(+request.params.eventId);
      if (Helper.isDefined(event)) {
        const updatedTeam = await EventService.patch(request.body, event, request);
        response.status(HttpStatusCode.OK).send(new SuccessResponse(updatedTeam));
      } else {
        return response.status(HttpStatusCode.NOT_FOUND).send(new ErrorResponse(ERROR_MESSAGES.RECORD_NOT_FOUND));
      }
      response.status(HttpStatusCode.OK).send();
    } catch (err) {
      console.log(err);
      return response.status(400).send(new ErrorResponse(err));
    }
  };

  static patchSingleEvent = async (request: Request, response: Response) => {
    try {
      const event = await EventService.findById(+request.params.eventId);
      if (Helper.isDefined(event)) {
        const updatedTeam = await EventService.patchSingleEvent(request.body, event, request);
        response.status(HttpStatusCode.OK).send(new SuccessResponse(updatedTeam));
      } else {
        return response.status(HttpStatusCode.NOT_FOUND).send(new ErrorResponse(ERROR_MESSAGES.RECORD_NOT_FOUND));
      }
      response.status(HttpStatusCode.OK).send();
    } catch (err) {
      console.log(err);
      return response.status(400).send(new ErrorResponse(err));
    }
  };

  static cancel = async (request: Request, response: Response) => {
    const weeklyGroupedId = +request.query.weeklyGroupedId;
    try {
      if (weeklyGroupedId) {
        await getRepository(Event).update(
          {
            id: Not(LessThan(+request.params.eventId)),
            status: EventStatus.CONFIRMED,
            weeklyGroupedId: weeklyGroupedId,
          },
          {
            status: EventStatus.CANCELED,
            tsDeleted: new Date(),
            deletedById: response.locals.jwt.userId,
          }
        );
        return response.sendStatus(204);
      }
      await getRepository(Event).update(
        {
          id: +request.params.eventId,
          status: EventStatus.CONFIRMED,
        },
        {
          status: EventStatus.CANCELED,
          tsDeleted: new Date(),
          deletedById: response.locals.jwt.userId,
        }
      );
      return response.sendStatus(204);
    } catch (err) {
      console.log({ err });
      return response.status(404).send(new ErrorResponse("Could not cancel event"));
    }
  };

  static deleteAfterCancelation = async (
    request: Request,
    response: Response
  ) => {
    const weeklyGroupedId = +request.query.weeklyGroupedId;
    try {
      await getRepository(Event).update(
        {
          ...(!weeklyGroupedId && { id: +request.params.eventId }),
          status: EventStatus.CANCELED,
          ...(weeklyGroupedId && { weeklyGroupedId }),
        },
        {
          status: EventStatus.DELETED_BY_USER_AFTER_CANCELATION,
          tsDeleted: new Date(),
          deletedById: response.locals.jwt.userId,
        }
      );
      return response.sendStatus(204);
    } catch (err) {
      console.log({ err });
      return response
        .status(404)
        .send(new ErrorResponse("Could not delete my events"));
    }
  };
}
