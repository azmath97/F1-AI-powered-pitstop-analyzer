import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "F1 Strategy Intelligence",
  description: "Formula 1 strategy intelligence dashboard foundation"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

