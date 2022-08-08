import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { Common } from "../../common/entities/common";
import { Complex } from "../../complex/entities/complex.entity";
import { Location } from "../../complex/entities/location.entity";
import { Team } from "../../team/entities/team.entity";
import { User } from "../../user/entities/user.entity";

@Entity("events")
export class Event extends Common {
  @Column("varchar", { nullable: true, name: "sport" })
  public sport: string;

  @Column("timestamp", { nullable: true, name: "startDate" })
  public startDate: Date;

  @Column("timestamp", { nullable: true, name: "endDate" })
  public endDate: Date;

  @Column("tinyint", { nullable: true, name: "isDraft" })
  public isDraft: boolean;

  @Column("tinyint", { nullable: true, name: "isPublic" })
  public isPublic: boolean;

  @Column("varchar", { nullable: true, name: "name" })
  public name: string;

  @Column("tinyint", { nullable: true, name: "isTeam" })
  public isTeam: boolean;

  @Column("number", { nullable: true, name: "level" })
  public level: number;

  @Column("number", { nullable: true, name: "playersNumber" })
  public playersNumber: number;

  @Column("varchar", { nullable: true, name: "playersAge" })
  public playersAge: string;

  @Column("varchar", { nullable: true, name: "status" })
  public status: string;

  @Column("tinyint", { nullable: true, name: "isWeekly" })
  public isWeekly: boolean;

  @Column("varchar", { nullable: true, name: "result" })
  public result: string;

  @Column("json", { nullable: true, name: "lineups" })
  public lineups: string;

  @ManyToOne(() => Location, (location) => location.events)
  public location: Location;
  @Column("number", { nullable: true })
  locationId: number;

  @ManyToOne(() => User, (user) => user.eventReceiverTeamCaptain)
  public receiverTeamCaptain: User;
  @Column("number", { nullable: true })
  receiverTeamCaptainId: number;

  @ManyToOne(() => User, (user) => user.eventOrganiserTeamCaptain)
  public organiserTeamCaptain: User;
  @Column("number", { nullable: true })
  organiserTeamCaptainId: number;

  @ManyToOne(() => Team, (team) => team.eventOrganiser)
  public organiserTeam: Team;
  @Column("number", { nullable: true })
  organiserTeamId: number;

  @ManyToOne(() => Team, (team) => team.eventReceiver)
  public receiverTeam: Team;
  @Column("number", { nullable: true })
  receiverTeamId: number;
}
