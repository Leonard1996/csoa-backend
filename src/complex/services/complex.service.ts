import { getRepository } from "typeorm";
import { Complex } from "../entities/complex.entity";

export class ComplexService {
  public static list() {
    const complexRepository = getRepository(Complex);
    return complexRepository.find();
  }
}
