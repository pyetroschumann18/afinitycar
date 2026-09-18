import { describe, expect, it } from "vitest";
import { applyChoice, getSteps } from "@/features/qualification/qualification.types";

describe("conditional qualification flow", () => {
  it("skips financing details for a cash buyer", () => {
    expect(getSteps({ purchaseMethod: "cash", hasSpecificVehicle: "no" })).toEqual([
      "vehicleCategory", "purchaseMethod", "budgetRange", "city", "hasSpecificVehicle", "contact",
    ]);
  });

  it("asks entry range and monthly budget for financing", () => {
    expect(getSteps({ purchaseMethod: "financing", hasSpecificVehicle: "yes" })).toEqual([
      "vehicleCategory", "purchaseMethod", "budgetRange", "downPaymentRange", "monthlyPaymentAmount",
      "city", "hasSpecificVehicle", "specificVehicle", "contact",
    ]);
  });

  it("keeps promissory entry separate from the monthly installment", () => {
    expect(getSteps({ purchaseMethod: "promissory", hasSpecificVehicle: "no" })).toEqual([
      "vehicleCategory", "purchaseMethod", "budgetRange", "downPaymentAmount", "monthlyPaymentAmount",
      "city", "hasSpecificVehicle", "contact",
    ]);
  });

  it("asks about the buyer's current vehicle only on the trade path", () => {
    expect(getSteps({ purchaseMethod: "trade", hasSpecificVehicle: "no" })).toEqual([
      "vehicleCategory", "purchaseMethod", "budgetRange", "tradeVehicle", "city", "hasSpecificVehicle", "contact",
    ]);
  });

  it("clears stale branch values when purchase method changes", () => {
    const next = applyChoice({
      purchaseMethod: "financing", downPaymentRange: "3k_5k", monthlyPaymentAmount: "900", city: "Sorocaba",
    }, "purchaseMethod", "trade");
    expect(next).toEqual({ purchaseMethod: "trade", city: "Sorocaba" });
  });

  it("clears the catalog interest when choosing a motorcycle or no specific vehicle", () => {
    const interested = { vehicleCategory: "car" as const, hasSpecificVehicle: "yes" as const, vehicleInterest: "virtus-2021" as const };
    expect(applyChoice(interested, "vehicleCategory", "motorcycle").vehicleInterest).toBeUndefined();
    expect(applyChoice(interested, "hasSpecificVehicle", "no").vehicleInterest).toBeUndefined();
  });
});
