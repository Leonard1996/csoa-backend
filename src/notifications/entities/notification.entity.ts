import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { Common } from "../../common/entities/common";
import { Complex } from "../../complex/entities/complex.entity";
import { User } from "../../user/entities/user.entity";

@Entity("notifications")
export class Notification extends Common {
  @Column("tinyint", {
    nullable: true,
    name: "isRead",
  })
  public isRead: boolean;

  @Column("json", {
    nullable: true,
    name: "payload",
  })
  public payload: string;

  @ManyToOne(() => Complex, (complex) => complex.locations)
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
