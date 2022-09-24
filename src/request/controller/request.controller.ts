import { Request, Response } from "express";
import { ERROR_MESSAGES } from "../../common/utilities/ErrorMessages";
import { ErrorResponse } from "../../common/utilities/ErrorResponse";
import { Helper } from "../../common/utilities/Helper";
import { HttpStatusCode } from "../../common/utilities/HttpStatusCodes";
import { SuccessResponse } from "../../common/utilities/SuccessResponse";
import { EventService } from "../../event/services/event.services";
import { RequestService } from "../services/request.services";

export class RequestController {
  static listPossibleUsersForEvent = async (
    request: Request,
    response: Response
  ) => {
    try {
      const event = await EventService.findById(+request.params.eventId);
      if (Helper.isDefined(event)) {
        const results = await RequestService.listPossibleUsersForEvent(
          event,
          request,
          response
        );
        return response
          .status(HttpStatusCode.OK)
          .send(new SuccessResponse({ results }));
      } else {
        response
          .status(HttpStatusCode.NOT_FOUND)
          .send(new ErrorResponse(ERROR_MESSAGES.RECORD_NOT_FOUND));
      }
    } catch (err) {
      console.log({ err });
      return response
        .status(404)
        .send(new ErrorResponse("Could not get possible users for event"));
    }
  };

  static listRequestsorEvent = async (request: Request, response: Response) => {
    try {
      const event = await EventService.findById(+request.params.eventId);
      if (Helper.isDefined(event)) {
        const results = await RequestService.listRequestsForEvent(
          event,
          request,
          response
        );
        return response
          .status(HttpStatusCode.OK)
          .send(new SuccessResponse({ results }));
      } else {
        response
          .status(HttpStatusCode.NOT_FOUND)
          .send(new ErrorResponse(ERROR_MESSAGES.RECORD_NOT_FOUND));
      }
    } catch (err) {
      console.log({ err });
      return response
        .status(404)
        .send(new ErrorResponse("Could not get possible users for event"));
    }
  };

  //   static insert = async (request: Request, response: Response) => {
  //     try {
  //       const event = await EventService.insert(request.body, request, response);
  //       response.status(HttpStatusCode.OK).send(new SuccessResponse({ event }));
  //     } catch (err) {
  //       console.log(err);
  //       return response.status(400).send(new ErrorResponse(err));
  //     }
  //   };
  //   static getById = async (request: Request, response: Response) => {
  //     try {
  //       const result = await EventService.getById(+request.params.eventId);
  //       if (Helper.isDefined(result)) {
  //         response.status(HttpStatusCode.OK).send(new SuccessResponse(result));
  //       } else {
  //         response
  //           .status(HttpStatusCode.NOT_FOUND)
  //           .send(new ErrorResponse(ERROR_MESSAGES.RECORD_NOT_FOUND));
  //       }
  //     } catch (err) {
  //       console.log(err);
  //       response
  //         .status(HttpStatusCode.NOT_FOUND)
  //         .send(new ErrorResponse(ERROR_MESSAGES.RECORD_NOT_FOUND));
  //     }
  //   };
  //   static putById = async (request: Request, response: Response) => {
  //     try {
  //       const event = await EventService.findById(+request.params.userId);
  //       if (Helper.isDefined(event)) {
  //         const updatedTeam = await EventService.update(
  //           request.body,
  //           event,
  //           request
  //         );
  //         response
  //           .status(HttpStatusCode.OK)
  //           .send(new SuccessResponse(updatedTeam));
  //       } else {
  //         return response
  //           .status(HttpStatusCode.NOT_FOUND)
  //           .send(new ErrorResponse(ERROR_MESSAGES.RECORD_NOT_FOUND));
  //       }
  //       response.status(HttpStatusCode.OK).send();
  //     } catch (err) {
  //       console.log(err);
  //       return response.status(400).send(new ErrorResponse(err));
  //     }
  //   };
}
