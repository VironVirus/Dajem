"use client";

import { AdminView, Footer, Header } from "@repo/ui";

export default function RealEstateAdminPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header activeApp="real-estate" />
      <main className="container mx-auto max-w-7xl flex-1 px-4 py-16">
        <AdminView />
      </main>
      <Footer />
    </div>
  );
}
