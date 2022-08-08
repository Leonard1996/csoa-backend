import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { Common } from "../../common/entities/common";
import { Event } from "../../event/entities/event.entity";
import { Complex } from "./complex.entity";

@Entity("locations")
export class Location extends Common {
  @Column("varchar", { nullable: true, name: "name" })
  public name: string;

  @Column("decimal", { nullable: true, name: "longitude" })
  public longitude: number;

  @Column("decimal", { nullable: true, name: "latitude" })
  public latitude: number;

  @Column("varchar", { nullable: true, name: "dimensions" })
  public dimensions: string;

  @Column("varchar", { nullable: true, name: "price" })
  public price: string;

  @ManyToOne(() => Complex, (complex) => complex.locations)
  public complex: Complex;
  @Column("int", { nullable: true })
  complexId: number;

  @OneToMany(() => Event, (event) => event.location)
  events: Location[];
}
