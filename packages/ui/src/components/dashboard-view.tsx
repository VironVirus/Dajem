"use client";

import * as React from "react";
import { ArrowRight, Bell, Building2, CheckCircle2, Clock3, Download, Home, Map, Pencil, Printer, ReceiptText, ShoppingCart, UserCircle2, WalletCards } from "lucide-react";
import type { Order } from "../lib/store";
import { getAppBaseUrl } from "../lib/store";
import { cn } from "../lib/utils";
import { Badge } from "./badge";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Input } from "./input";
import { Label } from "./label";
import { Select } from "./select";
import { useDajem } from "./dajem-provider";
import { AuthenticatorSecurityCard } from "./authenticator-security-card";
import { localGovernmentsForState, nigeriaStates } from "../lib/nigeria-locations";

type DashboardSection = "overview" | "billing" | "properties" | "surveys" | "profile" | "notifications";

const dashboardSections = [
  { id: "overview", label: "Home", icon: Home },
  { id: "billing", label: "Bills", icon: ReceiptText },
  { id: "properties", label: "Homes", icon: Building2 },
  { id: "surveys", label: "Surveys", icon: Map },
  { id: "profile", label: "Profile", icon: UserCircle2 },
  { id: "notifications", label: "Updates", icon: Bell },
] satisfies Array<{ id: DashboardSection; label: string; icon: typeof Home }>;

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(amount);
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);
}

function serviceName(order: Order) {
  return order.app === "farms" ? "DAJEM Farms" : order.app === "homes" ? "DAJEM Homes" : "DAJEM Orbital";
}

function paymentMethod() {
  return "Flutterwave";
}

function deliveryConfirmationUrl(order: Order, whatsappNumber: string) {
  const number = whatsappNumber.replace(/\D/g, "");
  if (!number) return null;
  const message = [
    "Hello DAJEM Farms, I have paid and need to arrange delivery for my order.",
    `Order ID: ${order.id}`,
    `Invoice: ${order.invoiceNumber}`,
    `Payment status: ${order.paymentStatus}`,
  ].join("\n");
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

function receiptDocument(order: Order) {
  const items = order.items.map((item) => `<tr><td>${escapeHtml(item.name)}${item.variantLabel ? `<br><small>${escapeHtml(item.variantLabel)}</small>` : ""}</td><td>${item.quantity}</td><td>${formatCurrency(item.price * item.quantity)}</td></tr>`).join("");
  const delivery = order.delivery
    ? `<tr><td>${escapeHtml(order.delivery.serviceName)}<br><small>${escapeHtml(order.delivery.localGovernment)}, ${escapeHtml(order.delivery.state)}</small></td><td>1</td><td>${order.delivery.requiresWhatsAppConfirmation ? "To be arranged" : order.delivery.fee === 0 ? "Free" : formatCurrency(order.delivery.fee)}</td></tr>`
    : "";
  const deliveryAddress = order.delivery
    ? `<p>Delivery: ${escapeHtml(order.delivery.recipientName)}<br>${escapeHtml(order.delivery.address)}, ${escapeHtml(order.delivery.localGovernment)}, ${escapeHtml(order.delivery.state)}<br>${escapeHtml(order.delivery.phone)} · ${escapeHtml(order.delivery.estimatedDelivery)}</p>`
    : "";
  return `<!doctype html><html><head><meta charset="utf-8"><title>Receipt ${escapeHtml(order.invoiceNumber)}</title><style>body{font-family:Arial,sans-serif;color:#172033;margin:40px;max-width:720px}header{border-bottom:2px solid #0b132b;padding-bottom:18px}h1{margin:0;font-size:26px}p{color:#516076;line-height:1.5}table{width:100%;border-collapse:collapse;margin-top:24px}th,td{text-align:left;padding:12px 8px;border-bottom:1px solid #dce3ec}th:last-child,td:last-child{text-align:right}.total{font-size:20px;font-weight:700;text-align:right;margin-top:18px}small{color:#64748b}</style></head><body><header><h1>DAJEM Group Limited</h1><p>Payment receipt<br>Invoice: <strong>${escapeHtml(order.invoiceNumber)}</strong><br>Date: ${escapeHtml(order.date)}<br>Service: ${escapeHtml(serviceName(order))}</p></header><table><thead><tr><th>Item</th><th>Qty</th><th>Amount</th></tr></thead><tbody>${items}${delivery}</tbody></table><p class="total">Paid: ${formatCurrency(order.total)}</p>${deliveryAddress}<p>Payment reference: ${escapeHtml(order.reference)}<br>Payment method: ${escapeHtml(paymentMethod())}</p></body></html>`;
}

function receiptDownloadHref(order: Order) {
  return `data:text/html;charset=utf-8,${encodeURIComponent(receiptDocument(order))}`;
}

function printReceipt(order: Order) {
  // Keep the newly opened page reachable until the receipt markup has loaded.
  // Chrome can return an unusable window when `noopener` is passed here.
  const popup = window.open("", "_blank", "popup,width=820,height=760");
  if (!popup) {
    window.alert("Your browser blocked the receipt window. Please allow pop-ups for this site and try again.");
    return;
  }

  let didPrint = false;
  const openPrintDialog = () => {
    if (didPrint || popup.closed) return;
    didPrint = true;
    popup.focus();
    popup.print();
  };

  popup.addEventListener("load", openPrintDialog, { once: true });
  popup.document.open();
  popup.document.write(receiptDocument(order));
  popup.document.close();
  window.setTimeout(openPrintDialog, 400);
}

function isDashboardSection(value: string): value is DashboardSection {
  return dashboardSections.some((section) => section.id === value);
}

export function DashboardView() {
  const { snapshot: fullSnapshot, currentUser, isBootstrapping, isBusy, navigateToUrl, openAuthModal, updateProfile } = useDajem();
  const [activeSection, setActiveSection] = React.useState<DashboardSection>("overview");
  const [profileDraft, setProfileDraft] = React.useState({ name: "", phone: "", country: "Nigeria", address: "", state: "", localGovernment: "" });

  React.useEffect(() => {
    const syncSection = () => {
      const section = window.location.hash.slice(1);
      if (isDashboardSection(section)) setActiveSection(section);
    };
    syncSection();
    window.addEventListener("hashchange", syncSection);
    return () => window.removeEventListener("hashchange", syncSection);
  }, []);

  React.useEffect(() => {
    if (!currentUser) return;
    setProfileDraft({ name: currentUser.name, phone: currentUser.phone, country: currentUser.country || "Nigeria", address: currentUser.address || "", state: currentUser.state || "", localGovernment: currentUser.localGovernment || "" });
  }, [currentUser]);

  const selectSection = (section: DashboardSection) => {
    setActiveSection(section);
    window.history.replaceState(null, "", `${window.location.pathname}#${section}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isBootstrapping) return <div className="rounded-2xl border bg-card p-8 text-sm text-muted-foreground">Loading your account...</div>;
  if (!currentUser) return <Card className="mx-auto max-w-xl border-dashed shadow-none"><CardHeader><Badge variant="secondary" className="w-max">My DAJEM</Badge><CardTitle>Sign in to view your account</CardTitle></CardHeader><CardContent className="space-y-4"><p className="text-sm text-muted-foreground">Keep your purchases, property activity, survey requests, bills, and receipts in one place.</p><div className="flex flex-wrap gap-3"><Button className="bg-primary text-white" onClick={() => openAuthModal("login")}>Log in</Button><Button variant="outline" onClick={() => openAuthModal("signup")}>Create account</Button></div></CardContent></Card>;

  const belongsToCurrentUser = (email: string | undefined) => email?.trim().toLowerCase() === currentUser.email.trim().toLowerCase();
  const snapshot = {
    ...fullSnapshot,
    orders: fullSnapshot.orders.filter((order) => belongsToCurrentUser(order.userEmail)),
    bids: fullSnapshot.bids.filter((bid) => belongsToCurrentUser(bid.userEmail)),
    surveys: fullSnapshot.surveys.filter((survey) => belongsToCurrentUser(survey.userEmail)),
    communicationLogs: fullSnapshot.communicationLogs.filter((log) => belongsToCurrentUser(log.userEmail)),
  };
  const submittedProperties = snapshot.propertyListings.filter((listing) => belongsToCurrentUser(listing.submittedByEmail));
  const paidOrders = snapshot.orders.filter((order) => order.paymentStatus === "Paid");
  const paidTotal = paidOrders.reduce((total, order) => total + order.total, 0);
  const listingBills = submittedProperties.filter((listing) => ["Awaiting Payment", "Payment Submitted"].includes(listing.agentListingPaymentStatus ?? "")).map((listing) => ({ id: listing.id, title: `Listing fee: ${listing.title}`, amount: 20000, state: listing.agentListingPaymentStatus === "Payment Submitted" ? "Payment under review" : "Payment required", href: "/properties/submit" }));
  const surveyBills = snapshot.surveys.filter((survey) => survey.paymentStatus === "Payment Link Sent").map((survey) => ({ id: survey.id, title: `${survey.serviceType} - ${survey.location}`, amount: null, state: "Payment required", href: "/survey/tracker" }));
  const outstandingBills = [...listingBills, ...surveyBills];
  const dueTotal = listingBills.reduce((total, bill) => total + bill.amount, 0);
  const cartItems = snapshot.cart.reduce((total, item) => total + item.quantity, 0);
  const metrics = [
    { label: "Bills due", value: outstandingBills.length, icon: Clock3 },
    { label: "Paid", value: formatCurrency(paidTotal), icon: CheckCircle2 },
    { label: "Receipts", value: paidOrders.length, icon: ReceiptText },
    { label: "Cart", value: cartItems, icon: ShoppingCart },
  ];
  const quickActions = [
    { title: "Survey estimate", href: `${getAppBaseUrl("survey")}/estimate`, icon: Map, tone: "from-cyan-500 to-blue-700" },
    { title: "Shop farm products", href: `${getAppBaseUrl("poultry")}/shop`, icon: ShoppingCart, tone: "from-emerald-500 to-teal-700" },
    { title: "Find a property", href: `${getAppBaseUrl("real-estate")}/listings`, icon: Building2, tone: "from-blue-600 to-slate-900" },
  ];

  const DashboardNav = ({ mobile = false }: { mobile?: boolean }) => <nav aria-label="Account sections" className={cn(mobile ? "grid grid-cols-6 gap-1 overflow-x-auto rounded-2xl border bg-card/90 p-1.5 shadow-sm lg:hidden" : "space-y-1")}>{dashboardSections.map((section) => <button key={section.id} type="button" onClick={() => selectSection(section.id)} className={cn("flex items-center rounded-xl font-semibold transition", mobile ? "min-h-14 min-w-12 flex-col justify-center gap-1 px-1 text-[10px]" : "w-full gap-3 px-3 py-2.5 text-sm", activeSection === section.id ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-accent hover:text-foreground")} aria-current={activeSection === section.id ? "page" : undefined}><section.icon className="h-4 w-4" /><span>{section.label}</span></button>)}</nav>;

  const BillingCard = ({ order }: { order: Order }) => {
    const whatsappUrl = order.delivery?.requiresWhatsAppConfirmation ? deliveryConfirmationUrl(order, snapshot.farmDeliverySettings.whatsappNumber) : null;
    return <article className="rounded-2xl border p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-bold text-foreground">{order.invoiceNumber}</p><p className="text-xs text-muted-foreground">{order.date} · {serviceName(order)}</p></div><Badge className="bg-emerald-600 text-white">Paid</Badge></div><p className="mt-4 text-xl font-black text-foreground">{formatCurrency(order.total)}</p><p className="mt-1 text-xs text-muted-foreground">{paymentMethod()}</p>{order.delivery && <div className="mt-3 rounded-xl bg-muted/60 p-3 text-xs"><p className="font-bold text-foreground">{order.delivery.serviceName} · {order.delivery.requiresWhatsAppConfirmation ? "To be arranged" : order.delivery.fee === 0 ? "Free" : formatCurrency(order.delivery.fee)}</p><p className="mt-1 text-muted-foreground">{order.delivery.localGovernment}, {order.delivery.state} · {order.delivery.estimatedDelivery}</p>{order.delivery.requiresWhatsAppConfirmation && <div className="mt-3 rounded-lg bg-amber-100 p-2.5 text-amber-950 dark:bg-amber-950/35 dark:text-amber-100"><p className="font-bold">Delivery arrangement required</p><p className="mt-1">Order ID: {order.id} · Payment status: {order.paymentStatus}</p>{whatsappUrl ? <a href={whatsappUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex font-bold text-primary hover:underline">Arrange delivery on WhatsApp</a> : <p className="mt-2 font-semibold">The delivery WhatsApp number is being configured. Please open a support ticket.</p>}</div>}</div>}<div className="mt-4 grid grid-cols-2 gap-2"><a href={receiptDownloadHref(order)} download={`${order.invoiceNumber}-receipt.html`} className="inline-flex min-h-9 items-center justify-center gap-1 rounded-xl border px-2 text-xs font-bold text-foreground hover:bg-accent"><Download className="h-3.5 w-3.5" />Download</a><Button size="sm" variant="outline" onClick={() => printReceipt(order)}><Printer className="h-3.5 w-3.5" />Print</Button></div></article>;
  };

  return <div className="grid gap-6 lg:grid-cols-[15rem_minmax(0,1fr)]">
    <aside className="hidden lg:block"><div className="sticky top-24 rounded-[1.5rem] border bg-card/85 p-3 shadow-sm backdrop-blur-xl"><div className="mb-3 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-800 p-4 text-white"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-sm font-black ring-1 ring-white/15">{currentUser.name.slice(0, 2).toUpperCase()}</div><p className="mt-3 truncate text-sm font-bold">{currentUser.name}</p><p className="truncate text-xs text-slate-300">My DAJEM account</p></div><DashboardNav /></div></aside>
    <div className="min-w-0 space-y-5"><DashboardNav mobile />
      <section className="relative overflow-hidden rounded-[1.75rem] border border-white/30 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-5 text-white shadow-xl shadow-slate-950/12 sm:p-7"><div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-400/20 blur-3xl" /><div className="relative flex flex-col gap-2"><Badge variant="secondary" className="w-max">My DAJEM</Badge><h1 className="text-2xl font-bold text-white sm:text-3xl">Hello, {currentUser.name.split(" ")[0]}</h1><p className="max-w-2xl text-sm text-slate-200">Your services, bills, receipts, and updates are all here.</p></div></section>
      {activeSection === "overview" && <><div className="grid grid-cols-2 gap-3 xl:grid-cols-4">{metrics.map((metric) => <Card key={metric.label} className="border-white/45 bg-card/85 shadow-sm backdrop-blur-xl"><CardContent className="flex items-center justify-between p-4 sm:p-5"><div><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground sm:text-xs">{metric.label}</p><p className="mt-1 text-xl font-black text-foreground sm:text-2xl">{metric.value}</p></div><div className="rounded-xl bg-primary/10 p-2.5 text-primary"><metric.icon className="h-5 w-5" /></div></CardContent></Card>)}</div>
        <section><div className="mb-3"><p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Quick actions</p><h2 className="text-xl font-bold text-foreground">What would you like to do?</h2></div><div className="grid gap-3 sm:grid-cols-3">{quickActions.map((action) => <button key={action.title} type="button" onClick={() => void navigateToUrl(action.href)} className="group relative min-h-28 overflow-hidden rounded-[1.35rem] bg-slate-950 p-4 text-left text-white shadow-lg transition hover:-translate-y-0.5"><div className={`absolute inset-0 bg-gradient-to-br ${action.tone} opacity-75`} /><div className="relative flex h-full flex-col justify-between gap-5"><action.icon className="h-5 w-5" /><span className="flex items-center justify-between gap-2 text-sm font-bold">{action.title}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span></div></button>)}</div></section>
        <div className="grid gap-4 xl:grid-cols-2"><Card><CardHeader className="flex-row items-center justify-between space-y-0"><CardTitle className="text-lg">Bills to review</CardTitle><Button variant="ghost" size="sm" onClick={() => selectSection("billing")}>View bills <ArrowRight className="ml-1 h-4 w-4" /></Button></CardHeader><CardContent className="space-y-3">{outstandingBills.length === 0 ? <p className="text-sm text-muted-foreground">You have no bills waiting for payment.</p> : outstandingBills.slice(0, 3).map((bill) => <div key={bill.id} className="flex items-center justify-between gap-3 rounded-xl border p-3"><div className="min-w-0"><p className="truncate text-sm font-bold text-foreground">{bill.title}</p><p className="text-xs text-muted-foreground">{bill.state}</p></div><span className="text-sm font-black text-foreground">{bill.amount === null ? "To be confirmed" : formatCurrency(bill.amount)}</span></div>)}</CardContent></Card><Card><CardHeader className="flex-row items-center justify-between space-y-0"><CardTitle className="text-lg">Latest payment</CardTitle><Button variant="ghost" size="sm" onClick={() => selectSection("billing")}>Receipts <ArrowRight className="ml-1 h-4 w-4" /></Button></CardHeader><CardContent>{paidOrders[0] ? <BillingCard order={paidOrders[0]} /> : <p className="text-sm text-muted-foreground">Your confirmed payments will appear here.</p>}</CardContent></Card></div></>}
      {activeSection === "billing" && <section className="space-y-4"><div className="grid gap-3 sm:grid-cols-2"><Card className="border-amber-300/50 bg-amber-50/55 dark:border-amber-800/40 dark:bg-amber-950/15"><CardContent className="flex items-center gap-4 p-5"><span className="rounded-xl bg-amber-400/20 p-3 text-amber-700 dark:text-amber-300"><WalletCards className="h-5 w-5" /></span><div><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Outstanding bills</p><p className="mt-1 text-2xl font-black text-foreground">{dueTotal ? formatCurrency(dueTotal) : "None"}</p></div></CardContent></Card><Card><CardContent className="flex items-center gap-4 p-5"><span className="rounded-xl bg-emerald-500/10 p-3 text-emerald-600"><CheckCircle2 className="h-5 w-5" /></span><div><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Payments received</p><p className="mt-1 text-2xl font-black text-foreground">{formatCurrency(paidTotal)}</p></div></CardContent></Card></div>
        <Card><CardHeader><Badge variant="secondary" className="w-max">Bills</Badge><CardTitle>Amounts awaiting payment</CardTitle></CardHeader><CardContent className="space-y-3">{outstandingBills.length === 0 ? <p className="text-sm text-muted-foreground">You have no bills waiting for payment.</p> : outstandingBills.map((bill) => <div key={bill.id} className="flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold text-foreground">{bill.title}</p><p className="mt-1 text-xs text-muted-foreground">{bill.state}</p></div><div className="flex items-center gap-3"><p className="font-black text-foreground">{bill.amount === null ? "Amount to be confirmed" : formatCurrency(bill.amount)}</p><Button size="sm" onClick={() => void navigateToUrl(bill.href)}>View</Button></div></div>)}</CardContent></Card>
        <Card><CardHeader><Badge variant="secondary" className="w-max">Receipts</Badge><CardTitle>Payments you have made</CardTitle></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2">{paidOrders.length === 0 ? <p className="text-sm text-muted-foreground">Once a payment is received, its receipt will be available here.</p> : paidOrders.map((order) => <BillingCard key={order.id} order={order} />)}</CardContent></Card></section>}
      {activeSection === "properties" && <Card><CardHeader><Badge variant="secondary" className="w-max">DAJEM Homes</Badge><CardTitle>Property activity</CardTitle></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2">{snapshot.bids.length === 0 && submittedProperties.length === 0 ? <p className="text-sm text-muted-foreground">No property activity yet.</p> : <>{submittedProperties.map((listing) => <div key={listing.id} className="rounded-2xl border p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-bold text-foreground">{listing.title}</p><p className="text-xs text-muted-foreground">{listing.location}</p></div><Badge variant={listing.status === "Approved" ? "default" : listing.status === "Rejected" ? "destructive" : "secondary"}>{listing.status}</Badge></div><p className="mt-4 text-sm font-bold text-foreground">Listing: {formatCurrency(listing.price)}</p></div>)}{snapshot.bids.map((bid) => <div key={bid.id} className="rounded-2xl border p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-bold text-foreground">{bid.propertyTitle}</p><p className="text-xs text-muted-foreground">{bid.propertyLocation}</p></div><Badge variant={bid.status === "Connected" ? "default" : bid.status === "Rejected" ? "destructive" : "secondary"}>{bid.status}</Badge></div><p className="mt-4 text-sm font-bold text-foreground">Your bid: {formatCurrency(bid.bidAmount)}</p></div>)}</>}</CardContent></Card>}
      {activeSection === "surveys" && <Card><CardHeader><Badge variant="secondary" className="w-max">DAJEM Orbital</Badge><CardTitle>Survey tracker</CardTitle></CardHeader><CardContent className="grid gap-3 xl:grid-cols-2">{snapshot.surveys.length === 0 ? <p className="text-sm text-muted-foreground">No survey requests yet.</p> : snapshot.surveys.map((survey) => <div key={survey.id} className="rounded-2xl border p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-bold text-foreground">{survey.location}</p><p className="text-xs text-muted-foreground">{survey.applicationNumber ?? survey.id} · {survey.serviceType}</p></div><Badge variant={survey.status === "Completed & Sent" ? "default" : survey.status === "Rejected" ? "destructive" : "secondary"}>{survey.status}</Badge></div>{survey.paymentStatus && <p className="mt-3 text-xs font-bold text-primary">{survey.paymentStatus}</p>}<details className="mt-3 rounded-xl bg-muted/45 p-3 text-sm"><summary className="cursor-pointer font-bold text-foreground">View request details</summary><p className="mt-2 whitespace-pre-line text-muted-foreground">{survey.description}</p></details></div>)}</CardContent></Card>}
      {activeSection === "profile" && <section className="space-y-4"><Card><CardHeader><Badge variant="secondary" className="w-max">My profile</Badge><CardTitle>Keep your contact details current</CardTitle><p className="text-sm text-muted-foreground">Your unique customer ID is <span className="font-bold text-foreground">{currentUser.id}</span>. Address changes are recorded in the DAJEM audit log.</p></CardHeader><CardContent><form className="grid gap-4 sm:grid-cols-2" onSubmit={(event) => { event.preventDefault(); void updateProfile(profileDraft); }}><div className="space-y-1.5"><Label htmlFor="profile-name">Full name</Label><Input id="profile-name" value={profileDraft.name} onChange={(event) => setProfileDraft((current) => ({ ...current, name: event.target.value }))} required /></div><div className="space-y-1.5"><Label htmlFor="profile-phone">Phone number</Label><Input id="profile-phone" type="tel" value={profileDraft.phone} onChange={(event) => setProfileDraft((current) => ({ ...current, phone: event.target.value }))} required /></div><div className="space-y-1.5 sm:col-span-2"><Label htmlFor="profile-email">Email status</Label><Input id="profile-email" value={currentUser.emailVerified ? `${currentUser.email} (verified)` : `${currentUser.email} (verification required)`} disabled /></div><div className="space-y-1.5 sm:col-span-2"><Label htmlFor="profile-address">Address</Label><Input id="profile-address" value={profileDraft.address} onChange={(event) => setProfileDraft((current) => ({ ...current, address: event.target.value }))} required /></div><Select label="State" value={profileDraft.state} onChange={(event) => setProfileDraft((current) => ({ ...current, state: event.target.value, localGovernment: "" }))} options={[{ value: "", label: "Select state" }, ...nigeriaStates.map((state) => ({ value: state, label: state }))]} /><Select label="Local government" value={profileDraft.localGovernment} disabled={!profileDraft.state} onChange={(event) => setProfileDraft((current) => ({ ...current, localGovernment: event.target.value }))} options={[{ value: "", label: "Select local government" }, ...localGovernmentsForState(profileDraft.state).map((localGovernment) => ({ value: localGovernment, label: localGovernment }))]} /><div className="sm:col-span-2"><Button type="submit" disabled={isBusy} className="bg-primary text-white"><Pencil className="h-4 w-4" />Save profile</Button></div></form></CardContent></Card><AuthenticatorSecurityCard /></section>}
      {activeSection === "notifications" && <Card id="notifications"><CardHeader><Badge variant="secondary" className="w-max">Updates</Badge><CardTitle>Latest activity</CardTitle></CardHeader><CardContent className="space-y-3">{snapshot.communicationLogs.length === 0 ? <p className="text-sm text-muted-foreground">Updates about your activity will appear here.</p> : snapshot.communicationLogs.map((log) => <article key={log.id} className="flex gap-3 rounded-2xl border p-4"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Bell className="h-4 w-4" /></span><div className="min-w-0"><h3 className="font-bold text-foreground">{log.subject}</h3><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{log.message}</p><time className="mt-2 block text-xs font-semibold text-muted-foreground">{new Date(log.createdAt).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</time></div></article>)}</CardContent></Card>}
    </div>
  </div>;
}
