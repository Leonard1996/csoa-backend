import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { Common } from "../../common/entities/common";
import { EventTeamUsers } from "../../event/entities/event.team.users.entity";
import { User } from "../../user/entities/user.entity";
import { Team } from "./team.entity";

@Entity("teams_users")
export class TeamUsers extends Common {
  @Column("varchar", {
    nullable: true,
    name: "sport",
  })
  public sport: string;

  @Column("tinyint", {
    nullable: true,
    name: "isConfirmed",
  })
  public isConfirmed: boolean;

  @ManyToOne(() => User, (user) => user.players)
  public player: User;
  @Column("int", {
    nullable: true,
  })
  playerId: number;

  @ManyToOne(() => Team, (team) => team.players)
  public team: Team;
  @Column("int", {
    nullable: true,
  })
  teamId: number;

  @OneToMany(() => EventTeamUsers, (eventTeamUser) => eventTeamUser.teamUser)
  eventsTeamUser: EventTeamUsers[];
}
