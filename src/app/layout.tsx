import type { Metadata } from "next";
import localFont from "next/font/local";
import { MetaPixel } from "@/components/layout/MetaPixel";
import { ScrollReveal } from "@/components/layout/ScrollReveal";
import "./globals.css";

const inter = localFont({ src: "./fonts/inter-latin.woff2", variable: "--font-inter", weight: "100 900", display: "swap" });
const jakarta = localFont({ src: "./fonts/plus-jakarta-sans-latin.woff2", variable: "--font-jakarta", weight: "200 800", display: "swap" });

export const metadata: Metadata = {
  title: "AfinityCar | Sua busca por um carro começa aqui",
  description: "Conte à AfinityCar o que você procura e conheça os veículos selecionados. Atendimento humano em Sorocaba, SP.",
  openGraph: { title: "AfinityCar | Sua busca por um carro começa aqui", description: "Uma conversa simples para encontrar um veículo que combine com você.", type: "website", locale: "pt_BR" },
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="pt-BR" className={`${inter.variable} ${jakarta.variable}`}><body>{children}<ScrollReveal /><MetaPixel /></body></html>;
}
