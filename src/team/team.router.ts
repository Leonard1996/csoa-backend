import * as express from "express";
import { UploadMiddleware } from "../attachment/middlewares/upload.middleware";
import { AuthenticationMiddleware } from "../authentication/middlewares/authentication.middleware";
import { PermissionMiddleware } from "../common/middlewares/permission.middleware";
import { UserMiddleware } from "../user/middlewares/user.middleware";
import { UserRole } from "../user/utilities/UserRole";
import { TeamController } from "./controllers/team.controller";

export class TeamRouter {
  static configRoutes = (app: express.Application) => {
    app.get("/my-teams", [
      AuthenticationMiddleware.checkJwtToken,
      PermissionMiddleware.checkAllowedPermissions([
        UserRole.USER,
        UserRole.ADMIN,
      ]),
      TeamController.listMyTeams,
    ]);

    app.post("/teams", [
      AuthenticationMiddleware.checkJwtToken,
      PermissionMiddleware.checkAllowedPermissions([
        UserRole.USER,
        UserRole.ADMIN,
      ]),
      UploadMiddleware.validateFileUpload("file", ["jpg", "png", "jpeg"], 2),
      TeamController.insert,
    ]);

    app.get("/teams/:teamId", [
      AuthenticationMiddleware.checkJwtToken,
      PermissionMiddleware.checkMeOrPermissionsAllowed([
        UserRole.USER,
        UserRole.ADMIN,
      ]),
      TeamController.getById,
    ]);

    app.put("/teams/:teamId", [
      AuthenticationMiddleware.checkJwtToken,
      PermissionMiddleware.checkAllowedPermissions([
        UserRole.USER,
        UserRole.ADMIN,
      ]),
      UploadMiddleware.validateFileUpload("file", ["jpg", "png", "jpeg"], 2),
      TeamController.putById,
    ]);

    app.delete("/teams/:teamId", [
      AuthenticationMiddleware.checkJwtToken,
      PermissionMiddleware.checkAllowedPermissions([
        UserRole.ADMIN,
        UserRole.USER,
      ]),
      TeamController.deleteById,
    ]);

    app.delete("/teams/:teamId/exit", [
      AuthenticationMiddleware.checkJwtToken,
      PermissionMiddleware.checkAllowedPermissions([
        UserRole.ADMIN,
        UserRole.USER,
      ]),
      TeamController.exit,
    ]);
  };
}
