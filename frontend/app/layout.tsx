import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { StatusBar } from "@/components/layout/StatusBar";

export const metadata: Metadata = {
  title: {
    default: "Crypto Oracle",
    template: "%s — Crypto Oracle",
  },
  description: "AI-powered cryptocurrency price prediction using Chronos and Claude Haiku news intelligence",
  keywords: ["crypto", "bitcoin", "prediction", "AI", "Chronos", "Claude"],
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="flex h-screen overflow-hidden" style={{ background: '#06060d', color: '#f1f5f9' }}>
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main content area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Top status bar */}
          <StatusBar />

          {/* Page content */}
          <main className="flex-1 overflow-y-auto oracle-bg-ambient" style={{ background: 'transparent' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
