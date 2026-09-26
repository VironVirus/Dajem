"use client";

import { Footer, Header, SupportView } from "@repo/ui";

export default function SupportPage() {
  return <div className="flex min-h-screen flex-col"><Header activeApp="landing" /><main className="container mx-auto flex-1 px-4 py-8 pb-28 sm:px-6 lg:px-8"><SupportView /></main><Footer /></div>;
}
