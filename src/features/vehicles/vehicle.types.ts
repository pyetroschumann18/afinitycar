export const vehicleIds = [
  "onix-plus-2021",
  "corolla-2013",
  "hb20-2015",
  "strada-endurance-2022",
] as const;

export type VehicleId = (typeof vehicleIds)[number];

export type VehicleHighlight = {
  title: string;
  description: string;
};

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
  /** CSS object-position for the cover in the 16:10 card (vertical photos need a lower focus). */
  imagePosition?: string;
  images: readonly string[];
  description: string;
  features?: readonly string[];
  highlights?: readonly VehicleHighlight[];
  conclusion?: string;
  status: "available" | "reserved" | "sold";
  illustrative: true;
};
