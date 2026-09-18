"use client";

import { useState } from "react";
import { QualificationForm } from "@/features/qualification/QualificationForm";
import { VehicleGrid } from "@/features/vehicles/VehicleGrid";
import type { VehicleId } from "@/features/vehicles/vehicle.types";

export function HomeExperience({ initialSelectedVehicleId = null }: { initialSelectedVehicleId?: VehicleId | null }) {
  const [selectedVehicleId, setSelectedVehicleId] = useState<VehicleId | null>(initialSelectedVehicleId);

  function selectVehicle(id: VehicleId) {
    setSelectedVehicleId(id);
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    document.getElementById("qualificacao")?.scrollIntoView?.({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    document.getElementById("qualification-heading")?.focus();
  }

  return (
    <main>
      <QualificationForm selectedVehicleId={selectedVehicleId} />
      <VehicleGrid onSelect={selectVehicle} />
    </main>
  );
}
