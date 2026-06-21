"use client";

import { AdminView, Footer, Header } from "@repo/ui";

export default function PoultryAdminPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header activeApp="poultry" />
      <main className="container mx-auto max-w-7xl flex-1 px-4 py-16">
        <AdminView />
      </main>
      <Footer />
    </div>
  );
}
