"use client";

import * as React from "react";
import { getSupabaseBrowserClient } from "@repo/ui/lib/supabase-browser";

export default function SupabaseAuthCallbackPage() {
  const [message, setMessage] = React.useState("Confirming your DAJEM account...");

  React.useEffect(() => {
    const complete = async () => {
      const next = new URLSearchParams(window.location.search).get("next") || "/dashboard";
      const supabase = getSupabaseBrowserClient();
      if (!supabase) { setMessage("Supabase login is not configured yet. Please contact DAJEM support."); return; }
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session?.access_token) { setMessage("This verification link is invalid or has expired. Please request a new email."); return; }
      const response = await fetch("/api/platform", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "complete-supabase-auth", payload: { accessToken: data.session.access_token } }) });
      const result = await response.json();
      if (!response.ok) { setMessage(result?.error ?? "We could not complete your sign-in."); return; }
      window.location.assign(next);
    };
    void complete();
  }, []);

  return <main className="grid min-h-screen place-items-center bg-muted/30 p-6"><p className="max-w-md rounded-2xl border bg-background p-5 text-center text-sm text-foreground">{message}</p></main>;
}
