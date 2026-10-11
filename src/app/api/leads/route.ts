import { NextResponse } from "next/server";
import { vehicles } from "@/features/vehicles/vehicles";
import { choices } from "@/features/qualification/qualification.types";
import type { Answers } from "@/features/qualification/qualification.types";

export async function POST(request: Request) {
  try {
    const answers: Answers = await request.json();

    const selectedVehicle = answers.vehicleInterest
      ? vehicles.find((v) => v.id === answers.vehicleInterest)
      : null;

    const vehicleCategoryLabel =
      choices.vehicleCategory.find((c) => c.value === answers.vehicleCategory)?.label ||
      answers.vehicleCategory ||
      "";

    const purchaseMethodLabel =
      choices.purchaseMethod.find((c) => c.value === answers.purchaseMethod)?.label ||
      answers.purchaseMethod ||
      "";

    const budgetRangeLabel =
      choices.budgetRange.find((c) => c.value === answers.budgetRange)?.label ||
      answers.budgetRange ||
      "";

    const downPaymentRangeLabel =
      choices.downPaymentRange.find((c) => c.value === answers.downPaymentRange)?.label ||
      (answers.downPaymentAmount ? `R$ ${answers.downPaymentAmount}` : answers.downPaymentRange || "");

    const tradeVehicleInfo = answers.tradeVehicleName
      ? `${answers.tradeVehicleName}${answers.tradeVehicleYear ? ` (${answers.tradeVehicleYear})` : ""}`
      : "";

    const specificVehicleInfo = selectedVehicle
      ? `${selectedVehicle.brand} ${selectedVehicle.model} (${selectedVehicle.year})`
      : answers.specificVehicleName || "";

    const formattedLead = {
      timestamp: new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }),
      name: answers.name || "",
      phone: answers.phone || "",
      city: answers.city || "",
      vehicleCategory: vehicleCategoryLabel,
      purchaseMethod: purchaseMethodLabel,
      budgetRange: budgetRangeLabel,
      downPayment: downPaymentRangeLabel,
      monthlyPayment: answers.monthlyPaymentAmount ? `R$ ${answers.monthlyPaymentAmount}` : "",
      tradeVehicle: tradeVehicleInfo,
      desiredVehicle: specificVehicleInfo,
    };

    const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formattedLead),
        });
      } catch (webhookError) {
        console.error("Falha ao enviar para o webhook do Google Sheets:", webhookError);
      }
    } else {
      console.warn("GOOGLE_SHEETS_WEBHOOK_URL não configurada no ambiente.");
    }

    return NextResponse.json({ success: true, lead: formattedLead });
  } catch (error) {
    console.error("Erro ao processar envio de lead:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao processar dados do lead" },
      { status: 500 }
    );
  }
}
