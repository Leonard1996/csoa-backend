import { Response, Request } from "express";
import { SuccessResponse } from "../../common/utilities/SuccessResponse";
import { ErrorResponse } from "../../common/utilities/ErrorResponse";
import { ERROR_MESSAGES } from "../../common/utilities/ErrorMessages";
import { UserService } from "../services/user.service";
import { Helper } from "../../common/utilities/Helper";
import { HttpStatusCode } from "../../common/utilities/HttpStatusCodes";
import { getRepository, Not } from "typeorm";
import { User } from "../entities/user.entity";

export class UserController {

    static list = async (request: Request, response: Response) => {
        const userRepository = getRepository(User);

        const results = await userRepository.find({
            where: {
                id: Not(response.locals.jwt.userId)
            }
        });

        response.status(HttpStatusCode.OK).send(new SuccessResponse({ results }));
    }

    static insert = async (request: Request, response: Response) => {
        try {
            const user = await UserService.insert(request.body, request, response);
            // response.status(HttpStatusCode.OK).send(new SuccessResponse({ user }));
        } catch (err) {
            console.log(err)
            return response.status(400).send(new ErrorResponse(err))
        }

    }

    static getById = async (request: Request, response: Response) => {
        try {
            const user = await UserService.getById(+request.params.userId);
            if (Helper.isDefined(user)) {
                response.status(HttpStatusCode.OK).send(new SuccessResponse(user.toResponseObject()));
            }
            else {
                response.status(HttpStatusCode.NOT_FOUND).send(new ErrorResponse(ERROR_MESSAGES.RECORD_NOT_FOUND));
            }
        } catch (error) {
            console.log(error)
            response.status(HttpStatusCode.NOT_FOUND).send(new ErrorResponse(ERROR_MESSAGES.RECORD_NOT_FOUND));

        }


    }

    static patchById = async (request: Request, response: Response) => {

        const user = await UserService.getById(+request.params.userId);

        if (Helper.isDefined(user)) {

            const finalUser = await UserService.update(request.body, user);
            response.status(HttpStatusCode.OK).send(new SuccessResponse(finalUser.toResponseObject()));

        } else {
            return response.status(HttpStatusCode.NOT_FOUND).send(new ErrorResponse(ERROR_MESSAGES.RECORD_NOT_FOUND));
        }

        response.status(HttpStatusCode.OK).send();
    }

    static deleteById = async (request: Request, response: Response) => {

        await UserService.deleteById(+request.params.userId);

        response.status(HttpStatusCode.OK).send();
    }

    static patchPassword = async (request: Request, response: Response) => {

        const user = await UserService.getById(+response.locals.jwt.userId);

        if (Helper.isDefined(user)) {

            const finalUser = await UserService.updatePassword(request.body.newPassword, user);
            response.status(HttpStatusCode.OK).send(new SuccessResponse(finalUser.toResponseObject()));

        } else {
            return response.status(HttpStatusCode.NOT_FOUND).send(new ErrorResponse(ERROR_MESSAGES.RECORD_NOT_FOUND));
        }

        response.status(HttpStatusCode.OK).send();
    }

    public static patchMe = async (request: Request, response: Response) => {
        const [result, error] = await UserService.patchMe(request, response)
        if (error) {
            return response.status(402).send(new ErrorResponse(ERROR_MESSAGES.RECORD_NOT_FOUND))
        }
        return response.status(200).send(new SuccessResponse(result));
    }

    public static async checkPhoneNumber(request: Request, response: Response) {
        UserService.checkPhoneNumber(request.body.phoneNumber,
            (code) => {
                return response.status(200).send(new SuccessResponse({ message: "Verification code sent", code }))
            },
            (err) => {
                console.log({ err })
                return response.status(404).send(new ErrorResponse('Phone number does not exist'))
            }
        )
    }

    public static async getCities(request: Request, response: Response) {
        const cities = [
            "Bajram Curri",
            "Bajzë",
            "Ballsh",
            "Berat",
            "Bilisht",
            "Bulqizë",
            "Burrel",
            "Cërrik",
            "Çorovodë",
            "Delvinë",
            "Divjakë",
            "Durrës",
            "Elbasan",
            "Ersekë",
            "Fier",
            "Fierzë",
            "Finiq",
            "Fushë-Arrëz",
            "Fushë-Krujë",
            "Gjirokastër",
            "Gramsh",
            "Himarë",
            "Kamëz",
            "Kavajë",
            "Këlcyrë",
            "Klos",
            "Konispol",
            "Koplik",
            "Korçë",
            "Krastë",
            "Krrabë",
            "Krujë",
            "Krumë",
            "Kuçovë",
            "Kukës",
            "Kurbnesh",
            "Laç",
            "Leskovik",
            "Lezhë",
            "Libohovë",
            "Librazhd",
            "Lushnjë",
            "Maliq",
            "Mamurras",
            "Manëz",
            "Memaliaj",
            "Milot",
            "Orikum",
            "Patos",
            "Peqin",
            "Përmet",
            "Peshkopi",
            "Pogradec",
            "Poliçan",
            "Prrenjas",
            "Pukë",
            "Reps",
            "Roskovec",
            "Rrëshen",
            "Rrogozhinë",
            "Rubik",
            "Sarandë",
            "Selenicë",
            "Shëngjin",
            "Shijak",
            "Shkodër",
            "Sukth",
            "Tepelenë",
            "Tirana",
            "Ulëz",
            "Ura Vajgurore",
            "Vau i Dejës",
            "Vlorë",
            "Vorë"
        ]
        return response.status(200).send(new SuccessResponse({ cities }))
    }

    public static async insertProfilePicture(request: Request, response: Response) {
        try {
            const user = await UserService.insertProfilePicture(request, response);
            return response.status(200).send(new SuccessResponse({ user }));
        } catch (err) {
            console.log({ err });
            return response.status(404).send(new ErrorResponse('Could not update profile picture'))
        }
    }
}