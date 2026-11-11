"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function UnifiedMobileAppEntryPage() {
  const router = useRouter();

  useEffect(() => {
    const search = typeof window !== "undefined" ? window.location.search : "";
    router.replace(`/${search}`);
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center text-foreground">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <p className="mt-4 text-sm font-semibold text-muted-foreground">Opening DAJEM unified workspace...</p>
    </div>
  );
}
