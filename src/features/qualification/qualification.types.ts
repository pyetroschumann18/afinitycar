import type { VehicleId } from "@/features/vehicles/vehicle.types";

export type Answers = {
  vehicleCategory?: string;
  purchaseMethod?: string;
  budgetRange?: string;
  downPaymentRange?: string;
  downPaymentAmount?: string;
  monthlyPaymentAmount?: string;
  tradeVehicleName?: string;
  tradeVehicleYear?: string;
  city?: string;
  hasSpecificVehicle?: string;
  specificVehicleName?: string;
  vehicleInterest?: VehicleId;
  name?: string;
  phone?: string;
};

export type StepKey =
  | "vehicleCategory" | "purchaseMethod" | "budgetRange" | "downPaymentRange"
  | "downPaymentAmount" | "monthlyPaymentAmount" | "tradeVehicle" | "city"
  | "hasSpecificVehicle" | "specificVehicle" | "contact";

export type ChoiceKey = "vehicleCategory" | "purchaseMethod" | "budgetRange" | "downPaymentRange" | "hasSpecificVehicle";

export const choices = {
  vehicleCategory: [
    { value: "car", label: "Carro" }, { value: "motorcycle", label: "Moto" },
  ],
  purchaseMethod: [
    { value: "cash", label: "À vista" },
    { value: "financing", label: "Financiamento" },
    { value: "promissory", label: "Promissória / Carnê" },
    { value: "trade", label: "Troca de veículo" },
  ],
  budgetRange: [
    { value: "up_to_10k", label: "Até R$10.000" },
    { value: "10k_20k", label: "R$10.000 – R$20.000" },
    { value: "20k_30k", label: "R$20.000 – R$30.000" },
    { value: "30k_50k", label: "R$30.000 – R$50.000" },
    { value: "above_50k", label: "Acima de R$50.000" },
  ],
  downPaymentRange: [
    { value: "none", label: "Sem entrada" },
    { value: "up_to_3k", label: "Até R$3.000" },
    { value: "3k_5k", label: "R$3.000 – R$5.000" },
    { value: "5k_10k", label: "R$5.000 – R$10.000" },
    { value: "above_10k", label: "Mais de R$10.000" },
  ],
  hasSpecificVehicle: [
    { value: "yes", label: "Sim" }, { value: "no", label: "Não" },
  ],
} as const;

export const questions: Record<StepKey, string> = {
  vehicleCategory: "O que você procura?",
  purchaseMethod: "Como pretende comprar?",
  budgetRange: "Qual o valor que pretende investir no veículo?",
  downPaymentRange: "Você tem valor de entrada?",
  downPaymentAmount: "Quanto consegue dar de entrada?",
  monthlyPaymentAmount: "Qual valor de parcela cabe no seu orçamento?",
  tradeVehicle: "Sobre o seu veículo atual",
  city: "De qual cidade você é?",
  hasSpecificVehicle: "Já tem algum veículo específico em mente?",
  specificVehicle: "Qual veículo ou anúncio você viu?",
  contact: "Seus dados de contato",
};

export function getSteps(answers: Answers): StepKey[] {
  const steps: StepKey[] = ["vehicleCategory", "purchaseMethod", "budgetRange"];
  if (answers.purchaseMethod === "financing") steps.push("downPaymentRange", "monthlyPaymentAmount");
  if (answers.purchaseMethod === "promissory") steps.push("downPaymentAmount", "monthlyPaymentAmount");
  if (answers.purchaseMethod === "trade") steps.push("tradeVehicle");
  steps.push("city", "hasSpecificVehicle");
  if (answers.hasSpecificVehicle === "yes") steps.push("specificVehicle");
  steps.push("contact");
  return steps;
}

export function applyChoice(answers: Answers, key: ChoiceKey, value: string): Answers {
  const next: Answers = { ...answers, [key]: value };
  if (key === "purchaseMethod" && value !== answers.purchaseMethod) {
    delete next.downPaymentRange;
    delete next.downPaymentAmount;
    delete next.monthlyPaymentAmount;
    delete next.tradeVehicleName;
    delete next.tradeVehicleYear;
  }
  if ((key === "vehicleCategory" && value !== answers.vehicleCategory) ||
      (key === "hasSpecificVehicle" && value === "no")) {
    delete next.vehicleInterest;
    delete next.specificVehicleName;
  }
  return next;
}
