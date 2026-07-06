import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wally App",
  description: "Previsualizaciones estáticas para Wally App"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
