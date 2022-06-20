import { Column, Entity, OneToMany } from "typeorm";
import { Common } from "../../common/entities/common";

@Entity("users")
export class User extends Common {
  @Column("varchar", {
    nullable: true,
    length: 256,
    name: "password",
  })
  public password: string | null;

  @Column("varchar", {
    nullable: false,
    length: 256,
    name: "name",
  })
  public name: string;

  @Column("varchar", {
    nullable: true,
    length: 256,
    name: "email",
  })
  public email: string;

  @Column("varchar", {
    nullable: true,
    length: 256,
    name: "role",
  })
  public role: string;

  @Column("varchar", {
    nullable: true,
    length: 256,
    name: "profile_picture",
  })
  public profilePicture?: string;

  @Column("varchar", {
    nullable: false,
    length: 256,
    name: "sex",
  })
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

  @Column("varchar", {
    nullable: false,
    name: "phone_number",
  })
  public phoneNumber: string;

  @Column("varchar", {
    nullable: false,
    name: "address",
  })
  public address: string;

  @Column("timestamp", {
    nullable: false,
    name: "birthday",
  })
  public birthday: Date;

  @Column("json", {
    nullable: false,
    name: "sports",
  })
  public sports: string;

  toResponseObject() {
    return {
      name: this.name,
      sex: this.sex,
      sports: this.sports,
      birthday: this.birthday,
      address: this.address,
      phoneNumber: this.phoneNumber,
      profilePicture: this.profilePicture,
      email: this.email
    }
  }

}
