import * as express from "express";
import { AuthenticationMiddleware } from "../authentication/middlewares/authentication.middleware";
import { PermissionMiddleware } from "../common/middlewares/permission.middleware";
import { UserRole } from "../user/utilities/UserRole";
import { RequestController } from "./controller/request.controller";

export class RequestRouter {
  static configRoutes = (app: express.Application) => {
    app.get("/possible-users/event/:eventId", [
      AuthenticationMiddleware.checkJwtToken,
      PermissionMiddleware.checkAllowedPermissions([
        UserRole.USER,
        UserRole.ADMIN,
      ]),
      RequestController.listPossibleUsersForEvent,
    ]);

    app.get("/requests/event/:eventId", [
      AuthenticationMiddleware.checkJwtToken,
      PermissionMiddleware.checkAllowedPermissions([
        UserRole.USER,
        UserRole.ADMIN,
      ]),
      RequestController.listRequestsorEvent,
    ]);

    // app.post("/events", [
    //   AuthenticationMiddleware.checkJwtToken,
    //   PermissionMiddleware.checkAllowedPermissions([
    //     UserRole.USER,
    //     UserRole.ADMIN,
    //   ]),
    //   EventController.insert,
    // ]);
    // app.get("/events/:eventId", [
    //   AuthenticationMiddleware.checkJwtToken,
    //   PermissionMiddleware.checkMeOrPermissionsAllowed([
    //     UserRole.USER,
    //     UserRole.ADMIN,
    //   ]),
    //   EventController.getById,
    // ]);
    // app.put("/events/:eventId", [
    //   AuthenticationMiddleware.checkJwtToken,
    //   PermissionMiddleware.checkAllowedPermissions([
    //     UserRole.USER,
    //     UserRole.ADMIN,
    //   ]),
    //   EventController.putById,
    // ]);
  };
}
