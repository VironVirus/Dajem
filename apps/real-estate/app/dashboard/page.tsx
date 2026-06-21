"use client";

import { DashboardView, Footer, Header } from "@repo/ui";

export default function RealEstateDashboardPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header activeApp="real-estate" />
      <main className="container mx-auto max-w-6xl flex-1 px-4 py-16">
        <DashboardView />
      </main>
      <Footer />
    </div>
  );
}
