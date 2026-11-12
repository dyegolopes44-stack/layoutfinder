import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LayoutFinder — Encontre inspiração para seu próximo site",
  description:
    "Explore referências de sites, descubra estilos visuais e encontre o ponto de partida para seu próximo projeto.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}