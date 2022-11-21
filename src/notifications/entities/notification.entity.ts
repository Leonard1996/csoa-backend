import { Column, Entity, ManyToOne } from "typeorm";
import { Common } from "../../common/entities/common";
import { Complex } from "../../complex/entities/complex.entity";
import { User } from "../../user/entities/user.entity";

export enum NotificationType {
  EVENT_CONFIRMED = "eventConfirmed",
  EVENT_COMPLETED_RESULT = "eventCompletedResult",
  EVENT_COMPLETED_REVIEW = "eventCompletedReview",
  REQUEST_CONFIRMED = "requestConfirmed",
  REQUEST_REFUSED = "requestRefused",
}

@Entity("notifications")
export class Notification extends Common {
  @Column("tinyint", {
    nullable: true,
    name: "isRead",
    default: false,
  })
  public isRead: boolean;

  @Column("json", {
    nullable: true,
    name: "payload",
  })
  public payload: string;

  @Column("varchar", {
    nullable: true,
    name: "type",
  })
  public type: string;

  @ManyToOne(() => Complex, (complex) => complex.notifications)
  public complex: Complex;
  @Column("int", {
    nullable: true,
  })
  complexId: number;

  @ManyToOne(() => User, (user) => user.givenNotifications)
  public sender: User;
  @Column("int", {
    nullable: true,
  })
  senderId: number;

  @ManyToOne(() => User, (user) => user.receivedNotifications)
  public receiver: User;
  @Column("int", {
    nullable: true,
  })
  receiverId: number;
}
