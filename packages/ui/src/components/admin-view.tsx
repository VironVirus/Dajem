"use client";

import * as React from "react";
import { BarChart3, Building2, ClipboardList, Download, FileText, Headphones, Home, ImageIcon, Package, Plus, ReceiptText, Shield, Sprout, Truck, UploadCloud, Users } from "lucide-react";
import { Badge } from "./badge";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Input } from "./input";
import { Label } from "./label";
import { Select } from "./select";
import { Textarea } from "./textarea";
import { useDajem } from "./dajem-provider";
import type {
  AgentListingPaymentStatus,
  ApprovalStatus,
  FarmDeliverySettings,
  InventoryCategory,
  InventoryItem,
  InventoryStockStatus,
  PropertyCategory,
  PropertyListing,
  PropertyType,
  SurveyDeliveryStatus,
  SurveyService,
  SupportTicketStatus,
} from "../lib/store";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

function splitHighlights(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 6);
}

function joinHighlights(value: string[] | undefined) {
  return (value ?? []).join(", ");
}

async function uploadManagedImage(file: File, scope: "farm" | "property") {
  if (file.size > 5 * 1024 * 1024) throw new Error("Image must be 5MB or less.");
  const formData = new FormData();
  formData.append("scope", scope);
  formData.append("file", file);
  const response = await fetch("/api/storage/images", { method: "POST", credentials: "include", body: formData });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error ?? "Image upload failed.");
  return String(data.imageUrl);
}

function ImagePreview({ imageUrl, fallbackClass }: { imageUrl?: string; fallbackClass: string }) {
  if (imageUrl) {
    return (
      <div
        className="h-24 rounded-xl border bg-cover bg-center"
        style={{ backgroundImage: `linear-gradient(135deg, rgba(15,23,42,.25), rgba(16,185,129,.18)), url(${imageUrl})` }}
      />
    );
  }

  return (
    <div className={`flex h-24 items-center justify-center rounded-xl border ${fallbackClass}`}>
      <ImageIcon className="h-6 w-6 opacity-70" />
    </div>
  );
}

const inventoryCategories: { value: InventoryCategory; label: string }[] = [
  { value: "livestock", label: "Livestock" },
  { value: "grills", label: "Grills" },
  { value: "eggs", label: "Eggs" },
  { value: "consultancy", label: "Farm Consultancy" },
  { value: "produce", label: "Farm Produce" },
  { value: "equipment", label: "Farm Equipment" },
  { value: "agro-allied", label: "Agro-Allied Products" },
];

const stockStatuses: { value: InventoryStockStatus; label: string }[] = [
  { value: "In Stock", label: "In Stock" },
  { value: "Low Stock", label: "Low Stock" },
  { value: "Out of Stock", label: "Out of Stock" },
];

const approvalStatuses: { value: ApprovalStatus; label: string }[] = [
  { value: "Pending Approval", label: "Pending Approval" },
  { value: "Approved", label: "Approved" },
  { value: "Rejected", label: "Rejected" },
];

const farmsImageUrl = "/images/farms-hero-farm-v2.png";
const homesImageUrl = "/images/homes-hero-suite-v2.png";
const orbitalImageUrl = "/images/orbital-hero-field-v2.png";

const propertyTypes: { value: PropertyType; label: string }[] = [
  { value: "sale", label: "For Sale" },
  { value: "short-let", label: "Short-Let" },
  { value: "hotel", label: "Hotel / Suite" },
  { value: "management", label: "Management" },
];

const propertyCategories: { value: PropertyCategory; label: string }[] = [
  { value: "apartment", label: "Apartment" },
  { value: "suite", label: "Suite" },
  { value: "hotel", label: "Hotel" },
  { value: "land", label: "Land" },
  { value: "commercial", label: "Commercial" },
  { value: "short-let", label: "Short-Let" },
];

const blankInventory: InventoryItem = {
  productId: "",
  name: "",
  category: "produce",
  price: 0,
  description: "",
  stockStatus: "In Stock",
  availableUnits: 0,
  imageBg: "bg-emerald-500/10 text-emerald-700",
  imageUrl: farmsImageUrl,
  age: "",
  weight: "",
  shippingWeightKg: 0.25,
  originalPrice: undefined,
  promoPrice: undefined,
  promoEndsAt: "",
  promoLabel: "",
};

type PropertyForm = Omit<PropertyListing, "createdAt" | "date"> & {
  highlightsText: string;
};

const blankProperty: PropertyForm = {
  id: "",
  title: "",
  location: "",
  price: 0,
  type: "short-let",
  category: "short-let",
  beds: 1,
  baths: 1,
  size: 80,
  featured: false,
  imageBg: "from-emerald-700/25 to-slate-900/10",
  imageUrl: homesImageUrl,
  summary: "",
  highlights: [],
  highlightsText: "",
  status: "Approved",
};

const blankService: SurveyService = {
  id: "",
  title: "",
  description: "",
  priceFrom: 0,
  timeline: "By scope",
  imageUrl: orbitalImageUrl,
  color: "text-cyan-600 bg-cyan-500/10",
  status: "Approved",
};

const surveyDeliveryStatuses: SurveyDeliveryStatus[] = [
  "Rate Added",
  "Awaiting Dispatch",
  "Dispatched",
  "Delivered",
  "Cancelled",
];

const supportTicketStatuses: SupportTicketStatus[] = ["Open", "In Progress", "Resolved", "Closed"];

type SurveyDeliveryDraft = {
  status: SurveyDeliveryStatus;
  trackingNumber: string;
};

type AdminArea = "overview" | "farms" | "orbital" | "homes" | "reports" | "support";
type FarmsAction = "add-product" | "manage-products" | "orders" | "delivery-contact";
type HomesAction = "add-listing" | "manage-listings" | "bids";
type OrbitalAction = "services" | "inquiries";
type ReportPeriod = "today" | "week" | "month" | "custom";

type ActivityRow = {
  id: string;
  date: string;
  area: "Farms" | "Orbital" | "Homes";
  activity: string;
  status: string;
  amount?: number;
};

function dateValue(value: string) {
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? null : new Date(timestamp);
}

function startOfDay(value: Date) {
  const result = new Date(value);
  result.setHours(0, 0, 0, 0);
  return result;
}

function reportBounds(period: ReportPeriod, customStart: string, customEnd: string) {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  if (period === "custom") {
    const start = customStart ? startOfDay(new Date(`${customStart}T00:00:00`)) : startOfDay(now);
    const customRangeEnd = customEnd ? new Date(`${customEnd}T23:59:59.999`) : end;
    return { start, end: customRangeEnd };
  }

  const start = startOfDay(now);
  if (period === "week") start.setDate(start.getDate() - 6);
  if (period === "month") start.setDate(1);
  return { start, end };
}

function downloadCsv(filename: string, rows: ActivityRow[]) {
  const header = ["Date", "Business", "Activity", "Status", "Amount (NGN)"];
  const escape = (value: string | number | undefined) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  const content = [header, ...rows.map((row) => [row.date, row.area, row.activity, row.status, row.amount ?? ""])]
    .map((row) => row.map(escape).join(","))
    .join("\n");
  const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function BackupCard() {
  const [passphrase, setPassphrase] = React.useState("");
  const [confirmation, setConfirmation] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [restoreFile, setRestoreFile] = React.useState<File | null>(null);
  const [restorePassphrase, setRestorePassphrase] = React.useState("");
  const [restoreMessage, setRestoreMessage] = React.useState("");

  async function downloadBackup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (passphrase.length < 16 || passphrase.length > 256 || passphrase !== confirmation) {
      setMessage("Enter matching passphrases of 16 to 256 characters.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/backup", {
        method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passphrase }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Backup download failed. Please try again.");
      }
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = `dajem-records-${new Date().toISOString().slice(0, 10)}.encrypted.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setPassphrase("");
      setConfirmation("");
      setMessage("Your encrypted backup has been downloaded. Keep its passphrase and file in separate secure locations.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Backup download failed.");
    } finally {
      setBusy(false);
    }
  }

  async function reviewBackup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!restoreFile) return;
    setBusy(true);
    setRestoreMessage("");
    try {
      const body = new FormData();
      body.append("file", restoreFile);
      body.append("passphrase", restorePassphrase);
      const response = await fetch("/api/admin/backup-review", { method: "POST", credentials: "same-origin", body });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || "Unable to check backup.");
      setRestoreMessage(`Backup verified: ${result.createdAt}; ${result.includesUploads ? `${result.fileCount} uploaded files included` : "records only"}. Nothing has been restored.`);
      setRestorePassphrase("");
    } catch (error) {
      setRestoreMessage(error instanceof Error ? error.message : "Unable to check backup.");
    } finally {
      setBusy(false);
    }
  }

  return <Card><CardHeader><CardTitle>Back up business records</CardTitle>
    <p className="text-sm text-muted-foreground">Download encrypted account and business records, uploaded images, and survey documents. Uploads are limited to 20 MB in total and the encrypted backup to 32 MB; website code and hosting settings require separate backups.</p>
  </CardHeader><CardContent><form onSubmit={downloadBackup} className="space-y-4">
    <p className="text-sm text-muted-foreground">Choose a unique passphrase of at least 16 characters. It cannot be recovered if lost. This download is manual; automatic backups are not yet configured.</p>
    <div className="grid gap-3 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="backup-passphrase">Backup passphrase</Label><Input id="backup-passphrase" type="password" autoComplete="new-password" value={passphrase} onChange={(event) => setPassphrase(event.target.value)} minLength={16} maxLength={256} required /></div>
      <div className="space-y-2"><Label htmlFor="backup-confirmation">Confirm passphrase</Label><Input id="backup-confirmation" type="password" autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} minLength={16} maxLength={256} required /></div></div>
    <Button type="submit" disabled={busy}><Download className="mr-2 h-4 w-4" />{busy ? "Preparing backup..." : "Download encrypted backup"}</Button>
    {message && <p role="status" className="text-sm text-foreground">{message}</p>}
  </form><form onSubmit={reviewBackup} className="mt-6 space-y-4 border-t pt-6">
    <div><h3 className="font-bold text-foreground">Review a backup for recovery</h3><p className="mt-1 text-sm text-muted-foreground">Check an encrypted file and its passphrase before recovery. This does not replace or restore data.</p></div>
    <div className="space-y-2"><Label htmlFor="restore-file">Encrypted backup file</Label><Input id="restore-file" type="file" accept="application/json,.json" required onChange={(event) => setRestoreFile(event.target.files?.[0] ?? null)} /></div>
    <div className="space-y-2"><Label htmlFor="restore-passphrase">Backup passphrase</Label><Input id="restore-passphrase" type="password" autoComplete="off" value={restorePassphrase} onChange={(event) => setRestorePassphrase(event.target.value)} required /></div>
    <Button type="submit" variant="outline" disabled={busy || !restoreFile}>Check backup</Button>
    {restoreMessage && <p role="status" className="text-sm text-foreground">{restoreMessage}</p>}
  </form></CardContent></Card>;
}

export function AdminView() {
  const {
    currentUser,
    snapshot,
    isBusy,
    updateBidStatus,
    updateFarmDeliverySettings,
    updateInventoryItem,
    updatePropertyListingStatus,
    updatePropertyListingAgentPayment,
    updateSurveyDelivery,
    updateSurveyStatus,
    updateSupportTicket,
    upsertPropertyListing,
    upsertSurveyService,
    openAuthModal,
  } = useDajem();
  const [inventoryDrafts, setInventoryDrafts] = React.useState<Record<string, InventoryItem>>({});
  const [newInventory, setNewInventory] = React.useState<InventoryItem>(blankInventory);
  const [selectedInventoryProductId, setSelectedInventoryProductId] = React.useState<string | null>(null);
  const [farmDeliveryDraft, setFarmDeliveryDraft] = React.useState<FarmDeliverySettings>(snapshot.farmDeliverySettings);
  const [ticketNotes, setTicketNotes] = React.useState<Record<string, string>>({});
  const [propertyDraft, setPropertyDraft] = React.useState<PropertyForm>(blankProperty);
  const [serviceDraft, setServiceDraft] = React.useState<SurveyService>(blankService);
  const [serviceEditorOpen, setServiceEditorOpen] = React.useState(false);
  const [deliveryDrafts, setDeliveryDrafts] = React.useState<Record<string, SurveyDeliveryDraft>>({});
  const [mediaError, setMediaError] = React.useState<string | null>(null);
  const [adminFeedback, setAdminFeedback] = React.useState<{ kind: "success" | "error"; message: string } | null>(null);
  const [activeArea, setActiveArea] = React.useState<AdminArea>("overview");
  const [farmsAction, setFarmsAction] = React.useState<FarmsAction>("manage-products");
  const [homesAction, setHomesAction] = React.useState<HomesAction>("manage-listings");
  const [orbitalAction, setOrbitalAction] = React.useState<OrbitalAction>("inquiries");
  const [reportPeriod, setReportPeriod] = React.useState<ReportPeriod>("month");
  const [reportStart, setReportStart] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [reportEnd, setReportEnd] = React.useState(() => new Date().toISOString().slice(0, 10));

  React.useEffect(() => {
    const nextDrafts = Object.fromEntries(snapshot.inventory.map((item) => [item.productId, item]));
    setInventoryDrafts(nextDrafts);
  }, [snapshot.inventory]);

  React.useEffect(() => {
    const nextDrafts = Object.fromEntries(
      snapshot.surveys
        .filter((survey) => survey.delivery)
        .map((survey) => [
          survey.id,
          {
            status: survey.delivery!.status,
            trackingNumber: survey.delivery!.trackingNumber ?? "",
          },
        ]),
    );
    setDeliveryDrafts(nextDrafts);
  }, [snapshot.surveys]);

  React.useEffect(() => {
    setFarmDeliveryDraft(snapshot.farmDeliverySettings);
  }, [snapshot.farmDeliverySettings]);

  const saveInventory = async (item: InventoryItem) => {
    await updateInventoryItem({
      productId: item.productId || undefined,
      name: item.name,
      category: item.category,
      price: item.price,
      description: item.description,
      availableUnits: item.availableUnits,
      stockStatus: item.stockStatus,
      imageUrl: item.imageUrl,
      imageBg: item.imageBg,
      age: item.age,
      weight: item.weight,
      shippingWeightKg: item.shippingWeightKg,
      originalPrice: item.originalPrice,
      promoPrice: item.promoPrice,
      promoEndsAt: item.promoEndsAt,
      promoLabel: item.promoLabel,
    });
  };

  const saveProperty = async (draft: PropertyForm) => {
    await upsertPropertyListing({
      id: draft.id || undefined,
      title: draft.title,
      location: draft.location,
      price: draft.price,
      type: draft.type,
      category: draft.category,
      beds: draft.beds,
      baths: draft.baths,
      size: draft.size,
      featured: draft.featured,
      imageUrl: draft.imageUrl,
      imageBg: draft.imageBg,
      summary: draft.summary,
      highlights: splitHighlights(draft.highlightsText),
      status: draft.status,
    });
    setPropertyDraft(blankProperty);
  };

  const saveService = async (draft: SurveyService) => {
    await upsertSurveyService(draft);
    setServiceDraft(blankService);
    setServiceEditorOpen(false);
  };

  const handleBidStatus = async (bidId: string, status: "Connected" | "Rejected") => {
    setAdminFeedback(null);
    try {
      await updateBidStatus(bidId, status);
      setAdminFeedback({
        kind: "success",
        message: status === "Connected" ? "Client connection marked as complete." : "Bid marked as rejected.",
      });
    } catch (error) {
      setAdminFeedback({
        kind: "error",
        message: error instanceof Error ? error.message : "The bid status could not be updated.",
      });
    }
  };

  if (!currentUser) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Admin Portal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Please log in with an admin account to manage the Dajem Group Limited portal.</p>
          <Button className="bg-primary text-white" onClick={() => openAuthModal("login")}>
            Login as admin
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (currentUser.role !== "admin") {
    return (
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle>Admin Access Required</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          This account is logged in, but it does not have admin privileges.
        </CardContent>
      </Card>
    );
  }

  const metrics = [
    { label: "Users", value: snapshot.users.length, icon: Users },
    { label: "Orders", value: snapshot.orders.length, icon: Package },
    { label: "Pending Properties", value: snapshot.propertyListings.filter((item) => item.status === "Pending Approval").length, icon: Home },
    { label: "Survey Queue", value: snapshot.surveys.filter((survey) => survey.status !== "Completed & Sent").length, icon: ClipboardList },
  ];
  const { start: activityStart, end: activityEnd } = reportBounds(reportPeriod, reportStart, reportEnd);
  const activityRows = [
    ...snapshot.orders.map((order): ActivityRow => ({
      id: order.id,
      date: order.date,
      area: order.app === "farms" ? "Farms" : order.app === "homes" ? "Homes" : "Orbital",
      activity: `Paid invoice ${order.invoiceNumber}`,
      status: order.paymentStatus,
      amount: order.total,
    })),
    ...snapshot.propertyListings.map((property): ActivityRow => ({
      id: property.id,
      date: property.createdAt,
      area: "Homes",
      activity: `Property listing: ${property.title}`,
      status: property.status,
    })),
    ...snapshot.bids.map((bid): ActivityRow => ({
      id: bid.id,
      date: bid.date,
      area: "Homes",
      activity: `Bid: ${bid.propertyTitle}`,
      status: bid.status,
      amount: bid.bidAmount,
    })),
    ...snapshot.surveys.map((survey): ActivityRow => ({
      id: survey.id,
      date: survey.date,
      area: "Orbital",
      activity: `Inquiry: ${survey.serviceType}`,
      status: survey.status,
    })),
  ].filter((row) => {
    const date = dateValue(row.date);
    return date !== null && date >= activityStart && date <= activityEnd;
  }).sort((left, right) => (dateValue(right.date)?.getTime() ?? 0) - (dateValue(left.date)?.getTime() ?? 0));
  const reportValue = activityRows.reduce((total, row) => total + (row.amount ?? 0), 0);
  const farmOrders = snapshot.orders.filter((order) => order.app === "farms");

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-[1.75rem] border border-white/20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-xl shadow-slate-950/12">
        <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-emerald-400/16 blur-3xl" />
        <div className="relative">
          <Badge variant="secondary" className="mb-3">Unified Admin Portal</Badge>
          <h1 className="text-3xl font-bold text-white">DAJEM operations console</h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-200">
            Manage products, listings, service requests, approvals, images, users, and payments from one shared workspace.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-200">
            <span className="rounded-full border border-white/15 bg-white/8 px-3 py-1">Data records: {snapshot.integrations.supabaseConfigured ? "Connected" : "Needs setup"}</span>
            <span className="rounded-full border border-white/15 bg-white/8 px-3 py-1">Payments: {snapshot.integrations.flutterwaveConfigured ? "Available" : "Needs setup"}</span>
          </div>
        </div>
      </div>

      {mediaError && <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{mediaError}</div>}
      {adminFeedback && <div className={`rounded-xl border p-4 text-sm ${adminFeedback.kind === "success" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100" : "border-destructive/30 bg-destructive/10 text-destructive"}`}>{adminFeedback.message}</div>}

      <div className="grid gap-4 md:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="border-white/45 bg-card/78 shadow-sm backdrop-blur-xl">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{metric.label}</p>
                <p className="mt-2 text-3xl font-bold text-foreground">{metric.value}</p>
              </div>
              <div className="rounded-xl bg-primary/10 p-3 text-primary">
                <metric.icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-3 sm:p-4">
          <nav aria-label="Admin areas" className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
            {[
              { id: "overview" as const, label: "Overview", icon: BarChart3, tone: "bg-slate-900 text-white" },
              { id: "farms" as const, label: "Farms admin", icon: Sprout, tone: "bg-emerald-600 text-white" },
              { id: "orbital" as const, label: "Orbital admin", icon: ClipboardList, tone: "bg-cyan-700 text-white" },
              { id: "homes" as const, label: "Homes admin", icon: Building2, tone: "bg-blue-700 text-white" },
              { id: "reports" as const, label: "Reports", icon: FileText, tone: "bg-amber-500 text-slate-950" },
              { id: "support" as const, label: "Support", icon: Headphones, tone: "bg-violet-700 text-white" },
            ].map((area) => (
              <button
                key={area.id}
                type="button"
                onClick={() => setActiveArea(area.id)}
                className={`flex min-h-16 items-center gap-2 rounded-xl px-3 text-left text-xs font-extrabold transition ${activeArea === area.id ? `${area.tone} shadow-lg` : "bg-muted/65 text-muted-foreground hover:bg-accent hover:text-foreground"}`}
              >
                <area.icon className="h-4 w-4 shrink-0" />
                <span>{area.label}</span>
              </button>
            ))}
          </nav>
        </CardContent>
      </Card>

      {activeArea === "overview" && (
        <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <Card>
            <CardHeader><CardTitle>Operations at a glance</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-emerald-500/10 p-4"><p className="text-xs font-bold uppercase tracking-wide text-emerald-800 dark:text-emerald-200">Farm products</p><p className="mt-1 text-2xl font-black text-foreground">{snapshot.inventory.length}</p></div>
              <div className="rounded-xl bg-cyan-500/10 p-4"><p className="text-xs font-bold uppercase tracking-wide text-cyan-800 dark:text-cyan-200">Open inquiries</p><p className="mt-1 text-2xl font-black text-foreground">{snapshot.surveys.filter((survey) => survey.status !== "Completed & Sent").length}</p></div>
              <div className="rounded-xl bg-blue-500/10 p-4"><p className="text-xs font-bold uppercase tracking-wide text-blue-800 dark:text-blue-200">Pending listings</p><p className="mt-1 text-2xl font-black text-foreground">{snapshot.propertyListings.filter((property) => property.status === "Pending Approval").length}</p></div>
              <div className="rounded-xl bg-amber-500/10 p-4"><p className="text-xs font-bold uppercase tracking-wide text-amber-800 dark:text-amber-200">Paid transactions</p><p className="mt-1 text-2xl font-black text-foreground">{snapshot.orders.filter((order) => order.paymentStatus === "Paid").length}</p></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Recent transactions and activity</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {activityRows.slice(0, 6).map((row) => <div key={`${row.area}-${row.id}`} className="grid grid-cols-[5.5rem_1fr_auto] items-center gap-3 rounded-xl border border-border/70 px-3 py-3 text-sm"><span className="text-[11px] font-bold text-muted-foreground">{dateValue(row.date)?.toLocaleDateString("en-NG", { day: "2-digit", month: "short" }) ?? row.date}</span><span className="min-w-0"><span className="block truncate font-bold text-foreground">{row.activity}</span><span className="block text-xs text-muted-foreground">{row.area} · {row.status}</span></span>{row.amount !== undefined && <span className="text-right text-xs font-black text-foreground">{formatCurrency(row.amount)}</span>}</div>)}
              {activityRows.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No recorded activity in this period.</p>}
            </CardContent>
          </Card>
        </div>
      )}

      {activeArea === "overview" && <BackupCard />}

      {activeArea === "reports" && (
        <Card>
          <CardHeader><CardTitle>Activity reports</CardTitle><p className="text-sm text-muted-foreground">Generate a clean activity register across Farms, Orbital, and Homes.</p></CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-[12rem_1fr_1fr_auto] sm:items-end">
              <Select label="Report period" value={reportPeriod} onChange={(event) => setReportPeriod(event.target.value as ReportPeriod)} options={[{ value: "today", label: "Today" }, { value: "week", label: "Last 7 days" }, { value: "month", label: "This month" }, { value: "custom", label: "Custom range" }]} />
              {reportPeriod === "custom" && <><div className="space-y-1.5"><Label htmlFor="report-start">From</Label><Input id="report-start" type="date" value={reportStart} onChange={(event) => setReportStart(event.target.value)} /></div><div className="space-y-1.5"><Label htmlFor="report-end">To</Label><Input id="report-end" type="date" value={reportEnd} onChange={(event) => setReportEnd(event.target.value)} /></div></>}
              <div className="flex gap-2"><Button variant="outline" onClick={() => window.print()}><ReceiptText className="h-4 w-4" />Print</Button><Button className="bg-amber-500 text-slate-950 hover:bg-amber-400" onClick={() => downloadCsv(`dajem-activity-${reportPeriod}.csv`, activityRows)}><Download className="h-4 w-4" />Download</Button></div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3"><div className="rounded-xl border bg-muted/35 p-4"><p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Activities</p><p className="mt-1 text-2xl font-black text-foreground">{activityRows.length}</p></div><div className="rounded-xl border bg-muted/35 p-4"><p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Recorded value</p><p className="mt-1 text-2xl font-black text-foreground">{formatCurrency(reportValue)}</p></div><div className="rounded-xl border bg-muted/35 p-4"><p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Period</p><p className="mt-1 text-sm font-black text-foreground">{activityStart.toLocaleDateString("en-NG", { day: "2-digit", month: "short" })} - {activityEnd.toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" })}</p></div></div>
            <div className="overflow-x-auto rounded-xl border"><div className="min-w-[42rem] divide-y"><div className="grid grid-cols-[7rem_7rem_1fr_8rem_9rem] gap-3 bg-muted/50 px-4 py-3 text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground"><span>Date</span><span>Business</span><span>Activity</span><span>Status</span><span className="text-right">Value</span></div>{activityRows.map((row) => <div key={`report-${row.area}-${row.id}`} className="grid grid-cols-[7rem_7rem_1fr_8rem_9rem] gap-3 px-4 py-3 text-sm"><span className="text-muted-foreground">{dateValue(row.date)?.toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" }) ?? row.date}</span><span className="font-bold text-foreground">{row.area}</span><span className="font-semibold text-foreground">{row.activity}</span><span><Badge variant={row.status === "Paid" || row.status === "Approved" || row.status === "Completed & Sent" ? "default" : row.status === "Rejected" || row.status === "Failed" ? "destructive" : "secondary"}>{row.status}</Badge></span><span className="text-right font-bold text-foreground">{row.amount !== undefined ? formatCurrency(row.amount) : "-"}</span></div>)}{activityRows.length === 0 && <p className="px-4 py-10 text-center text-sm text-muted-foreground">No activity was recorded in the selected period.</p>}</div></div>
          </CardContent>
        </Card>
      )}

      {activeArea === "support" && <Card>
        <CardHeader><CardTitle>Customer support tickets</CardTitle><p className="text-sm text-muted-foreground">Review and respond to tickets raised from any DAJEM business.</p></CardHeader>
        <CardContent className="space-y-3">{snapshot.supportTickets.length === 0 ? <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">No support tickets have been opened yet.</p> : snapshot.supportTickets.map((ticket) => <div key={ticket.id} className="rounded-2xl border p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><p className="font-bold text-foreground">{ticket.subject}</p><Badge variant={ticket.status === "Resolved" || ticket.status === "Closed" ? "default" : ticket.status === "In Progress" ? "secondary" : "outline"}>{ticket.status}</Badge></div><p className="mt-1 text-xs text-muted-foreground">{ticket.userName} · {ticket.userEmail} · {ticket.category} · {new Date(ticket.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</p>{ticket.orderId && <p className="mt-1 text-xs font-bold text-primary">Related order: {ticket.orderId}</p>}</div><Select aria-label={`Ticket status for ${ticket.subject}`} className="w-full sm:w-40" value={ticket.status} onChange={(event) => void updateSupportTicket({ ticketId: ticket.id, status: event.target.value as SupportTicketStatus, adminNote: ticketNotes[ticket.id] ?? ticket.adminNote })} options={supportTicketStatuses.map((status) => ({ value: status, label: status }))} /></div><p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">{ticket.message}</p><div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]"><Textarea aria-label={`Support response for ${ticket.subject}`} value={ticketNotes[ticket.id] ?? ticket.adminNote ?? ""} onChange={(event) => setTicketNotes((current) => ({ ...current, [ticket.id]: event.target.value }))} placeholder="Write a response visible to the customer" /><Button disabled={isBusy} className="bg-violet-700 text-white hover:bg-violet-800" onClick={() => void updateSupportTicket({ ticketId: ticket.id, status: ticket.status, adminNote: ticketNotes[ticket.id] ?? ticket.adminNote })}>Save response</Button></div></div>)}</CardContent>
      </Card>}

      {activeArea === "farms" && <Card>
        <CardHeader>
          <CardTitle>Farms admin</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-2 rounded-xl bg-emerald-500/10 p-2">
            <Button size="sm" variant={farmsAction === "manage-products" ? "default" : "ghost"} className={farmsAction === "manage-products" ? "bg-emerald-600 text-white hover:bg-emerald-700" : "text-emerald-800 dark:text-emerald-200"} onClick={() => setFarmsAction("manage-products")}>Product listing</Button>
            <Button size="sm" variant={farmsAction === "add-product" ? "default" : "ghost"} className={farmsAction === "add-product" ? "bg-emerald-600 text-white hover:bg-emerald-700" : "text-emerald-800 dark:text-emerald-200"} onClick={() => setFarmsAction("add-product")}>Add product</Button>
            <Button size="sm" variant={farmsAction === "orders" ? "default" : "ghost"} className={farmsAction === "orders" ? "bg-emerald-600 text-white hover:bg-emerald-700" : "text-emerald-800 dark:text-emerald-200"} onClick={() => setFarmsAction("orders")}>Farm orders</Button>
            <Button size="sm" variant={farmsAction === "delivery-contact" ? "default" : "ghost"} className={farmsAction === "delivery-contact" ? "bg-emerald-600 text-white hover:bg-emerald-700" : "text-emerald-800 dark:text-emerald-200"} onClick={() => setFarmsAction("delivery-contact")}>Delivery contact</Button>
          </div>
          {farmsAction === "delivery-contact" && <form className="space-y-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.035] p-4" onSubmit={(event) => { event.preventDefault(); void updateFarmDeliverySettings({ ...farmDeliveryDraft, stateRates: [], restOfCountryFee: 0 }); }}>
            <div><p className="font-bold text-foreground">Farm delivery policy</p><p className="mt-1 text-sm text-muted-foreground">Delivery is free only within Enugu East, Enugu North, and Enugu South. Every other destination is arranged after payment; no delivery charge is collected at checkout.</p></div>
            <div className="max-w-md space-y-1.5"><Label htmlFor="farm-support-whatsapp">Delivery WhatsApp number</Label><Input id="farm-support-whatsapp" inputMode="tel" value={farmDeliveryDraft.whatsappNumber} onChange={(event) => setFarmDeliveryDraft((current) => ({ ...current, whatsappNumber: event.target.value.replace(/\D/g, "") }))} placeholder="234XXXXXXXXXX" /><p className="text-xs text-muted-foreground">Customers outside Enugu metropolis are sent here after payment to arrange delivery.</p></div>
            <Button type="submit" disabled={isBusy} className="bg-emerald-600 text-white hover:bg-emerald-700">Save delivery contact</Button>
          </form>}
          {farmsAction === "orders" && <div className="space-y-3">{farmOrders.length === 0 ? <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">No farm orders have been paid yet.</p> : farmOrders.map((order) => <article key={order.id} className="rounded-2xl border p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><p className="font-bold text-foreground">{order.invoiceNumber}</p><Badge variant={order.status === "Completed" ? "default" : "secondary"}>{order.status}</Badge>{order.delivery?.requiresWhatsAppConfirmation && <Badge variant="outline">Delivery arrangement needed</Badge>}</div><p className="mt-1 text-xs text-muted-foreground">{order.userEmail} · {order.date} · {formatCurrency(order.total)}</p></div><p className="text-xs font-semibold text-muted-foreground">Order ID: {order.id}</p></div><div className="mt-3 grid gap-3 text-sm sm:grid-cols-2"><div className="rounded-xl bg-muted/45 p-3"><p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Items</p><p className="mt-1 font-semibold text-foreground">{order.items.map((item) => `${item.quantity} × ${item.name}`).join(", ")}</p></div>{order.delivery ? <div className="rounded-xl bg-muted/45 p-3"><p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Delivery</p><p className="mt-1 font-semibold text-foreground">{order.delivery.serviceName}</p><p className="mt-1 text-xs text-muted-foreground">{order.delivery.recipientName} · {order.delivery.phone}<br />{order.delivery.address}, {order.delivery.localGovernment}, {order.delivery.state}</p></div> : <div className="rounded-xl bg-muted/45 p-3"><p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Delivery</p><p className="mt-1 font-semibold text-foreground">Customer pickup</p></div>}</div></article>)}</div>}
          {farmsAction === "add-product" && (
          <form
            className="grid gap-4 rounded-2xl border bg-muted/20 p-4 md:grid-cols-4"
            onSubmit={(event) => {
              event.preventDefault();
              void saveInventory(newInventory).then(() => setNewInventory(blankInventory));
            }}
          >
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="new-product-name">Product Name</Label>
              <Input
                id="new-product-name"
                required
                value={newInventory.name}
                onChange={(event) => setNewInventory((current) => ({ ...current, name: event.target.value }))}
              />
            </div>
            <Select
              label="Category"
              value={newInventory.category}
              onChange={(event) => setNewInventory((current) => ({ ...current, category: event.target.value as InventoryCategory }))}
              options={inventoryCategories}
            />
            <div className="space-y-1.5">
              <Label htmlFor="new-product-price">Price</Label>
              <Input
                id="new-product-price"
                type="number"
                min={0}
                required
                value={newInventory.price}
                onChange={(event) => setNewInventory((current) => ({ ...current, price: Number(event.target.value) }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-product-age">Age</Label>
              <Input
                id="new-product-age"
                value={newInventory.age ?? ""}
                onChange={(event) => setNewInventory((current) => ({ ...current, age: event.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-product-weight">Weight</Label>
              <Input
                id="new-product-weight"
                value={newInventory.weight ?? ""}
                onChange={(event) => setNewInventory((current) => ({ ...current, weight: event.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-product-shipping-weight">Courier weight (kg)</Label>
              <Input
                id="new-product-shipping-weight"
                type="number"
                min={0}
                step="0.01"
                value={newInventory.shippingWeightKg ?? ""}
                onChange={(event) => setNewInventory((current) => ({ ...current, shippingWeightKg: event.target.value === "" ? undefined : Number(event.target.value) }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-product-original-price">Price Before Slash</Label>
              <Input
                id="new-product-original-price"
                type="number"
                min={0}
                value={newInventory.originalPrice ?? ""}
                onChange={(event) => setNewInventory((current) => ({ ...current, originalPrice: event.target.value ? Number(event.target.value) : undefined }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-product-promo-price">Promo Price</Label>
              <Input
                id="new-product-promo-price"
                type="number"
                min={0}
                value={newInventory.promoPrice ?? ""}
                onChange={(event) => setNewInventory((current) => ({ ...current, promoPrice: event.target.value ? Number(event.target.value) : undefined }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-product-promo-end">Promo End Date</Label>
              <Input
                id="new-product-promo-end"
                type="date"
                value={newInventory.promoEndsAt ?? ""}
                onChange={(event) => setNewInventory((current) => ({ ...current, promoEndsAt: event.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-product-promo-label">Promo Label</Label>
              <Input
                id="new-product-promo-label"
                value={newInventory.promoLabel ?? ""}
                onChange={(event) => setNewInventory((current) => ({ ...current, promoLabel: event.target.value }))}
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="new-product-desc">Description</Label>
              <Textarea
                id="new-product-desc"
                required
                value={newInventory.description}
                onChange={(event) => setNewInventory((current) => ({ ...current, description: event.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-product-units">Units</Label>
              <Input
                id="new-product-units"
                type="number"
                min={0}
                value={newInventory.availableUnits}
                onChange={(event) => setNewInventory((current) => ({ ...current, availableUnits: Number(event.target.value) }))}
              />
            </div>
            <Select
              label="Stock"
              value={newInventory.stockStatus}
              onChange={(event) => setNewInventory((current) => ({ ...current, stockStatus: event.target.value as InventoryStockStatus }))}
              options={stockStatuses}
            />
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="new-product-image">Image URL</Label>
              <Input
                id="new-product-image"
                value={newInventory.imageUrl ?? ""}
                onChange={(event) => setNewInventory((current) => ({ ...current, imageUrl: event.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-product-file">Upload Image</Label>
              <Input
                id="new-product-file"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void uploadManagedImage(file, "farm")
                    .then((imageUrl) => setNewInventory((current) => ({ ...current, imageUrl })))
                    .catch((error) => setMediaError(error instanceof Error ? error.message : "Image upload failed."));
                }}
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={isBusy} className="w-full bg-emerald-600 text-white hover:bg-emerald-700">
                <UploadCloud className="h-4 w-4" />
                Add Product
              </Button>
            </div>
          </form>
          )}

          {farmsAction === "manage-products" && (
          <div className="space-y-6">
            {inventoryCategories.map((category) => {
              const categoryItems = snapshot.inventory.filter((item) => item.category === category.value);
              if (categoryItems.length === 0) return null;
              return (
              <section key={category.value} className="overflow-hidden rounded-2xl border bg-card/55">
                <div className="flex items-center justify-between border-b bg-emerald-500/[0.055] px-4 py-3">
                  <h3 className="font-bold text-foreground">{category.label}</h3>
                  <Badge variant="secondary">{categoryItems.length} {categoryItems.length === 1 ? "item" : "items"}</Badge>
                </div>
                <div className="divide-y divide-border/80">
            {categoryItems.map((item) => {
              const draft = inventoryDrafts[item.productId] ?? item;
              const isEditing = selectedInventoryProductId === item.productId;
              return (
                <div key={item.productId} className={`overflow-hidden rounded-xl border transition ${isEditing ? "border-emerald-500/50 shadow-md shadow-emerald-950/5" : "border-border/80"}`}>
                  <div className="grid gap-3 p-3 sm:grid-cols-[4.5rem_minmax(0,1fr)_auto] sm:items-center sm:p-4">
                    <ImagePreview imageUrl={draft.imageUrl} fallbackClass={draft.imageBg} />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2"><p className="truncate font-bold text-foreground">{draft.name}</p><Badge variant={draft.stockStatus === "In Stock" ? "default" : draft.stockStatus === "Out of Stock" ? "destructive" : "secondary"}>{draft.stockStatus}</Badge></div>
                      <p className="mt-1 text-xs text-muted-foreground">{inventoryCategories.find((category) => category.value === draft.category)?.label} · {formatCurrency(draft.promoPrice ?? draft.price)} · {draft.availableUnits} available</p>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:justify-end">
                      <Button size="sm" variant="outline" onClick={() => setSelectedInventoryProductId(isEditing ? null : item.productId)}>{isEditing ? "Close" : "Edit product"}</Button>
                      {draft.stockStatus !== "Out of Stock" && <Button size="sm" variant="destructive" disabled={isBusy} onClick={() => void saveInventory({ ...draft, availableUnits: 0, stockStatus: "Out of Stock" })}>Remove from shop</Button>}
                    </div>
                  </div>
                  {isEditing && <div className="border-t bg-emerald-500/[0.035] p-4">
                    <div className="mb-4 flex items-center justify-between gap-3"><p className="text-sm font-extrabold text-foreground">Edit {draft.name}</p><span className="text-xs text-muted-foreground">Changes are saved only when you select Save product.</span></div>
                    <div className="grid gap-3 md:grid-cols-4">
                      <div className="space-y-1.5"><Label>Product name</Label><Input value={draft.name} onChange={(event) => setInventoryDrafts((current) => ({ ...current, [item.productId]: { ...draft, name: event.target.value } }))} /></div>
                      <Select label="Product category" value={draft.category} onChange={(event) => setInventoryDrafts((current) => ({ ...current, [item.productId]: { ...draft, category: event.target.value as InventoryCategory } }))} options={inventoryCategories} />
                      <div className="space-y-1.5"><Label>Price (NGN)</Label><Input type="number" min={0} value={draft.price} onChange={(event) => setInventoryDrafts((current) => ({ ...current, [item.productId]: { ...draft, price: Number(event.target.value) } }))} /></div>
                      <div className="space-y-1.5"><Label>Available units</Label><Input type="number" min={0} value={draft.availableUnits} onChange={(event) => setInventoryDrafts((current) => ({ ...current, [item.productId]: { ...draft, availableUnits: Number(event.target.value) } }))} /></div>
                      <div className="space-y-1.5"><Label>Age</Label><Input value={draft.age ?? ""} onChange={(event) => setInventoryDrafts((current) => ({ ...current, [item.productId]: { ...draft, age: event.target.value } }))} /></div>
                      <div className="space-y-1.5"><Label>Product weight</Label><Input value={draft.weight ?? ""} onChange={(event) => setInventoryDrafts((current) => ({ ...current, [item.productId]: { ...draft, weight: event.target.value } }))} /></div>
                      <div className="space-y-1.5"><Label>Courier weight (kg)</Label><Input type="number" min={0} step="0.01" value={draft.shippingWeightKg ?? ""} onChange={(event) => setInventoryDrafts((current) => ({ ...current, [item.productId]: { ...draft, shippingWeightKg: event.target.value === "" ? undefined : Number(event.target.value) } }))} /></div>
                      <Select label="Stock status" value={draft.stockStatus} onChange={(event) => setInventoryDrafts((current) => ({ ...current, [item.productId]: { ...draft, stockStatus: event.target.value as InventoryItem["stockStatus"] } }))} options={stockStatuses} />
                      <div className="space-y-1.5"><Label>Price before slash (NGN)</Label><Input type="number" min={0} value={draft.originalPrice ?? ""} onChange={(event) => setInventoryDrafts((current) => ({ ...current, [item.productId]: { ...draft, originalPrice: event.target.value ? Number(event.target.value) : undefined } }))} /></div>
                      <div className="space-y-1.5"><Label>Promo price (NGN)</Label><Input type="number" min={0} value={draft.promoPrice ?? ""} onChange={(event) => setInventoryDrafts((current) => ({ ...current, [item.productId]: { ...draft, promoPrice: event.target.value ? Number(event.target.value) : undefined } }))} /></div>
                      <div className="space-y-1.5"><Label>Promo end date</Label><Input type="date" value={draft.promoEndsAt ?? ""} onChange={(event) => setInventoryDrafts((current) => ({ ...current, [item.productId]: { ...draft, promoEndsAt: event.target.value } }))} /></div>
                      <div className="space-y-1.5"><Label>Promo label</Label><Input value={draft.promoLabel ?? ""} onChange={(event) => setInventoryDrafts((current) => ({ ...current, [item.productId]: { ...draft, promoLabel: event.target.value } }))} /></div>
                    </div>
                    <div className="mt-3 space-y-1.5"><Label>Product description</Label><Textarea value={draft.description} onChange={(event) => setInventoryDrafts((current) => ({ ...current, [item.productId]: { ...draft, description: event.target.value } }))} /></div>
                    <div className="mt-3 space-y-1.5"><Label>Product image URL</Label><Input value={draft.imageUrl ?? ""} onChange={(event) => setInventoryDrafts((current) => ({ ...current, [item.productId]: { ...draft, imageUrl: event.target.value } }))} /></div>
                    <div className="mt-3 flex justify-end"><Button disabled={isBusy} className="bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => void saveInventory(draft).then(() => setSelectedInventoryProductId(null))}>Save product</Button></div>
                  </div>}
                </div>
              );
            })}
                </div>
              </section>
              );
            })}
            {snapshot.inventory.length === 0 && <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">No farm products have been added yet.</p>}
          </div>
          )}
        </CardContent>
      </Card>}

      <div className="grid gap-6">
        {activeArea === "homes" && <Card>
          <CardHeader>
            <CardTitle>Homes admin</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-wrap gap-2 rounded-xl bg-blue-500/10 p-2">
              <Button size="sm" variant={homesAction === "manage-listings" ? "default" : "ghost"} className={homesAction === "manage-listings" ? "bg-blue-700 text-white hover:bg-blue-800" : "text-blue-800 dark:text-blue-200"} onClick={() => setHomesAction("manage-listings")}>Property listings</Button>
              <Button size="sm" variant={homesAction === "add-listing" ? "default" : "ghost"} className={homesAction === "add-listing" ? "bg-blue-700 text-white hover:bg-blue-800" : "text-blue-800 dark:text-blue-200"} onClick={() => setHomesAction("add-listing")}>Add listing</Button>
              <Button size="sm" variant={homesAction === "bids" ? "default" : "ghost"} className={homesAction === "bids" ? "bg-blue-700 text-white hover:bg-blue-800" : "text-blue-800 dark:text-blue-200"} onClick={() => setHomesAction("bids")}>Bids</Button>
            </div>
            {homesAction === "add-listing" && (
            <form
              className="space-y-4 rounded-2xl border bg-muted/20 p-4"
              onSubmit={(event) => {
                event.preventDefault();
                void saveProperty(propertyDraft);
              }}
            >
              <div className="grid gap-3 md:grid-cols-2">
                <Input
                  required
                  value={propertyDraft.title}
                  onChange={(event) => setPropertyDraft((current) => ({ ...current, title: event.target.value }))}
                />
                <Input
                  required
                  value={propertyDraft.location}
                  onChange={(event) => setPropertyDraft((current) => ({ ...current, location: event.target.value }))}
                />
              </div>
              <div className="grid gap-3 md:grid-cols-4">
                <Input
                  type="number"
                  min={0}
                  required
                  value={propertyDraft.price}
                  onChange={(event) => setPropertyDraft((current) => ({ ...current, price: Number(event.target.value) }))}
                />
                <Input
                  type="number"
                  min={1}
                  required
                  value={propertyDraft.size}
                  onChange={(event) => setPropertyDraft((current) => ({ ...current, size: Number(event.target.value) }))}
                />
                <Select
                  value={propertyDraft.type}
                  onChange={(event) => setPropertyDraft((current) => ({ ...current, type: event.target.value as PropertyType }))}
                  options={propertyTypes}
                />
                <Select
                  value={propertyDraft.category}
                  onChange={(event) => setPropertyDraft((current) => ({ ...current, category: event.target.value as PropertyCategory }))}
                  options={propertyCategories}
                />
              </div>
              <Textarea
                required
                value={propertyDraft.summary}
                onChange={(event) => setPropertyDraft((current) => ({ ...current, summary: event.target.value }))}
              />
              <Input
                value={propertyDraft.highlightsText}
                onChange={(event) => setPropertyDraft((current) => ({ ...current, highlightsText: event.target.value }))}
              />
              <div className="grid gap-3 md:grid-cols-3">
                <Input
                  value={propertyDraft.imageUrl ?? ""}
                  onChange={(event) => setPropertyDraft((current) => ({ ...current, imageUrl: event.target.value }))}
                />
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void uploadManagedImage(file, "property")
                      .then((imageUrl) => setPropertyDraft((current) => ({ ...current, imageUrl })))
                      .catch((error) => setMediaError(error instanceof Error ? error.message : "Image upload failed."));
                  }}
                />
                <Select
                  value={propertyDraft.status}
                  onChange={(event) => setPropertyDraft((current) => ({ ...current, status: event.target.value as ApprovalStatus }))}
                  options={approvalStatuses}
                />
              </div>
              <Button type="submit" disabled={isBusy} className="w-full bg-emerald-600 text-white hover:bg-emerald-700">
                Save Property Listing
              </Button>
            </form>
            )}

            {homesAction === "manage-listings" && (
              <>
            {snapshot.propertyListings.map((property) => (
              <div key={property.id} className="rounded-xl border p-4">
                <div className="grid gap-4 md:grid-cols-[120px_1fr]">
                  <ImagePreview imageUrl={property.imageUrl} fallbackClass="bg-emerald-500/10 text-emerald-700" />
                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">{property.title}</p>
                        <p className="text-xs text-muted-foreground">{property.location} - {formatCurrency(property.price)}</p>
                        {property.submittedByEmail && (
                          <p className="mt-1 text-xs text-muted-foreground">Submitted by {property.submittedByName} ({property.submittedByEmail})</p>
                        )}
                      </div>
                      <Badge variant={property.status === "Approved" ? "default" : property.status === "Rejected" ? "destructive" : "secondary"}>
                        {property.status}
                      </Badge>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">{property.summary}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button size="sm" disabled={isBusy} onClick={() => void updatePropertyListingStatus(property.id, "Approved")}>
                        Approve
                      </Button>
                      <Button size="sm" variant="destructive" disabled={isBusy} onClick={() => void updatePropertyListingStatus(property.id, "Rejected")}>
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPropertyDraft({
                          ...property,
                          highlightsText: joinHighlights(property.highlights),
                        })}
                      >
                        Edit in Form
                      </Button>
                      {property.submittedByEmail && (
                        <Select
                          className="h-8 w-44 text-xs"
                          value={property.agentListingPaymentStatus ?? "Not Requested"}
                          onChange={(event) => void updatePropertyListingAgentPayment(property.id, event.target.value as AgentListingPaymentStatus)}
                          options={[
                            { value: "Not Requested", label: "No contact publication" },
                            { value: "Awaiting Payment", label: "Awaiting fee" },
                            { value: "Payment Submitted", label: "Proof submitted" },
                            { value: "Paid", label: "Fee confirmed" },
                          ]}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
              </>
            )}
          </CardContent>
        </Card>}

        {activeArea === "orbital" && <Card>
          <CardHeader>
            <CardTitle>Orbital admin</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-wrap gap-2 rounded-xl bg-cyan-500/10 p-2">
              <Button size="sm" variant={orbitalAction === "inquiries" ? "default" : "ghost"} className={orbitalAction === "inquiries" ? "bg-cyan-700 text-white hover:bg-cyan-800" : "text-cyan-800 dark:text-cyan-200"} onClick={() => setOrbitalAction("inquiries")}>Inquiry desk</Button>
              <Button size="sm" variant={orbitalAction === "services" ? "default" : "ghost"} className={orbitalAction === "services" ? "bg-cyan-700 text-white hover:bg-cyan-800" : "text-cyan-800 dark:text-cyan-200"} onClick={() => setOrbitalAction("services")}>Survey services</Button>
            </div>
            {orbitalAction === "services" && (
              <>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.045] p-4">
              <div>
                <p className="font-bold text-foreground">All survey services</p>
                <p className="text-sm text-muted-foreground">{snapshot.surveyServices.length} service{snapshot.surveyServices.length === 1 ? "" : "s"} available to manage.</p>
              </div>
              <Button size="sm" className="bg-cyan-700 text-white hover:bg-cyan-800" onClick={() => { setServiceDraft(blankService); setServiceEditorOpen(true); }}>
                <Plus className="h-4 w-4" /> Add service
              </Button>
            </div>
            {serviceEditorOpen && (
            <form
              className="space-y-4 rounded-2xl border bg-muted/20 p-4"
              onSubmit={(event) => {
                event.preventDefault();
                void saveService(serviceDraft);
              }}
            >
              <Input
                required
                value={serviceDraft.title}
                onChange={(event) => setServiceDraft((current) => ({ ...current, title: event.target.value }))}
              />
              <Textarea
                required
                value={serviceDraft.description}
                onChange={(event) => setServiceDraft((current) => ({ ...current, description: event.target.value }))}
              />
              <div className="grid gap-3 md:grid-cols-3">
                <Input
                  type="number"
                  min={0}
                  value={serviceDraft.priceFrom}
                  onChange={(event) => setServiceDraft((current) => ({ ...current, priceFrom: Number(event.target.value) }))}
                />
                <Input
                  value={serviceDraft.timeline}
                  onChange={(event) => setServiceDraft((current) => ({ ...current, timeline: event.target.value }))}
                />
                <Select
                  value={serviceDraft.status}
                  onChange={(event) => setServiceDraft((current) => ({ ...current, status: event.target.value as ApprovalStatus }))}
                  options={approvalStatuses}
                />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <Input
                  value={serviceDraft.imageUrl ?? ""}
                  onChange={(event) => setServiceDraft((current) => ({ ...current, imageUrl: event.target.value }))}
                />
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void uploadManagedImage(file, "property")
                      .then((imageUrl) => setServiceDraft((current) => ({ ...current, imageUrl })))
                      .catch((error) => setMediaError(error instanceof Error ? error.message : "Image upload failed."));
                  }}
                />
              </div>
              <Button type="submit" disabled={isBusy} className="w-full bg-cyan-600 text-white hover:bg-cyan-700">
                Save Survey Service
              </Button>
            </form>
            )}

            {snapshot.surveyServices.map((service) => (
              <div key={service.id} className="rounded-xl border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{service.title}</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(service.priceFrom)} from - {service.timeline}</p>
                  </div>
                  <Badge variant={service.status === "Approved" ? "default" : service.status === "Rejected" ? "destructive" : "secondary"}>
                    {service.status}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{service.description}</p>
                <Button
                  className="mt-3"
                  size="sm"
                  variant="outline"
                  onClick={() => { setServiceDraft(service); setServiceEditorOpen(true); }}
                >
                  Edit in Form
                </Button>
              </div>
            ))}
            {snapshot.surveyServices.length === 0 && <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">No survey services have been added yet.</p>}
              </>
            )}
          </CardContent>
        </Card>}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        {activeArea === "overview" && <Card>
          <CardHeader>
            <CardTitle>Registered Users</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {snapshot.users.map((user) => (
              <div key={user.id} className="rounded-xl border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <Badge variant={user.role === "admin" ? "default" : "outline"}>{user.role}</Badge>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{user.phone}</p>
              </div>
            ))}
          </CardContent>
        </Card>}

        {activeArea === "homes" && homesAction === "bids" && <Card>
          <CardHeader>
            <CardTitle>Property Bids</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {snapshot.bids.length === 0 ? (
              <p className="text-sm text-muted-foreground">No bids have been submitted yet.</p>
            ) : (
              snapshot.bids.map((bid) => (
                <div key={bid.id} className="rounded-xl border p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-foreground">{bid.propertyTitle}</p><Badge variant={bid.status === "Connected" ? "default" : bid.status === "Rejected" ? "destructive" : "secondary"}>{bid.status}</Badge></div>
                      <p className="text-xs text-muted-foreground">{bid.userName} - {bid.userEmail}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatCurrency(bid.bidAmount)} against {formatCurrency(bid.propertyPrice)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="secondary" disabled={isBusy || bid.status === "Connected"} onClick={() => void handleBidStatus(bid.id, "Connected")}>
                        {bid.status === "Connected" ? "Connected" : "Connect"}
                      </Button>
                      <Button size="sm" variant="destructive" disabled={isBusy} onClick={() => void handleBidStatus(bid.id, "Rejected")}>
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>}
      </div>

      {activeArea === "orbital" && orbitalAction === "inquiries" && <Card>
        <CardHeader>
          <CardTitle>Survey Request Tracker</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          {snapshot.surveys.length === 0 ? (
            <p className="text-sm text-muted-foreground">No survey requests have been logged yet.</p>
          ) : (
            snapshot.surveys.map((survey) => (
              <div key={survey.id} className="rounded-xl border p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{survey.location}</p>
                    <p className="text-xs text-muted-foreground">{survey.userName} - {survey.serviceType}</p>
                  </div>
                  <Shield className="h-4 w-4 text-emerald-500" />
                </div>
                <p className="mb-3 whitespace-pre-line text-sm text-muted-foreground">{survey.description}</p>
                {survey.uploadedDocuments && survey.uploadedDocuments.length > 0 && (
                  <p className="mb-3 text-xs text-muted-foreground">Documents selected: {survey.uploadedDocuments.join(", ")}</p>
                )}
                {survey.documentAttachments && survey.documentAttachments.length > 0 && (
                  <div className="mb-3 rounded-lg border bg-muted/20 p-3 text-xs text-muted-foreground">
                    {survey.documentAttachments.map((attachment) => (
                      <div key={`${attachment.documentName}-${attachment.fileName}`} className="space-y-0.5">
                        <p>{attachment.documentName}: {attachment.fileName} ({attachment.fileSizeKb} KB)</p>
                        {attachment.storagePath && (
                          <p className="text-[11px] text-emerald-600 dark:text-emerald-400">Stored: {attachment.storagePath}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {survey.delivery && deliveryDrafts[survey.id] && (
                  <div className="mb-4 rounded-xl border border-red-200 bg-red-50/80 p-4 dark:border-red-950 dark:bg-red-950/20">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-700 text-white">
                          <Truck className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-sm font-bold text-red-950 dark:text-red-100">DHL Delivery Fulfillment</p>
                          <p className="mt-1 text-xs text-red-900/80 dark:text-red-100/80">
                            {survey.delivery.recipientName} · {survey.delivery.phone}
                          </p>
                          <p className="mt-1 text-xs text-red-900/80 dark:text-red-100/80">
                            {survey.delivery.address}, {survey.delivery.city}, {survey.delivery.state}
                            {survey.delivery.postalCode ? ` ${survey.delivery.postalCode}` : ""}
                          </p>
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-sm font-black text-red-950 dark:text-red-100">{formatCurrency(survey.delivery.fee)}</p>
                        <p className="text-xs text-red-900/70 dark:text-red-100/70">{survey.delivery.estimatedDelivery}</p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_11rem_auto] sm:items-end">
                      <div className="space-y-1.5">
                        <Label htmlFor={`delivery-tracking-${survey.id}`}>DHL tracking number</Label>
                        <Input
                          id={`delivery-tracking-${survey.id}`}
                          value={deliveryDrafts[survey.id].trackingNumber}
                          onChange={(event) => setDeliveryDrafts((current) => ({
                            ...current,
                            [survey.id]: {
                              ...current[survey.id],
                              trackingNumber: event.target.value,
                            },
                          }))}
                          placeholder="Enter after dispatch"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor={`delivery-status-${survey.id}`}>Delivery status</Label>
                        <Select
                          id={`delivery-status-${survey.id}`}
                          value={deliveryDrafts[survey.id].status}
                          onChange={(event) => setDeliveryDrafts((current) => ({
                            ...current,
                            [survey.id]: {
                              ...current[survey.id],
                              status: event.target.value as SurveyDeliveryStatus,
                            },
                          }))}
                          options={surveyDeliveryStatuses.map((status) => ({ value: status, label: status }))}
                        />
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        className="bg-red-700 text-white hover:bg-red-800"
                        disabled={isBusy}
                        onClick={() => void updateSurveyDelivery(
                          survey.id,
                          deliveryDrafts[survey.id].status,
                          deliveryDrafts[survey.id].trackingNumber,
                        )}
                      >
                        Save Delivery
                      </Button>
                    </div>
                  </div>
                )}
                <Select
                  value={survey.status}
                  onChange={(event) => void updateSurveyStatus(survey.id, event.target.value as typeof survey.status)}
                  options={[
                    { value: "Pending Approval", label: "Pending Approval" },
                    { value: "In Progress", label: "In Progress" },
                    { value: "Completed & Sent", label: "Completed & Sent" },
                    { value: "Rejected", label: "Rejected" },
                  ]}
                />
              </div>
            ))
          )}
        </CardContent>
      </Card>}
    </div>
  );
}
