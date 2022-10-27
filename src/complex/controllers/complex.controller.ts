import { Request, Response } from "express";
import { ErrorResponse } from "../../common/utilities/ErrorResponse";
import { HttpStatusCode } from "../../common/utilities/HttpStatusCodes";
import { SuccessResponse } from "../../common/utilities/SuccessResponse";
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
}
