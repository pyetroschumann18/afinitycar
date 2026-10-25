"use client";

import { useEffect, useState } from "react";
import { QualificationForm } from "@/features/qualification/QualificationForm";
import { VehicleGrid } from "@/features/vehicles/VehicleGrid";
import { vehicleIds, type VehicleId } from "@/features/vehicles/vehicle.types";

export function HomeExperience({ initialSelectedVehicleId = null }: { initialSelectedVehicleId?: VehicleId | null }) {
  const [selectedVehicleId, setSelectedVehicleId] = useState<VehicleId | null>(initialSelectedVehicleId);

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("veiculo");
    const id = vehicleIds.find((vehicleId) => vehicleId === requested);
    // Syncing from the URL once after mount keeps the page statically rendered.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (id) setSelectedVehicleId(id);
  }, []);

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
