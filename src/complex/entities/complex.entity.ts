import { Column, Entity, OneToMany } from "typeorm";
import { Common } from "../../common/entities/common";
import { Notification } from "../../notifications/entities/notification.entity";
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

  @Column("varchar", {
    nullable: true,
    name: "banner",
  })
  public banner: string;

  @Column("varchar", {
    nullable: true,
    name: "avatar",
  })
  public avatar: string;

  @OneToMany(() => Location, (location) => location.complex)
  locations: Location[];

  @OneToMany(() => Notification, (notification) => notification.complex)
  notifications: Notification[];

  @Column("varchar", {
    nullable: true,
  })
  public city: string;

  @Column("decimal", { nullable: true, name: "longitude" })
  public longitude: number;

  @Column("decimal", { nullable: true, name: "latitude" })
  public latitude: number;

  get baseComplex() {
    return {
      id: this.id,
      name: this.name,
      phone: this.phone,
      facilities: this.facilities,
      banner: this.banner,
      avatar: this.avatar,
    };
  }
}
