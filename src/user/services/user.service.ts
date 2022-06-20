import { UserRepository } from "../repositories/user.repository";
import { QueryStringProcessor } from "../../common/utilities/QueryStringProcessor";
import { getCustomRepository, getRepository } from "typeorm";
import { UserRole } from "../utilities/UserRole";
import { Md5 } from "md5-typescript";
import { User } from "../entities/user.entity";
import { Helper } from "../../common/utilities/Helper";
import { Request, Response } from "express";
import { Code } from "../entities/codes.entity";
import { AuthenticationController } from "../../authentication/controllers/authentication.controller";
const UUID = require("uuid/v1");

const accountSid = 'ACea4210396ed1e24b0cde633cb4321631';
// const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = '8b9c8ff3b3dc336d9eba6f4edb52000f'
// const authToken = process.env.TWILIO_ACCOUNT_AUTH_TOKEN;

const client = require('twilio')(accountSid, authToken);


export class UserService {

  static list = async (
    queryStringProcessor: QueryStringProcessor,
    filter: any
  ) => {
    const userRepository = getCustomRepository(UserRepository);

    return await userRepository.list(queryStringProcessor, filter);
  };

  static insert = async (userPayload, request: Request, response: Response) => {
    const userRepository = getRepository(User)

    if (userPayload.phoneNumber.slice(0, 3) === '355') userPayload.phoneNumber = userPayload.phoneNumber.slice(3, userPayload.phoneNumber.length)
    if (userPayload.phoneNumber[0] === '0') userPayload.phoneNumber = userPayload.phoneNumber.slice(1, userPayload.phoneNumber.length);
    userPayload.phoneNumber = '355' + userPayload.phoneNumber

    const isExisting = await userRepository.findOne({ where: { phoneNumber: userPayload.phoneNumber } })
    if (isExisting) throw ('User with this number already exists')

    const codeRepository = getRepository(Code)

    const now = new Date()

    let isValidCode = await codeRepository.createQueryBuilder("c")
      .where("value = :code", { code: userPayload.code })
      .andWhere("is_used = :isUsed", { isUsed: false })
      .getMany();

    const isValid = isValidCode.filter(code => code.tsExpirationDate > now)


    if (!isValid.length) throw ('Code not valid or expired');

    const user = userRepository.create({
      ...userPayload,
      password: Md5.init(userPayload.password),
      role: userPayload.role ? userPayload.role : UserRole.USER,
    });

    await userRepository.save(user);
    await codeRepository.save({ ...isValid[0], isUsed: true })

    request.body = {
      password: userPayload.password,
      ...(userPayload.phoneNumber && { phoneNumber: userPayload.phoneNumber }),
      ...(userPayload.email && { email: userPayload.email })
    }
    await AuthenticationController.login(request, response)
  };

  static getById = async (userId: number) => {
    const userRepository = getCustomRepository(UserRepository);

    return await userRepository.findById(userId);
  };

  static update = async (userPayload, currentUser: User) => {
    const userRepository = getCustomRepository(UserRepository);

    if (userPayload.newPassword && userPayload.confirmPassword && (userPayload.newPassword === userPayload.confirmPassword)) {
      userPayload.password = Md5.init(userPayload.newPassword);
    }


    const finalUser = userRepository.merge(currentUser, userPayload);
    await userRepository.save(finalUser);

    return finalUser;
  };

  static deleteById = async (userId: number) => {
    const userRepository = getCustomRepository(UserRepository);

    await userRepository.deleteById(userId);
  };

  static updatePassword = async (
    passwordPayload: string,
    currentUser: User
  ) => {
    const userRepository = getCustomRepository(UserRepository);

    if (Helper.isDefined(passwordPayload)) {
      passwordPayload = Md5.init(passwordPayload);
    }

    const finalUser = userRepository.save({
      ...currentUser,
      password: passwordPayload,
    });
    return finalUser;
  };

  public static patchMe = async (request: Request, response: Response) => {
    const userRepository = getRepository(User);
    try {
      const isMatchingUser = await userRepository.findOneOrFail({
        where: {
          email: request.body.email,
          id: response.locals.jwt.userId,
        }
      });

      if (isMatchingUser) {
        const { body: { newPassword, confirmPassword } } = request;
        if (newPassword && confirmPassword && (newPassword === confirmPassword)) {
          request.body.password = Md5.init(newPassword);
        }

        const user = userRepository.merge(isMatchingUser, { ...request.body })
        await userRepository.save(user)
        return [request.body, null];
      }
      throw new Error("missmatching user");
    } catch (error) {
      return [null, error]
    }
  }

  public static async checkPhoneNumber(phoneNumber: string, successCallback: Function, errCallback: Function, codeExisting?: string) {
    if (phoneNumber.slice(0, 3) === '355') phoneNumber = phoneNumber.slice(3, phoneNumber.length)
    if (phoneNumber[0] === '0') phoneNumber = phoneNumber.slice(1, phoneNumber.length);

    let code;
    if (!codeExisting) {
      code = new Code();
      const codeRepository = getRepository(Code);
      await codeRepository.save(code);

    }

    console.log({ phoneNumber })

    client.messages
      .create({
        // from: process.env.TWILIO_PHONE_NUMBER,
        from: '18507530730',
        to: '+355' + phoneNumber,
        body: `Verification code for your CSOA account: ${codeExisting ?? code.value}. The code is valid for 1 hour from now.`
      })
      .then(successCallback)
      .catch(err => errCallback(err))
      .done()
  }
  static async insertProfilePicture(request: Request, response: Response) {
    const userRepository = getRepository(User);
    const user = await userRepository.findOneOrFail({ where: { id: response.locals.jwt.userId } });

    if (request.file) user.profilePicture = request.file.path;
    else user.profilePicture = null;

    return userRepository.save(user);

  }
}
