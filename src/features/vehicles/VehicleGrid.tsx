import { vehicles } from "./vehicles";
import type { VehicleId } from "./vehicle.types";
import { VehicleCard } from "./VehicleCard";

export function VehicleGrid({ onSelect }: { onSelect: (id: VehicleId) => void }) {
  return (
    <section id="veiculos" className="vehicles-section" aria-labelledby="vehicles-heading">
      <div className="section-heading" data-reveal>
        <div>
          <p className="section-kicker">Para começar sua busca</p>
          <h2 id="vehicles-heading">Quatro carros para conhecer</h2>
        </div>
        <p>Escolha um veículo para contar à gente do seu interesse, ou siga pelo formulário acima.</p>
      </div>
      <div className="vehicles-grid">{vehicles.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} onSelect={onSelect} />)}</div>
      <p className="catalog-note">Condições especiais, financiamento facilitado e disponibilidade sujeitos a confirmação com nossos consultores.</p>
    </section>
  );
}
