"use client";

import * as React from "react";
import { CheckCircle2, KeyRound, ShieldCheck } from "lucide-react";
import { getSupabaseBrowserClient } from "../lib/supabase-browser";
import { useDajem } from "./dajem-provider";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Input } from "./input";
import { Label } from "./label";

type FactorStatus = "checking" | "unavailable" | "ready" | "enrolled";

export function AuthenticatorSecurityCard() {
  const { completeMfaEnrollment } = useDajem();
  const [status, setStatus] = React.useState<FactorStatus>("checking");
  const [factorId, setFactorId] = React.useState("");
  const [qrCode, setQrCode] = React.useState("");
  const [secret, setSecret] = React.useState("");
  const [code, setCode] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState("");

  const readFactorStatus = React.useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) { setStatus("unavailable"); return; }
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) { setStatus("unavailable"); return; }
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) { setMessage(error.message); setStatus("unavailable"); return; }
    setStatus(data.totp.some((factor) => factor.status === "verified") ? "enrolled" : "ready");
  }, []);

  React.useEffect(() => { void readFactorStatus(); }, [readFactorStatus]);

  const startSetup = async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setBusy(true); setMessage("");
    try {
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "Google Authenticator" });
      if (error) throw error;
      setFactorId(data.id);
      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setMessage("Scan the QR code, then enter the six-digit code shown in Google Authenticator.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "We could not start Google Authenticator setup.");
    } finally { setBusy(false); }
  };

  const verifySetup = async (event: React.FormEvent) => {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !factorId) return;
    setBusy(true); setMessage("");
    try {
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
      if (challengeError) throw challengeError;
      const { error } = await supabase.auth.mfa.verify({ factorId, challengeId: challenge.id, code: code.replace(/\s/g, "") });
      if (error) throw error;
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.access_token) throw new Error("Your secure session expired. Please sign in again.");
      await completeMfaEnrollment(sessionData.session.access_token);
      setFactorId(""); setQrCode(""); setSecret(""); setCode(""); setStatus("enrolled");
      setMessage("Google Authenticator is active. Your DAJEM account is now verified.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "That code could not be verified. Please try the latest code.");
    } finally { setBusy(false); }
  };

  if (status === "checking") return null;
  if (status === "unavailable") return <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><KeyRound className="h-4 w-4 text-primary" />Google Authenticator</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">Sign in again through your verified DAJEM email account before enabling two-factor authentication.</p></CardContent></Card>;
  if (status === "enrolled") return <Card className="border-emerald-500/25 bg-emerald-50/50 dark:bg-emerald-950/15"><CardHeader><CardTitle className="flex items-center gap-2 text-base"><ShieldCheck className="h-5 w-5 text-emerald-600" />Google Authenticator is active</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">A current authenticator code is required whenever you sign in with this Supabase-managed account.</p>{message && <p role="status" className="mt-3 text-sm font-medium text-emerald-700 dark:text-emerald-300">{message}</p>}</CardContent></Card>;

  return <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><ShieldCheck className="h-5 w-5 text-primary" />Protect this account with Google Authenticator</CardTitle><p className="text-sm text-muted-foreground">Use Google Authenticator or any compatible authenticator app. The setup secret never leaves your browser or Supabase.</p></CardHeader><CardContent className="space-y-4">{!factorId ? <Button type="button" onClick={() => void startSetup()} disabled={busy} className="bg-primary text-white">{busy ? "Preparing..." : "Set up Google Authenticator"}</Button> : <form className="space-y-4" onSubmit={verifySetup}><div className="grid gap-4 sm:grid-cols-[180px_1fr]"><div className="rounded-xl border bg-white p-2"><img className="h-full w-full" src={`data:image/svg+xml;utf8,${encodeURIComponent(qrCode)}`} alt="Scan this QR code with Google Authenticator" /></div><div className="space-y-3"><p className="text-sm text-foreground">Scan the code with Google Authenticator. If scanning is unavailable, enter this setup key manually:</p><code className="block break-all rounded-lg bg-muted p-3 text-xs text-foreground">{secret}</code><div className="space-y-1.5"><Label htmlFor="authenticator-setup-code">Six-digit code</Label><Input id="authenticator-setup-code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="123456" /></div></div></div><Button type="submit" disabled={busy || code.length !== 6} className="bg-primary text-white">{busy ? "Verifying..." : "Enable two-factor authentication"}</Button></form>}{message && <p role="status" className="rounded-xl border bg-muted/40 p-3 text-sm text-foreground"><CheckCircle2 className="mr-2 inline h-4 w-4 text-emerald-600" />{message}</p>}</CardContent></Card>;
}
