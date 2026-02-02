import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Baseball Academy Operations",
  description: "Rule-based academy management system",
};

import Sidebar from "@/components/layout/Sidebar";
import { Providers } from "./providers";
import LanguageToggle from "@/components/ui/LanguageToggle";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 text-slate-900 min-h-screen flex">
        <Providers>
          <LanguageToggle />
          <Sidebar />
          <main className="flex-1 lg:ml-64 p-8 min-h-screen">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
