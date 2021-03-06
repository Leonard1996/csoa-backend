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
            "Bajz??",
            "Ballsh",
            "Berat",
            "Bilisht",
            "Bulqiz??",
            "Burrel",
            "C??rrik",
            "??orovod??",
            "Delvin??",
            "Divjak??",
            "Durr??s",
            "Elbasan",
            "Ersek??",
            "Fier",
            "Fierz??",
            "Finiq",
            "Fush??-Arr??z",
            "Fush??-Kruj??",
            "Gjirokast??r",
            "Gramsh",
            "Himar??",
            "Kam??z",
            "Kavaj??",
            "K??lcyr??",
            "Klos",
            "Konispol",
            "Koplik",
            "Kor????",
            "Krast??",
            "Krrab??",
            "Kruj??",
            "Krum??",
            "Ku??ov??",
            "Kuk??s",
            "Kurbnesh",
            "La??",
            "Leskovik",
            "Lezh??",
            "Libohov??",
            "Librazhd",
            "Lushnj??",
            "Maliq",
            "Mamurras",
            "Man??z",
            "Memaliaj",
            "Milot",
            "Orikum",
            "Patos",
            "Peqin",
            "P??rmet",
            "Peshkopi",
            "Pogradec",
            "Poli??an",
            "Prrenjas",
            "Puk??",
            "Reps",
            "Roskovec",
            "Rr??shen",
            "Rrogozhin??",
            "Rubik",
            "Sarand??",
            "Selenic??",
            "Sh??ngjin",
            "Shijak",
            "Shkod??r",
            "Sukth",
            "Tepelen??",
            "Tirana",
            "Ul??z",
            "Ura Vajgurore",
            "Vau i Dej??s",
            "Vlor??",
            "Vor??"
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