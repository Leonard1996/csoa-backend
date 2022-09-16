import { Between, getCustomRepository, getRepository } from "typeorm";
import { Complex } from "../../complex/entities/complex.entity";
import { Event } from "../../event/entities/event.entity";
import { User } from "../../user/entities/user.entity";
import { UserRepository } from "../../user/repositories/user.repository";

export class DashboardService {
  static async getStatistics() {
    const userRepository = getRepository(User);
    const complexRepository = getRepository(Complex);
    const eventStatistics = getRepository(Event);

    const userStatistics = await userRepository.count({
      where: { role: "user" },
    });
    const complexCount = await complexRepository.count();

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const daysInMonth = new Date(year, month, 0).getDate();

    const events = await eventStatistics.find({
      where: {
        tsCreated: Between(
          new Date(year, month, 1),
          new Date(year, month, daysInMonth)
        ),
      },
    });

    const userReservations = events.filter(
      (event) => event.isUserReservation
    ).length;

    return {
      userStatistics,
      complexCount,
      reservations: events.length,
      userReservations: userReservations,
      complexReservations: events.length - userReservations,
    };
  }
}
