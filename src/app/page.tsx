import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HomeExperience } from "@/features/home/HomeExperience";
import { vehicleIds } from "@/features/vehicles/vehicle.types";

export default async function Home({ searchParams }: { searchParams: Promise<{ veiculo?: string | string[] }> }) {
  const requestedVehicle = (await searchParams).veiculo;
  const selectedVehicleId = vehicleIds.find((id) => id === requestedVehicle) ?? null;
  return <><Header /><HomeExperience initialSelectedVehicleId={selectedVehicleId} /><Footer /></>;
}
