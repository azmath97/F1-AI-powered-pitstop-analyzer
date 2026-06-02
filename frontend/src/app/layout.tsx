import type { Metadata } from "next";
import { QueryProvider } from "@/components/providers/query-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "StintSync",
  description: "Formula 1 pit-stop strategy and tyre-stint analysis console",
  openGraph: {
    title: "StintSync",
    description: "Formula 1 pit-stop strategy and tyre-stint analysis console",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "StintSync",
    description: "Formula 1 pit-stop strategy and tyre-stint analysis console"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
