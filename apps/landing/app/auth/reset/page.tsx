"use client";

import * as React from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from "@repo/ui";

export default function ResetPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [token, setToken] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmation, setConfirmation] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    setEmail(query.get("email") ?? "");
    setToken(query.get("token") ?? "");
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setMessage("");
    if (token && password !== confirmation) { setMessage("Passwords do not match."); return; }
    setBusy(true);
    try {
      const response = await fetch("/api/platform", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: token ? "reset-password" : "request-password-reset", payload: token ? { email, token, password } : { email } }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error ?? "Unable to continue.");
      setMessage(result.message ?? "Request completed.");
      if (token) { setToken(""); setPassword(""); setConfirmation(""); }
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to continue."); }
    finally { setBusy(false); }
  };

  return <main className="min-h-screen bg-muted/30 px-5 py-16"><Card className="mx-auto max-w-md"><CardHeader><CardTitle>{token ? "Choose a new password" : "Reset your password"}</CardTitle><p className="text-sm text-muted-foreground">{token ? "Choose a new password for your verified DAJEM account." : "Enter your verified account email and we will send a recovery link."}</p></CardHeader><CardContent><form onSubmit={submit} className="space-y-4"><div className="space-y-1.5"><Label htmlFor="reset-email">Email address</Label><Input id="reset-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>{token && <><div className="space-y-1.5"><Label htmlFor="reset-password">New password</Label><Input id="reset-password" type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required /></div><div className="space-y-1.5"><Label htmlFor="reset-confirm">Confirm new password</Label><Input id="reset-confirm" type="password" minLength={8} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required /></div></>}<Button className="w-full bg-primary text-white" disabled={busy}>{busy ? "Please wait..." : token ? "Save new password" : "Email recovery link"}</Button>{message && <p role="status" className="rounded-xl border bg-muted/40 p-3 text-sm text-foreground">{message}</p>}</form></CardContent></Card></main>;
}
