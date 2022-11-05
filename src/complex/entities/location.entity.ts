import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { Common } from "../../common/entities/common";
import { Event } from "../../event/entities/event.entity";
import { Complex } from "./complex.entity";

@Entity("locations")
export class Location extends Common {
  @Column("varchar", { nullable: true, name: "name" })
  public name: string;

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

  @Column("json", { nullable: true, name: "isFootball" })
  public isFootball: boolean;

  @Column("json", { nullable: true, name: "isBasketball" })
  public isBasketball: boolean;

  @Column("json", { nullable: true, name: "isTennis" })
  public isTennis: boolean;

  @Column("json", { nullable: true, name: "isVolleyball" })
  public isVolleyball: boolean;

  get baseLocation() {
    return {
      name: this.name,
      dimensions: this.dimensions,
      price: this.price,
    };
  }

  get toResponse() {
    return {
      ...this.baseLocation,
      complex: this.complex?.baseComplex,
    };
  }
}
