import { vehicles } from "./vehicles";
import type { VehicleId } from "./vehicle.types";
import { VehicleCard } from "./VehicleCard";

export function VehicleGrid({ onSelect }: { onSelect: (id: VehicleId) => void }) {
  return (
    <section id="veiculos" className="vehicles-section" aria-labelledby="vehicles-heading">
      <div className="section-heading" data-reveal>
        <div>
          <p className="section-kicker">Oportunidades na região</p>
          <h2 id="vehicles-heading">Veículos selecionados de Sorocaba</h2>
        </div>
        <p>Modelos selecionados na região de Sorocaba e prontos para você conhecer ou financiar.</p>
      </div>
      <div className="vehicles-grid">{vehicles.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} onSelect={onSelect} />)}</div>
      <p className="catalog-note">Condições especiais, financiamento facilitado e disponibilidade sujeitos a confirmação com nossos consultores.</p>
    </section>
  );
}
