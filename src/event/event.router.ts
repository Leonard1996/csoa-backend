import * as express from "express";
import { UploadMiddleware } from "../attachment/middlewares/upload.middleware";
import { AuthenticationMiddleware } from "../authentication/middlewares/authentication.middleware";
import { PermissionMiddleware } from "../common/middlewares/permission.middleware";
import { UserRole } from "../user/utilities/UserRole";
import { EventController } from "./controllers/event.controller";

export class EventRouter {
  static configRoutes = (app: express.Application) => {
    app.get("/my-events", [
      AuthenticationMiddleware.checkJwtToken,
      PermissionMiddleware.checkAllowedPermissions([
        UserRole.USER,
        UserRole.ADMIN,
      ]),
      EventController.listMyEvents,
    ]);

    app.post("/events", [
      AuthenticationMiddleware.checkJwtToken,
      PermissionMiddleware.checkAllowedPermissions([
        UserRole.USER,
        UserRole.ADMIN,
      ]),
      EventController.insert,
    ]);

    app.get("/events/:eventId", [
      AuthenticationMiddleware.checkJwtToken,
      PermissionMiddleware.checkMeOrPermissionsAllowed([
        UserRole.USER,
        UserRole.ADMIN,
      ]),
      EventController.getById,
    ]);

    app.put("/events/:eventId", [
      AuthenticationMiddleware.checkJwtToken,
      PermissionMiddleware.checkAllowedPermissions([
        UserRole.USER,
        UserRole.ADMIN,
      ]),
      EventController.putById,
    ]);
  };
}
