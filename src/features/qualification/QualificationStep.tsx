import { choices, questions } from "./qualification.types";
import type { Answers, ChoiceKey, StepKey } from "./qualification.types";
import { vehicles } from "@/features/vehicles/vehicles";

export function QualificationStep({ step, value, onChange }: { step: ChoiceKey; value: string | undefined; onChange: (value: string) => void }) {
  return (
    <fieldset className="choice-fieldset">
      <legend className="visually-hidden">{questions[step]}</legend>
      <div className="choice-grid">
        {choices[step].map((choice) => (
          <label key={choice.value} className={`choice-card ${value === choice.value ? "is-selected" : ""}`} onClick={() => { if (value === choice.value) onChange(choice.value); }}>
            <input type="radio" name={step} value={choice.value} checked={value === choice.value} onChange={() => onChange(choice.value)} />
            <span className="choice-indicator" aria-hidden="true" />
            <span>{choice.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

type DetailStepKey = Exclude<StepKey, ChoiceKey | "contact">;

export function DetailStep({ step, answers, onChange }: {
  step: DetailStepKey;
  answers: Answers;
  onChange: (field: keyof Answers, value: string) => void;
}) {
  if (step === "tradeVehicle") {
    return <div className="detail-fields two-fields">
      <label>Qual veículo você tem hoje?<input type="text" maxLength={120} value={answers.tradeVehicleName ?? ""} onChange={(event) => onChange("tradeVehicleName", event.target.value)} placeholder="Ex.: Volkswagen Gol" /></label>
      <label>Ano / modelo <span className="optional-hint">opcional</span><input type="text" maxLength={40} value={answers.tradeVehicleYear ?? ""} onChange={(event) => onChange("tradeVehicleYear", event.target.value)} placeholder="Ex.: 2015" /></label>
    </div>;
  }

  if (step === "specificVehicle") {
    const selectedVehicle = vehicles.find((vehicle) => vehicle.id === answers.vehicleInterest);
    return <div className="detail-fields">
      <label>Modelo, anúncio ou link
        <input type="text" maxLength={200} value={answers.specificVehicleName ?? (selectedVehicle ? `${selectedVehicle.brand} ${selectedVehicle.model}` : "")} onChange={(event) => onChange("specificVehicleName", event.target.value)} placeholder="Escreva livremente o veículo que procura" />
      </label>
    </div>;
  }

  const numeric = step === "downPaymentAmount" || step === "monthlyPaymentAmount";
  const field = step as "city" | "downPaymentAmount" | "monthlyPaymentAmount";
  return <div className="detail-fields"><label>
    {numeric ? "Valor em reais (R$)" : "Sua cidade"}
    <input type={numeric ? "number" : "text"} inputMode={numeric ? "decimal" : "text"} min={numeric ? (step === "monthlyPaymentAmount" ? 1 : 0) : undefined} max={numeric ? (step === "monthlyPaymentAmount" ? 1000000 : 10000000) : undefined} step={numeric ? "0.01" : undefined} maxLength={numeric ? undefined : 80} value={answers[field] ?? ""} onChange={(event) => onChange(field, event.target.value)} placeholder={step === "city" ? "Ex.: Sorocaba" : step === "downPaymentAmount" ? "Ex.: 5000" : "Ex.: 900"} />
  </label>{numeric && <p className="detail-hint">Valor desejado para conversar com a equipe; não é uma proposta de crédito.</p>}</div>;
}

export function ContactStep({ answers, onChange }: { answers: Answers; onChange: (field: "name" | "phone", value: string) => void }) {
  return (
    <div className="contact-fields">
      <label>Seu nome<input type="text" autoComplete="name" maxLength={80} value={answers.name ?? ""} onChange={(event) => onChange("name", event.target.value)} placeholder="Como podemos chamar você?" /></label>
      <label>Seu WhatsApp<input type="tel" inputMode="tel" autoComplete="tel-national" value={answers.phone ?? ""} onChange={(event) => onChange("phone", event.target.value)} placeholder="(15) 99999-9999" /></label>
    </div>
  );
}
