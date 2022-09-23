import { Column, Entity, Index, ManyToOne } from "typeorm";
import { Common } from "../../common/entities/common";
import { Event } from "../../event/entities/event.entity";
import { Team } from "../../team/entities/team.entity";
import { User } from "../../user/entities/user.entity";

export enum RequestStatus {
  CONFIRMED = "confirmed",
  WAITING_FOR_CONFIRMATION = "waiting_for_confirmation",
  REFUSED = "refused",
}

@Entity("requests")
@Index(["sender", "receiver", "sport", "status"], { unique: true })
export class Request extends Common {
  @ManyToOne(() => User, (user) => user.sentRequests)
  public sender: User;
  @Column("int", { nullable: true })
  senderId: number;

  @ManyToOne(() => User, (user) => user.receivedRequests)
  public receiver: User;
  @Column("int", { nullable: true })
  receiverId: number;

  @ManyToOne(() => Team, (team) => team.sentRequests)
  public senderTeam: Team;
  @Column("int", { nullable: true })
  senderTeamId: number;

  @ManyToOne(() => Team, (team) => team.receivedRequests)
  public receiverTeam: Team;
  @Column("int", { nullable: true })
  receiverTeamId: number;

  @ManyToOne(() => Event, (event) => event.eventRequests)
  public event: Event;
  @Column("int", { nullable: true })
  eventId: number;

  @Column("varchar", { nullable: true })
  sport: string;

  @Column("varchar", { nullable: true })
  status: string;
}
