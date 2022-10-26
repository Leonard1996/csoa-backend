import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { ErrorResponse } from "../../common/utilities/ErrorResponse";
import { HttpStatusCode } from "../../common/utilities/HttpStatusCodes";
import { SuccessResponse } from "../../common/utilities/SuccessResponse";
import { Complex } from "../entities/complex.entity";
import { Location } from "../entities/location.entity";
import { ComplexService } from "../services/complex.service";

export class ComplexController {
  static list = async (request: Request, response: Response) => {
    try {
      const complexes = await ComplexService.list();
      return response
        .status(HttpStatusCode.OK)
        .send(new SuccessResponse({ complexes }));
    } catch (err) {
      console.log({ err });
      return response
        .status(404)
        .send(new ErrorResponse("Could not get complexes"));
    }
  };
  static listMinified = async (request: Request, response: Response) => {
    try {
      const complexes = await ComplexService.listMinified();
      return response
        .status(HttpStatusCode.OK)
        .send(new SuccessResponse(complexes));
    } catch (err) {
      console.log({ err });
      return response
        .status(404)
        .send(new ErrorResponse("Could not get complexes"));
    }
  };
  static insert = async (request: Request, response: Response) => {
    try {
      const complex = await ComplexService.create(request.body);
      return response
        .status(HttpStatusCode.OK)
        .send(new SuccessResponse({ complex }));
    } catch (err) {
      console.log({ err });
      return response
        .status(404)
        .send(new ErrorResponse("Could not create complexes"));
    }
  };
  static update = async (request: Request, response: Response) => {
    try {
      await ComplexService.update(request.body);
      return response
        .status(HttpStatusCode.OK)
        .send(new SuccessResponse({ status: "success" }));
    } catch (err) {
      console.log({ err });
      return response
        .status(404)
        .send(new ErrorResponse("Could not update complexes"));
    }
  };

  public static async toggleStatus(request: Request, response: Response) {
    try {
      const complexRepository = getRepository(Complex);
      const complex = await complexRepository.findOneOrFail({
        where: { id: +request.params.id },
        withDeleted: true,
      });
      if (!complex.tsDeleted) await complexRepository.softDelete(complex.id);
      else {
        complex.tsDeleted = null;
        await complexRepository.save(complex);
      }
      return response.status(200).send(new SuccessResponse({ complex }));
    } catch (err) {
      console.log({ err });
      return response
        .status(404)
        .send(new ErrorResponse("Could not deactive complex"));
    }
  }
  static getById = async (request: Request, response: Response) => {
    try {
      const complex = await ComplexService.getById(request);
      return response
        .status(HttpStatusCode.OK)
        .send(new SuccessResponse({ complex }));
    } catch (err) {
      console.log({ err });
      return response
        .status(404)
        .send(new ErrorResponse("Could not get complex"));
    }
  };

  static getEvents = async (request: Request, response: Response) => {
    try {
      const events = await ComplexService.getEvents(+request.params.id);
      return response
        .status(HttpStatusCode.OK)
        .send(new SuccessResponse({ events }));
    } catch (err) {
      console.log({ err });
      return response
        .status(404)
        .send(new ErrorResponse("Could not get events for this complex"));
    }
  };

  static getFilteredEvents = async (request: Request, response: Response) => {
    try {
      const events = await ComplexService.getFilteredEvents(request);
      return response
        .status(HttpStatusCode.OK)
        .send(new SuccessResponse({ events }));
    } catch (err) {
      console.log({ err });
      return response
        .status(404)
        .send(new ErrorResponse("Could not get events for this complex"));
    }
  };
  static fetchEventsByLocationdId = async (
    request: Request,
    response: Response
  ) => {
    try {
      const events = await ComplexService.fetchEventsByLocationdId(request);
      return response
        .status(HttpStatusCode.OK)
        .send(new SuccessResponse({ events }));
    } catch (err) {
      console.log({ err });
      return response
        .status(404)
        .send(new ErrorResponse("Could not get locations"));
    }
  };
  static getLocations = async (request: Request, response: Response) => {
    try {
      const locationRepository = getRepository(Location);
      const locations = await locationRepository.find({
        where: { complexId: request.params.id },
      });
      return response
        .status(HttpStatusCode.OK)
        .send(new SuccessResponse({ locations }));
    } catch (err) {
      console.log({ err });
      return response
        .status(404)
        .send(new ErrorResponse("Could not get locations"));
    }
  };
}
