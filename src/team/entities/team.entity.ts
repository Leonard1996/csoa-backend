import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { Common } from "../../common/entities/common";
import { Event } from "../../event/entities/event.entity";
import { User } from "../../user/entities/user.entity";
import { TeamUsers } from "./team.users.entity";

@Entity("teams")
export class Team extends Common {
  @Column("varchar", { nullable: true, name: "banner" })
  public banner: string;

  @Column("varchar", { nullable: true, name: "avatar" })
  public avatar: string;

  @Column("varchar", { nullable: true, name: "name" })
  public name: string;

  @Column("varchar", { nullable: true, name: "sport" })
  public sport: string;

  @Column("varchar", { nullable: true, name: "ageRange" })
  public ageRange: string;

  @Column("varchar", { nullable: true, name: "level" })
  public level: string;

  @ManyToOne(() => User, (user) => user.teams)
  public user: User;
  @Column("int", { nullable: true })
  userId: number;

  @OneToMany(() => TeamUsers, (teamUsers) => teamUsers.player)
  players: TeamUsers[];

  @OneToMany(() => Event, (event) => event.organiserTeam)
  eventOrganiser: Event[];

  @OneToMany(() => Event, (event) => event.receiverTeam)
  eventReceiver: Event[];
}
