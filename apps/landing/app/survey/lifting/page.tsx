"use client";

import * as React from "react";
import { Footer, Header, Badge, Button, Card, CardContent, Input, Label, Select, useDajem } from "@repo/ui";
import { Download, FileCheck2, ShieldCheck } from "lucide-react";

const documentOptions = ["Land Purchase Receipt", "Allocation Letter", "Deed of Lease / Assignment / Conveyance / Gift", "Irrevocable Power of Attorney", "Old Survey Plan", "Other"];

function SignedFormUpload({ applicationNumber }: { applicationNumber: string }) {
  const [file, setFile] = React.useState<File | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState("");

  const upload = async () => {
    if (!file) return;
    setBusy(true);
    setMessage("");
    try {
      if (file.size > 5 * 1024 * 1024) throw new Error("The form must be 5MB or less.");
      const body = new FormData();
      body.set("documentName", "Signed lifting form");
      body.set("file", file);
      const stored = await fetch("/api/storage/survey-documents", { method: "POST", body });
      const storedResult = await stored.json();
      if (!stored.ok) throw new Error(storedResult.error || "The form could not be uploaded.");
      const linked = await fetch("/api/platform", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "attach-lifting-form", payload: { applicationNumber, attachment: storedResult.attachment } }) });
      const linkedResult = await linked.json();
      if (!linked.ok) throw new Error(linkedResult.error || "The form could not be attached.");
      setMessage("Signed form uploaded for DAJEM review.");
      setFile(null);
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "The form could not be uploaded.");
    } finally {
      setBusy(false);
    }
  };

  return <div className="space-y-2 rounded-xl border bg-muted/20 p-4"><Label htmlFor={`signed-${applicationNumber}`}>Send your completed, signed form online</Label><Input id={`signed-${applicationNumber}`} type="file" accept="application/pdf,image/jpeg,image/png,image/webp,image/heic,image/heif" onChange={(event) => setFile(event.target.files?.[0] ?? null)} /><Button type="button" variant="outline" disabled={!file || busy} onClick={() => void upload()}>{busy ? "Uploading..." : "Upload signed form"}</Button>{message && <p role="status" className="text-xs text-foreground">{message}</p>}</div>;
}

export default function LiftingPage() {
  const { currentUser, isBootstrapping, openAuthModal, snapshot } = useDajem();
  const [form, setForm] = React.useState({ estateId: "", plotNumber: "", buyerName: "", buyerPhone: "", buyerAddress: "", sellerName: "", sellerAddress: "", sellerPhone: "", documentType: "", declarationName: "" });
  const [file, setFile] = React.useState<File | null>(null);
  const [consent, setConsent] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const [application, setApplication] = React.useState("");
  const [estates, setEstates] = React.useState<Array<{ id: string; name: string }>>([]);
  const [plotMatch, setPlotMatch] = React.useState<{ number: string; areaSqm: number; layout: string } | null>(null);
  const [plotChecked, setPlotChecked] = React.useState(false);

  React.useEffect(() => {
    if (!currentUser) return;
    setForm((current) => ({ ...current, buyerName: current.buyerName || currentUser.name, buyerPhone: current.buyerPhone || currentUser.phone, buyerAddress: current.buyerAddress || currentUser.address || "" }));
    void fetch("/api/lifting/plots").then((response) => response.json()).then((result) => setEstates(result.estates ?? [])).catch(() => setEstates([]));
  }, [currentUser]);

  React.useEffect(() => {
    setPlotMatch(null);
    setPlotChecked(false);
    if (!currentUser || !form.estateId || !form.plotNumber.trim()) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      const query = new URLSearchParams({ estate: form.estateId, plot: form.plotNumber });
      void fetch(`/api/lifting/plots?${query}`, { signal: controller.signal }).then((response) => response.json()).then((result) => { setPlotMatch(result.plot ?? null); setPlotChecked(true); }).catch(() => { if (!controller.signal.aborted) setPlotChecked(true); });
    }, 350);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [currentUser, form.estateId, form.plotNumber]);

  const setField = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!currentUser || !plotMatch || !consent || !file) return;
    setBusy(true);
    setError("");
    try {
      if (file.size > 5 * 1024 * 1024) throw new Error("The document must be 5MB or less.");
      const upload = new FormData();
      upload.set("documentName", "Lifting application document");
      upload.set("file", file);
      const uploaded = await fetch("/api/storage/survey-documents", { method: "POST", body: upload });
      const uploadResult = await uploaded.json();
      if (!uploaded.ok) throw new Error(uploadResult.error || "The document could not be uploaded.");
      const documentAttachment = uploadResult.attachment;
      const response = await fetch("/api/platform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start-lifting", payload: { ...form, documentAttachment } }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "The application could not be submitted.");
      setApplication(result.applicationNumber);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The application could not be submitted.");
    } finally {
      setBusy(false);
    }
  };

  return <div className="min-h-screen bg-background text-foreground">
    <Header activeApp="survey" />
    <main className="mx-auto max-w-5xl space-y-6 px-5 py-8 pb-28 sm:px-6 sm:py-12">
      <div className="space-y-3">
        <Badge variant="secondary">DAJEM Orbital · Survey plan</Badge>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Apply for plot lifting</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">Select an estate and enter your plot reference. Your identity and the landowner's authority must be confirmed before a plan can be extracted.</p>
      </div>

      {!currentUser && !isBootstrapping && <Card><CardContent className="flex flex-wrap items-center justify-between gap-3 p-5"><p className="text-sm text-foreground">Sign in to start and track your application.</p><Button onClick={() => openAuthModal("login")}>Log in</Button></CardContent></Card>}

      {application ? <Card className="border-emerald-500/30"><CardContent className="space-y-4 p-6"><FileCheck2 className="h-9 w-9 text-emerald-600" /><h2 className="text-xl font-bold">Application received</h2><p className="text-sm text-muted-foreground">Application {application} was received. KYC and owner authorization are pending; no identity check has been completed yet. You can follow each update in your survey tracker.</p><div className="flex flex-wrap gap-3"><a className="inline-flex min-h-10 items-center rounded-xl border px-4 text-sm font-bold" href="/survey/tracker">Track application</a><a className="inline-flex min-h-10 items-center gap-2 rounded-xl border px-4 text-sm font-bold" href={`/api/lifting/form?application=${encodeURIComponent(application)}`}><Download className="h-4 w-4" />Download your form</a></div><SignedFormUpload applicationNumber={application} /></CardContent></Card>
      : <form className="grid gap-5 lg:grid-cols-[1fr_18rem]" onSubmit={(event) => void submit(event)}>
        <div className="space-y-5">
          <Card><CardContent className="space-y-4 p-5 sm:p-6"><h2 className="text-lg font-bold">1. Estate and plot</h2><Select label="Estate" required value={form.estateId} onChange={(event) => { setField("estateId", event.target.value); setField("plotNumber", ""); }} options={[{ value: "", label: "Select an estate" }, ...estates.map((estate) => ({ value: estate.id, label: estate.name }))]} /><div className="space-y-1.5"><Label htmlFor="lifting-plot">Plot number</Label><Input id="lifting-plot" required value={form.plotNumber} onChange={(event) => setField("plotNumber", event.target.value)} placeholder="As written on your allocation papers" /></div>{form.plotNumber && <p className={`rounded-xl p-3 text-sm ${plotMatch ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300" : "bg-amber-500/10 text-amber-900 dark:text-amber-300"}`}>{plotMatch ? `Plot ${plotMatch.number} · ${plotMatch.areaSqm.toLocaleString("en-NG")} sq.m · ${plotMatch.layout}` : plotChecked ? "Plot not found in this estate. Check the reference before continuing." : "Checking plot reference..."}</p>}</CardContent></Card>
          <Card><CardContent className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6"><h2 className="text-lg font-bold sm:col-span-2">2. Purchaser / allottee</h2><div className="space-y-1.5"><Label htmlFor="lifting-name">Full name</Label><Input id="lifting-name" required value={form.buyerName} onChange={(event) => setField("buyerName", event.target.value)} /></div><div className="space-y-1.5"><Label htmlFor="lifting-email">Verified email</Label><Input id="lifting-email" type="email" disabled value={currentUser?.email ?? ""} /></div><div className="space-y-1.5"><Label htmlFor="lifting-phone">Phone number</Label><Input id="lifting-phone" required type="tel" value={form.buyerPhone} onChange={(event) => setField("buyerPhone", event.target.value)} /></div><div className="space-y-1.5"><Label htmlFor="lifting-address">Address</Label><Input id="lifting-address" required value={form.buyerAddress} onChange={(event) => setField("buyerAddress", event.target.value)} /></div></CardContent></Card>
          <Card><CardContent className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6"><h2 className="text-lg font-bold sm:col-span-2">3. Seller / donor and papers</h2><div className="space-y-1.5"><Label htmlFor="lifting-seller">Seller or donor name</Label><Input id="lifting-seller" required value={form.sellerName} onChange={(event) => setField("sellerName", event.target.value)} /></div><div className="space-y-1.5"><Label htmlFor="lifting-seller-phone">Seller or donor phone</Label><Input id="lifting-seller-phone" required type="tel" value={form.sellerPhone} onChange={(event) => setField("sellerPhone", event.target.value)} /></div><div className="space-y-1.5 sm:col-span-2"><Label htmlFor="lifting-seller-address">Seller or donor address</Label><Input id="lifting-seller-address" value={form.sellerAddress} onChange={(event) => setField("sellerAddress", event.target.value)} /></div><div className="sm:col-span-2"><Select label="Document submitted" required value={form.documentType} onChange={(event) => setField("documentType", event.target.value)} options={[{ value: "", label: "Select document" }, ...documentOptions.map((name) => ({ value: name, label: name }))]} /></div><div className="space-y-1.5 sm:col-span-2"><Label htmlFor="lifting-file">Supporting title document (PDF, JPG, PNG, WEBP, HEIC or HEIF; maximum 5MB)</Label><Input id="lifting-file" required type="file" accept="application/pdf,image/jpeg,image/png,image/webp,image/heic,image/heif" onChange={(event) => setFile(event.target.files?.[0] ?? null)} /><p className="text-xs text-muted-foreground">This document is required. Seller details are recorded for review and are not used as owner authorization contact details.</p></div></CardContent></Card>
        </div>
        <aside className="space-y-4"><Card><CardContent className="space-y-4 p-5"><ShieldCheck className="h-6 w-6 text-primary" /><h2 className="font-bold">Identity and authorization</h2><p className="text-sm text-muted-foreground">Submitting this request starts verification. It does not confirm your identity or ownership, and no plan is released until those checks are complete.</p><div className="space-y-1.5"><Label htmlFor="lifting-declaration">Type your full purchaser name</Label><Input id="lifting-declaration" required value={form.declarationName} onChange={(event) => setField("declarationName", event.target.value)} placeholder="Must match purchaser name" /></div><label className="flex items-start gap-2 text-xs text-foreground"><input type="checkbox" required checked={consent} onChange={(event) => setConsent(event.target.checked)} />I confirm these details are accurate, authorize DAJEM to verify this application, and understand that no plan is released until KYC and owner authorization are approved.</label>{error && <p role="alert" className="rounded-lg bg-red-500/10 p-3 text-xs text-red-700 dark:text-red-300">{error}</p>}<Button type="submit" disabled={busy || !currentUser || !plotMatch || !consent || !file} className="w-full">{busy ? "Submitting..." : "Start lifting verification"}</Button></CardContent></Card><a href="/api/lifting/form?blank=1" className="flex min-h-11 items-center justify-center gap-2 rounded-xl border bg-card px-3 text-sm font-bold"><Download className="h-4 w-4" />Download blank PDF form</a></aside>
      </form>}
      {currentUser && snapshot.surveys.some((survey) => survey.lifting) && <section className="space-y-3"><h2 className="text-xl font-bold">Your lifting applications</h2><div className="grid gap-3 sm:grid-cols-2">{snapshot.surveys.filter((survey) => survey.lifting).map((survey) => <Card key={survey.id}><CardContent className="space-y-3 p-5"><p className="font-bold">{survey.lifting?.estateName} · Plot {survey.lifting?.plotNumber}</p><p className="text-xs text-muted-foreground">{survey.applicationNumber} · KYC: {survey.lifting?.kycStatus} · Owner: {survey.lifting?.authorizationStatus}</p><a href={`/api/lifting/form?application=${encodeURIComponent(survey.applicationNumber ?? "")}`} className="text-sm font-semibold text-primary underline">Download application PDF</a>{survey.status !== "Completed & Sent" && survey.status !== "Rejected" && <SignedFormUpload applicationNumber={survey.applicationNumber ?? ""} />}</CardContent></Card>)}</div></section>}
    </main>
    <Footer />
  </div>;
}
