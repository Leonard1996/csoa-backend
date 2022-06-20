import * as express from "express";
import { UserMiddleware } from "./middlewares/user.middleware";
import { UserController } from "./controllers/user.controller";
import { AuthenticationMiddleware } from "../authentication/middlewares/authentication.middleware";
import { PermissionMiddleware } from "../common/middlewares/permission.middleware";
import { UserRole } from "./utilities/UserRole";
import { AttachmentController } from "../attachment/controllers/attachment.controller";
import { UploadMiddleware } from "../attachment/middlewares/upload.middleware";

export class UserRouter {
  static configRoutes = (app: express.Application) => {
    app.get("/users", [
      AuthenticationMiddleware.checkJwtToken,
      PermissionMiddleware.checkAllowedPermissions([
        UserRole.ADMIN]),
      UserController.list,
    ]);

    app.get("/users/:userId", [
      AuthenticationMiddleware.checkJwtToken,
      PermissionMiddleware.checkMeOrPermissionsAllowed([UserRole.ADMIN]),
      UserController.getById,
    ]);

    // inc
    app.post("/register", [
      UserController.insert,
    ]);

    // inc
    app.get("/cities", [
      UserController.getCities,
    ]);

    app.post("/user-photo", [
      AuthenticationMiddleware.checkJwtToken,
      UploadMiddleware.validateFileUpload('file', ["jpg", "png", "jpeg"], 1),
      UserController.insertProfilePicture,
    ]);

    app.patch("/users/:userId", [
      AuthenticationMiddleware.checkJwtToken,
      PermissionMiddleware.checkAllowedPermissions([UserRole.ADMIN]),
      UserController.patchById,
    ]);

    app.delete("/users/:userId", [
      AuthenticationMiddleware.checkJwtToken,
      PermissionMiddleware.checkAllowedPermissions([UserRole.ADMIN]),
      PermissionMiddleware.checkNotMe,
      UserMiddleware.checkUserExistance("id", "params.userId", true),
      UserController.deleteById,
    ]);

    app.patch("/me/change-me", [
      AuthenticationMiddleware.checkJwtToken,
      PermissionMiddleware.checkAllowedPermissions([UserRole.USER]),
      UserMiddleware.validationPasswordInput,
      UserController.patchMe,
    ]);

    // inc
    app.post("/users/check-phone-number", [
      UserController.checkPhoneNumber,
    ]);
  };
}
