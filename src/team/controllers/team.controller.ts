import { Request, Response } from "express";
import { ErrorResponse } from "../../common/utilities/ErrorResponse";
import { HttpStatusCode } from "../../common/utilities/HttpStatusCodes";
import { SuccessResponse } from "../../common/utilities/SuccessResponse";
import { TeamService } from "../services/team.services";

export class TeamController {
  static listMyTeams = async (request: Request, response: Response) => {
    try {
      const results = await TeamService.listMyTeams(request, response);
      return response
        .status(HttpStatusCode.OK)
        .send(new SuccessResponse({ results }));
    } catch (err) {
      console.log({ err });
      return response
        .status(404)
        .send(new ErrorResponse("Could not get my teams list"));
    }
  };

  static insert = async (request: Request, response: Response) => {
    try {
      const teamPayload = JSON.parse(request.body.body);
      const team = await TeamService.insert(teamPayload, request, response);
      response.status(HttpStatusCode.OK).send(new SuccessResponse({ team }));
    } catch (err) {
      console.log(err);
      return response.status(400).send(new ErrorResponse(err));
    }
  };
}
