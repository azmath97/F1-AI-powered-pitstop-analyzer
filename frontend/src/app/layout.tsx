import type { Metadata } from "next";
import { QueryProvider } from "@/components/providers/query-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "StintSync",
  description: "AI-Powered Formula 1 Strategy & Race Intelligence Platform",
  openGraph: {
    title: "StintSync",
    description: "AI-Powered Formula 1 Strategy & Race Intelligence Platform",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "StintSync",
    description: "AI-Powered Formula 1 Strategy & Race Intelligence Platform"
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
