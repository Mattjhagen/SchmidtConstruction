import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Schmidt Construction — Retaining Walls, Concrete & Remodeling | Omaha, NE",
    template: "%s | Schmidt Construction",
  },
  description: "Family-owned contractor serving Omaha, NE since 1976. Retaining walls, concrete, drainage, and remodeling. Licensed & insured. Free estimates.",
  metadataBase: new URL("https://www.schmidt-construction.com"),
  openGraph: {
    siteName: "Schmidt Construction",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.variable} min-h-full flex flex-col bg-white text-slate-900 antialiased`}>
        {children}
      </body>
    </html>
  );
}
