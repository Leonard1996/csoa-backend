import { NextFunction, Request, Response } from "express";
import multer = require("multer");
import { ERROR_MESSAGES } from "../../common/utilities/ErrorMessages";
import { ErrorResponse } from "../../common/utilities/ErrorResponse";
import { File } from "../../common/utilities/File";
import { join } from "path";
const crypto = require("crypto");

export class UploadMiddleware {
  public static validateFileUpload = (
    fileField: string,
    allowedFileExtensions: string[],
    fileCount: number,
    maxFileSizeInBytes?: number,
    destination: string = join(__dirname, "../../..", "public")
  ) => {
    return (request: Request, response: Response, next: NextFunction) => {
      const multerValidation = UploadMiddleware.configMulterValidator(
        fileField,
        allowedFileExtensions,
        fileCount,
        maxFileSizeInBytes,
        destination
      );

      multerValidation(request, response, (err) => {
        if (err) {
          const errorResponse = new ErrorResponse(ERROR_MESSAGES.INVALID_FILE);
          errorResponse.errors = [
            {
              key: fileField,
              message: err.message,
            },
          ];
          return response.status(400).send(errorResponse);
        }
        console.log("next");

        next();
      });
    };
  };

  public static configMulterValidator = (
    fileField: string,
    allowedFileExtensions: string[],
    fileCount: number,
    maxFileSizeInBytes?: number,
    destination: string = join(__dirname, "../../..", "public")
  ) => {
    const storageOptions: multer.DiskStorageOptions = {
      destination,
      filename: (request: Express.Request, file: Express.Multer.File, cb) => {
        const extension = File.getFileExtension(file.originalname);
        const filename = crypto.randomBytes(20).toString("hex") + "_" + file.fieldname + "." + extension;
        cb(null, filename);
      },
    };

    const multerStorage: multer.StorageEngine = multer.diskStorage(storageOptions);

    const multerOptions: multer.Options = {
      storage: multerStorage,

      fileFilter: (request: Request, file: Express.Multer.File, cb) => {
        const fileExtension = File.getFileExtension(file.originalname);

        if (allowedFileExtensions.indexOf(fileExtension) > -1) {
          cb(null, true);
        } else {
          const errorMsg = "Only " + allowedFileExtensions.join(", ") + " files are allowed!";
          const error = new Error(errorMsg);
          cb(error);
        }
      },
    };

    // if (maxFileSizeInBytes) {
    multerOptions.limits = {
      fieldSize: 1024 * 1024 * 10,
    };
    // }

    const upload: ReturnType<typeof multer> = multer(multerOptions);

    if (fileCount > 1) {
      return upload.array(fileField, fileCount);
    } else {
      return upload.single(fileField);
    }
  };
}
