import { Column, Entity, OneToMany } from "typeorm";
import { Attachment } from "../../attachment/entities/attachment.entity";
import { Common } from "../../common/entities/common";
import { User } from "../../user/entities/user.entity";
import { Location } from "./location.entity";

@Entity("complexes")
export class Complex extends Common {
  @Column("varchar", {
    nullable: true,
    name: "name",
  })
  public name: string;

  @Column("varchar", {
    nullable: true,
    name: "phone",
  })
  public phone: string;

  @Column("json", {
    nullable: true,
    name: "facilities",
  })
  public facilities: string;

  @Column("json", {
    nullable: true,
    name: "sports",
  })
  public sports: string;

  @Column("longtext", {
    nullable: true,
    name: "banner",
  })
  public banner: string;

  @Column("longtext", {
    nullable: true,
    name: "avatar",
  })
  public avatar: string;

  @OneToMany(() => Location, (location) => location.complex)
  locations: Location[];

  @Column("varchar", {
    nullable: true,
  })
  public city: string;

  @Column("json", {
    nullable: true,
  })
  public workingHours: string;

  @Column("decimal", {
    nullable: true,
    name: "longitude",
    scale: 7,
    precision: 10,
  })
  public longitude: number;

  @Column("decimal", {
    nullable: true,
    name: "latitude",
    scale: 7,
    precision: 10,
  })
  public latitude: number;

  @OneToMany(() => User, (user) => user.complex)
  users: User[];

  @OneToMany(() => Attachment, (attachment) => attachment.complex)
  attachments: Attachment[];
}
