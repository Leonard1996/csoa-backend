import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { Common } from "../../common/entities/common";
import { User } from "../../user/entities/user.entity";

@Entity("reviews")
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

  @Column("number", {
    nullable: true,
  })
  senderId: number;

  @Column("number", {
    nullable: true,
  })
  receiverId: number;
}
