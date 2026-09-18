export const vehicleIds = [
  "virtus-2021",
  "corolla-2014",
  "c200-2011",
  "civic-2014",
] as const;

export type VehicleId = (typeof vehicleIds)[number];

export type Vehicle = {
  id: VehicleId;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  fuel: string;
  transmission: string;
  image: string;
  images: readonly string[];
  description: string;
  status: "available" | "reserved" | "sold";
  illustrative: true;
};
