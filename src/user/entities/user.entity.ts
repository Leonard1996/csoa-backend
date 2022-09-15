import { Column, Entity, OneToMany } from "typeorm";
import { Attachment } from "../../attachment/entities/attachment.entity";
import { Common } from "../../common/entities/common";
import { Event } from "../../event/entities/event.entity";
import { Notification } from "../../notifications/entities/notification.entity";
import { Review } from "../../review/entities/review.entity";
import { Team } from "../../team/entities/team.entity";
import { TeamUsers } from "../../team/entities/team.users.entity";

@Entity("users")
export class User extends Common {
  @Column("varchar", { nullable: true, length: 256, name: "password" })
  public password: string | null;

  @Column("varchar", { nullable: false, length: 256, name: "name" })
  public name: string;

  @Column("varchar", { nullable: true, length: 256, name: "email" })
  public email: string;

  @Column("varchar", { nullable: true, length: 256, name: "role" })
  public role: string;

  @Column("varchar", { nullable: true, length: 256, name: "profile_picture" })
  public profilePicture?: string;

  @Column("varchar", { nullable: false, length: 256, name: "sex" })
  public sex: string;

  @Column("varchar", {
    nullable: true,
    length: 256,
    name: "modify_password_token",
  })
  public modifyPasswordToken?: string | null;

  @Column("timestamp", {
    nullable: true,
    name: "ts_modify_password_token_expiration",
  })
  public tsModifyPasswordTokenExpiration?: Date | null;

  @Column("varchar", { nullable: false, name: "phone_number" })
  public phoneNumber: string;

  @Column("varchar", { nullable: false, name: "address" })
  public address: string;

  @Column("timestamp", { nullable: false, name: "birthday" })
  public birthday: Date;

  @Column("json", { nullable: false, name: "sports" })
  public sports: string;

  @OneToMany(() => Review, (review) => review.sender)
  givenReviews: Review[];

  @OneToMany(() => Review, (review) => review.receiver)
  receivedReviews: Review[];

  @OneToMany(() => Notification, (notification) => notification.sender)
  givenNotifications: Notification[];

  @OneToMany(() => Notification, (notification) => notification.receiver)
  receivedNotifications: Notification[];

  @OneToMany(() => Event, (event) => event.organiserTeamCaptain)
  eventOrganiserTeamCaptain: Event[];

  @OneToMany(() => Event, (event) => event.receiverTeamCaptain)
  eventReceiverTeamCaptain: Event[];

  @OneToMany(() => Team, (team) => team.user)
  teams: Team[];

  @OneToMany(() => TeamUsers, (teamUsers) => teamUsers.player)
  players: TeamUsers[];

  @OneToMany(() => Attachment, (attachment) => attachment.user)
  attachments: Attachment[];

  toResponseObject() {
    return {
      name: this.name,
      sex: this.sex,
      sports: this.sports,
      birthday: this.birthday,
      address: this.address,
      phoneNumber: this.phoneNumber,
      profilePicture: this.profilePicture,
      email: this.email,
    };
  }
}
