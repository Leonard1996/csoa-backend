import * as express from "express";
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

    app.get("/events", [
      AuthenticationMiddleware.checkJwtToken,
      PermissionMiddleware.checkAllowedPermissions([UserRole.ADMIN]),
      EventController.list,
    ]);

    app.post("/events/:id/toggle", [
      AuthenticationMiddleware.checkJwtToken,
      PermissionMiddleware.checkAllowedPermissions([UserRole.ADMIN]),
      EventController.toggleEvent,
    ]);

    app.get("/events/:id/players", [
      AuthenticationMiddleware.checkJwtToken,
      PermissionMiddleware.checkAllowedPermissions([UserRole.ADMIN]),
      EventController.getPlayers,
    ]);

    app.post("/admin/events", [
      AuthenticationMiddleware.checkJwtToken,
      PermissionMiddleware.checkAllowedPermissions([
        UserRole.ADMIN,
        UserRole.COMPNAY,
      ]),
      EventController.createAdminEvent,
    ]);

    app.patch("/v2/events/:eventId/confirm", [
      AuthenticationMiddleware.checkJwtToken,
      PermissionMiddleware.checkAllowedPermissions([UserRole.COMPNAY]),
      EventController.confirm,
    ]);

    app.delete("/events/:eventId", [
      AuthenticationMiddleware.checkJwtToken,
      PermissionMiddleware.checkAllowedPermissions([UserRole.COMPNAY]),
      EventController.delete,
    ]);

    // app.post("/teams", [
    //   AuthenticationMiddleware.checkJwtToken,
    //   PermissionMiddleware.checkAllowedPermissions([
    //     UserRole.USER,
    //     UserRole.ADMIN,
    //   ]),
    //   UploadMiddleware.validateFileUpload("file", ["jpg", "png", "jpeg"], 2),
    //   EventController.insert,
    // ]);

    //   app.post("/teams/:teamId/attachments", [
    //     AuthenticationMiddleware.checkJwtToken,
    //     PermissionMiddleware.checkAllowedPermissions([
    //       UserRole.USER,
    //       UserRole.ADMIN,
    //     ]),
    //     UploadMiddleware.validateFileUpload("file", ["jpg", "png", "jpeg"], 8),
    //     EventController.upload,
    //   ]);

    //   app.delete("/teams/:teamId/attachments/:attachmentId", [
    //     AuthenticationMiddleware.checkJwtToken,
    //     PermissionMiddleware.checkAllowedPermissions([
    //       UserRole.ADMIN,
    //       UserRole.USER,
    //     ]),
    //     EventController.deleteAttachmentById,
    //   ]);

    //   app.get("/teams/:teamId", [
    //     AuthenticationMiddleware.checkJwtToken,
    //     PermissionMiddleware.checkMeOrPermissionsAllowed([
    //       UserRole.USER,
    //       UserRole.ADMIN,
    //     ]),
    //     EventController.getById,
    //   ]);

    //   app.put("/teams/:teamId", [
    //     AuthenticationMiddleware.checkJwtToken,
    //     PermissionMiddleware.checkAllowedPermissions([
    //       UserRole.USER,
    //       UserRole.ADMIN,
    //     ]),
    //     UploadMiddleware.validateFileUpload("file", ["jpg", "png", "jpeg"], 2),
    //     EventController.putById,
    //   ]);

    //   app.delete("/teams/:teamId", [
    //     AuthenticationMiddleware.checkJwtToken,
    //     PermissionMiddleware.checkAllowedPermissions([
    //       UserRole.ADMIN,
    //       UserRole.USER,
    //     ]),
    //     EventController.deleteById,
    //   ]);

    //   app.delete("/teams/:teamId/exit", [
    //     AuthenticationMiddleware.checkJwtToken,
    //     PermissionMiddleware.checkAllowedPermissions([
    //       UserRole.ADMIN,
    //       UserRole.USER,
    //     ]),
    //     EventController.exit,
    //   ]);
  };
}
