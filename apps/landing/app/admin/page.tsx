"use client";

import { AdminView, Footer, Header } from "@repo/ui";

export default function LandingAdminPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header activeApp="landing" />
      <main className="container mx-auto max-w-7xl flex-1 px-3 sm:px-4 py-6 sm:py-8">
        <AdminView />
      </main>
      <Footer />
    </div>
  );
}
