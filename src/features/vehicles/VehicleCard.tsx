import Image from "next/image";
import Link from "next/link";
import type { Vehicle } from "./vehicle.types";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const number = new Intl.NumberFormat("pt-BR");

export function VehicleCard({ vehicle, onSelect }: { vehicle: Vehicle; onSelect: (id: Vehicle["id"]) => void }) {
  return (
    <article className="vehicle-card" data-reveal>
      <div className="vehicle-photo">
        <Image src={vehicle.image} alt={`${vehicle.brand} ${vehicle.model}`} fill sizes="(max-width: 1050px) 50vw, 25vw" />
      </div>
      <div className="vehicle-info">
        <div className="vehicle-brand">{vehicle.brand}</div>
        <h3>{vehicle.model}</h3>
        <p className="vehicle-meta">{vehicle.year} <span aria-hidden="true">·</span> {number.format(vehicle.mileage)} km</p>
        <div className="vehicle-bottom"><Link className="vehicle-more" href={`/veiculos/${vehicle.id}`} aria-label={`Ver mais sobre ${vehicle.brand} ${vehicle.model}`}><strong>{currency.format(vehicle.price)}</strong><span>Ver mais <span aria-hidden="true">↗</span></span></Link></div>
        <button type="button" className="vehicle-interest-button" onClick={() => onSelect(vehicle.id)} aria-label={`Selecionar ${vehicle.brand} ${vehicle.model} no formulário`}>Tenho interesse</button>
      </div>
    </article>
  );
}
