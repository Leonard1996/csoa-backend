import { Column, Entity, Index, ManyToOne } from "typeorm";
import { Common } from "../../common/entities/common";
import { User } from "../../user/entities/user.entity";

@Entity("reviews")
@Index(["sender", "receiver"], { unique: true })
export class Review extends Common {
  @Column("decimal", {
    nullable: true,
    name: "value",
  })
  public value: number;

  @ManyToOne(() => User, (user) => user.givenReviews)
  public sender: User;

  @ManyToOne(() => User, (user) => user.receivedReviews)
  public receiver: User;

  @Column("int", {
    nullable: true,
  })
  senderId: number;

  @Column("int", {
    nullable: true,
  })
  receiverId: number;
}
