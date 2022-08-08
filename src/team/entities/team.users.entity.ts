import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { Common } from "../../common/entities/common";
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

  @Column("number", {
    nullable: true,
  })
  playerId: number;

  @ManyToOne(() => Team, (team) => team.players)
  public team: Team;

  @Column("number", {
    nullable: true,
  })
  teamId: number;
}
