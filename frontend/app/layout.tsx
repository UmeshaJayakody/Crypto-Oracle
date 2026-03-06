import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { StatusBar } from "@/components/layout/StatusBar";

export const metadata: Metadata = {
  title: "Crypto Oracle — AI Price Prediction",
  description: "AI-powered cryptocurrency price prediction using Chronos-2 and Claude Haiku news intelligence",
  keywords: ["crypto", "bitcoin", "prediction", "AI", "Chronos", "Claude"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="flex h-screen overflow-hidden bg-oracle-bg text-oracle-text">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main content area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Top status bar */}
          <StatusBar />

          {/* Page content */}
          <main className="flex-1 overflow-y-auto bg-oracle-bg">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
