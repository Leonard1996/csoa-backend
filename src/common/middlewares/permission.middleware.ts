import { Request, Response, NextFunction } from "express";
import { ErrorResponse } from "../utilities/ErrorResponse";
import { ERROR_MESSAGES } from "../utilities/ErrorMessages";
import { UserRole } from "../../user/utilities/UserRole";
import { getRepository } from "typeorm";
import { Complex } from "../../complex/entities/complex.entity";

export class PermissionMiddleware {
  static checkAllowedPermissions = (roles: Array<string>) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      const { userRole } = res.locals.jwt;

      if (userRole && roles.indexOf(userRole) > -1) {
        next();
      } else {
        res.status(403).send(ERROR_MESSAGES.NOT_AUTHORIZED);
      }
    };
  };

  static checkMeOrPermissionsAllowed = (roles: Array<string>) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      const { userId, userRole } = res.locals.jwt;

      if (req.params && req.params.userId && req.params.userId === userId) {
        return next();
      }

      if (userRole && roles.indexOf(userRole) > -1) {
        next();
      } else {
        res.status(403).send(new ErrorResponse(ERROR_MESSAGES.NOT_AUTHORIZED));
      }
    };
  };

  static checkNotMe = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { userId } = res.locals.jwt;

    if (req.params && req.params.userId && req.params.userId === userId) {
      return res.status(403).send(ERROR_MESSAGES.NOT_AUTHORIZED);
    }

    next();
  };

  static checkIfOwner = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { userId, userRole } = res.locals.jwt;
    console.log(userId, userRole);
    if (userRole === UserRole.ADMIN) {
      console.log("there");
      next();
    } else if (userRole === UserRole.COMPNAY) {
      console.log("here");
      const complex = await getRepository(Complex)
        .createQueryBuilder("c")
        .innerJoin("users", "u", "u.complexId = c.id")
        .where("u.id = :id", { id: userId })
        .andWhere("u.complexId = :complexId", { complexId: req.params.id })
        .getRawOne();

      if (complex) {
        next();
      } else {
        res.status(403).send(new ErrorResponse(ERROR_MESSAGES.NOT_AUTHORIZED));
      }
    }
  };
}
