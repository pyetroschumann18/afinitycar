import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { VehicleGallery } from "@/features/vehicles/VehicleGallery";
import { vehicles } from "@/features/vehicles/vehicles";

type Props = { params: Promise<{ id: string }> };
const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const number = new Intl.NumberFormat("pt-BR");

export function generateStaticParams() {
  return vehicles.map((vehicle) => ({ id: vehicle.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const vehicle = vehicles.find((item) => item.id === id);
  if (!vehicle) return { title: "Veículo não encontrado | AfinityCar" };
  return {
    title: `${vehicle.brand} ${vehicle.model} | AfinityCar`,
    description: `${vehicle.brand} ${vehicle.model}, ano ${vehicle.year}, ${number.format(vehicle.mileage)} km informados. Veja a foto e conheça os detalhes apresentados pela AfinityCar.`,
  };
}

export default async function VehiclePage({ params }: Props) {
  const { id } = await params;
  const vehicle = vehicles.find((item) => item.id === id);
  if (!vehicle) notFound();
  const name = `${vehicle.brand} ${vehicle.model}`;

  return <>
    <main className="vehicle-detail-page shell">
      <div className="vehicle-detail-navigation"><Link href="/#veiculos">← Voltar aos veículos</Link><span>Conheça o veículo</span></div>
      <div className="vehicle-detail-heading">
        <div><p className="section-kicker">{vehicle.brand} / {vehicle.year}</p><h1>{name}</h1></div>
        <span className="vehicle-detail-year">{vehicle.year}</span>
      </div>
      <div className="vehicle-detail-layout">
        <VehicleGallery images={vehicle.images} name={name} />
        <div className="vehicle-detail-information">
          <div className="vehicle-detail-price"><span>Valor anunciado</span><strong>{currency.format(vehicle.price)}</strong></div>
          <div className="vehicle-detail-description">
            <p>{vehicle.description}</p>

            {vehicle.features && vehicle.features.length > 0 && (
              <div className="vehicle-detail-section">
                <h2>Principais características</h2>
                <ul className="vehicle-features-list">
                  {vehicle.features.map((feature, idx) => (
                    <li key={idx}>
                      <span className="feature-check" aria-hidden="true">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {vehicle.highlights && vehicle.highlights.length > 0 && (
              <div className="vehicle-detail-section">
                <h2>Destaques do veículo</h2>
                <div className="vehicle-highlights-grid">
                  {vehicle.highlights.map((highlight, idx) => (
                    <div key={idx} className="vehicle-highlight-card">
                      <strong>{highlight.title}</strong>
                      <p>{highlight.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {vehicle.conclusion && (
              <p className="vehicle-detail-conclusion">
                <strong>{vehicle.conclusion}</strong>
              </p>
            )}
          </div>
          <dl className="vehicle-detail-facts">
            <div><dt>Ano</dt><dd>{vehicle.year}</dd></div>
            <div><dt>Quilometragem</dt><dd>{number.format(vehicle.mileage)} km</dd></div>
            <div><dt>Câmbio*</dt><dd>{vehicle.transmission}</dd></div>
            <div><dt>Combustível*</dt><dd>{vehicle.fuel}</dd></div>
          </dl>
          <p className="vehicle-detail-disclaimer">* Valores, opcionais e disponibilidade sujeitos a confirmação. Entre em contato para conhecer as condições de financiamento e negociação.</p>
          <Link className="vehicle-detail-cta" href={`/?veiculo=${vehicle.id}#qualificacao`}>Tenho interesse neste veículo <span aria-hidden="true">↗</span></Link>
          <p className="vehicle-detail-cta-note">O formulário abrirá com este carro selecionado. Sem compromisso.</p>
        </div>
      </div>
    </main>
  </>;
}
