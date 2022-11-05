import * as express from "express";
import { UploadMiddleware } from "../attachment/middlewares/upload.middleware";
import { AuthenticationMiddleware } from "../authentication/middlewares/authentication.middleware";
import { PermissionMiddleware } from "../common/middlewares/permission.middleware";
import { UserRole } from "../user/utilities/UserRole";
import { ComplexController } from "./controllers/complex.controller";

export class ComplexRouter {
  static configRoutes = (app: express.Application) => {
    app.get("/complexes", [
      AuthenticationMiddleware.checkJwtToken,
      PermissionMiddleware.checkAllowedPermissions([UserRole.ADMIN]),
      ComplexController.list,
    ]);
    app.get("/complexes-minified", [
      AuthenticationMiddleware.checkJwtToken,
      PermissionMiddleware.checkAllowedPermissions([UserRole.ADMIN]),
      ComplexController.listMinified,
    ]);
    app.post("/complexes", [
      AuthenticationMiddleware.checkJwtToken,
      PermissionMiddleware.checkAllowedPermissions([UserRole.ADMIN]),
      ComplexController.insert,
    ]);
    app.patch("/complexes", [
      AuthenticationMiddleware.checkJwtToken,
      PermissionMiddleware.checkAllowedPermissions([UserRole.ADMIN]),
      ComplexController.update,
    ]);
    app.patch("/complexes/:id", [
      AuthenticationMiddleware.checkJwtToken,
      PermissionMiddleware.checkAllowedPermissions([UserRole.ADMIN]),
      ComplexController.toggleStatus,
    ]);
    app.get("/complexes/:id", [
      AuthenticationMiddleware.checkJwtToken,
      PermissionMiddleware.checkAllowedPermissions([UserRole.ADMIN]),
      ComplexController.getById,
    ]);
    app.get("/complexes/:id/events", [
      AuthenticationMiddleware.checkJwtToken,
      PermissionMiddleware.checkAllowedPermissions([UserRole.ADMIN]),
      ComplexController.getEvents,
    ]);
    app.post("/complexes/:id/events", [
      AuthenticationMiddleware.checkJwtToken,
      PermissionMiddleware.checkAllowedPermissions([UserRole.ADMIN]),
      ComplexController.getFilteredEvents,
    ]);
    app.post("/complexes/:id/locations/:locationId/events", [
      AuthenticationMiddleware.checkJwtToken,
      PermissionMiddleware.checkAllowedPermissions([UserRole.ADMIN]),
      ComplexController.fetchEventsByLocationdId,
    ]);
    app.get("/complexes/:id/locations", [
      AuthenticationMiddleware.checkJwtToken,
      PermissionMiddleware.checkAllowedPermissions([UserRole.ADMIN]),
      ComplexController.getLocations,
    ]);

    // /complexes/${business?.id}/locations?type=${type}/events

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
