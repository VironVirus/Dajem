"use client";

import { DashboardView, Footer, Header } from "@repo/ui";

export default function LandingDashboardPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header activeApp="landing" />
      <main className="container mx-auto max-w-6xl flex-1 px-4 py-16">
        <DashboardView />
      </main>
      <Footer />
    </div>
  );
}
