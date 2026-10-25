import { vehicles } from "./vehicles";
import type { VehicleId } from "./vehicle.types";
import { VehicleCard } from "./VehicleCard";

export function VehicleGrid({ onSelect }: { onSelect: (id: VehicleId) => void }) {
  return (
    <section id="veiculos" className="vehicles-section" aria-labelledby="vehicles-heading">
      <div className="section-heading" data-reveal>
        <div>
          <p className="section-kicker">Oportunidades na região</p>
          <h2 id="vehicles-heading">Veículos selecionados de <span className="location-name"><svg className="location-pin" viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z"/></svg>Sorocaba</span></h2>
        </div>
        <p>Modelos selecionados na região de Sorocaba e prontos para você conhecer ou financiar.</p>
      </div>
      <div className="vehicles-grid">{vehicles.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} onSelect={onSelect} />)}</div>
      <p className="catalog-note">Condições especiais, financiamento facilitado e disponibilidade sujeitos a confirmação com nossos consultores.</p>
    </section>
  );
}
