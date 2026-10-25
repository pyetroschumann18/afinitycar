import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HomeExperience } from "@/features/home/HomeExperience";

// Static on purpose: campaign traffic is served from the CDN. The ?veiculo=
// preselection is read in the browser by HomeExperience.
export default function Home() {
  return <><Header /><HomeExperience /><Footer /></>;
}
