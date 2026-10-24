"use client";

import * as React from "react";
import {
  ArrowLeftRight,
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
  Download,
  Edit3,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  Headphones,
  Home,
  ImageIcon,
  Info,
  Layers,
  Lock,
  LogIn,
  Mail,
  MapPin,
  Package,
  Phone,
  Plus,
  ReceiptText,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Sprout,
  Tag,
  Trash2,
  Truck,
  UploadCloud,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { Badge } from "./badge";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Dialog } from "./dialog";
import { Input } from "./input";
import { Label } from "./label";
import { Select } from "./select";
import { Textarea } from "./textarea";
import { useDajem } from "./dajem-provider";
import { nigeriaStates } from "../lib/nigeria-locations";
import { homesListingGroupOptions, rentalResidenceTypeOptions, residenceTypeOptions } from "../lib/store";
import type {
  AgentListingPaymentStatus,
  ApprovalStatus,
  FarmDeliverySettings,
  InventoryCategory,
  InventoryItem,
  InventoryStockStatus,
  PropertyListing,
  ResidenceType,
  SurveyDeliveryStatus,
  SurveyService,
  SupportTicketStatus,
  SurveyStatus,
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

function homesGroupLabel(group: PropertyListing["listingGroup"], fallback: PropertyListing["type"]) {
  return homesListingGroupOptions.find((option) => option.value === group)?.label ?? fallback;
}

function residenceLabel(type: PropertyListing["residenceType"]) {
  return residenceTypeOptions.find((option) => option.value === type)?.label;
}

function joinHighlights(value: string[] | undefined) {
  return (value ?? []).join(", ");
}

async function uploadManagedImage(file: File, scope: "farm" | "property" | "brand") {
  if (file.size > 5 * 1024 * 1024) throw new Error("Image must be 5MB or less.");
  const formData = new FormData();
  formData.append("scope", scope);
  formData.append("file", file);
  const response = await fetch("/api/storage/images", { method: "POST", credentials: "include", body: formData });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error ?? "Image upload failed.");
  return String(data.imageUrl);
}

function ImagePreview({ imageUrl, fallbackClass }: { imageUrl?: string; fallbackClass?: string }) {
  if (imageUrl) {
    return (
      <div
        className="h-20 w-20 shrink-0 rounded-2xl border bg-cover bg-center shadow-inner transition hover:scale-105"
        style={{ backgroundImage: `linear-gradient(135deg, rgba(15,23,42,.2), rgba(16,185,129,.15)), url(${imageUrl})` }}
      />
    );
  }

  return (
    <div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border ${fallbackClass ?? "border-border/70 bg-muted/40"}`}>
      <ImageIcon className="h-6 w-6 opacity-60" />
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
  listingGroup: "short-let",
  residenceType: "self-contain",
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

type AdminArea = "overview" | "farms" | "homes" | "orbital" | "reports" | "support" | "users";
type FarmsAction = "catalog" | "orders" | "add-product" | "delivery-fees";
type HomesAction = "listings" | "add-listing" | "bids";
type OrbitalAction = "inquiries" | "services";
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
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
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
      setMessage("Encrypted backup downloaded. Store the file and its passphrase separately.");
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

  return (
    <Card className="luxury-card border-border/80">
      <CardHeader className="border-b bg-amber-500/[0.03] pb-4">
        <CardTitle className="flex items-center gap-2 text-base"><Shield className="h-4 w-4 text-amber-600" /> Business backup & recovery</CardTitle>
        <p className="text-xs leading-relaxed text-muted-foreground">Daily encrypted backups run automatically. Use this control to download a separate encrypted copy or safely check a file before a staging recovery.</p>
      </CardHeader>
      <CardContent className="space-y-5 p-4 sm:p-5">
        <form onSubmit={downloadBackup} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1"><Label htmlFor="backup-passphrase" className="text-xs font-semibold">Backup passphrase</Label><Input id="backup-passphrase" type="password" autoComplete="new-password" value={passphrase} onChange={(event) => setPassphrase(event.target.value)} minLength={16} maxLength={256} required className="h-9 text-xs" /></div>
            <div className="space-y-1"><Label htmlFor="backup-confirmation" className="text-xs font-semibold">Confirm passphrase</Label><Input id="backup-confirmation" type="password" autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} minLength={16} maxLength={256} required className="h-9 text-xs" /></div>
          </div>
          <Button type="submit" disabled={busy} className="w-full bg-amber-500 text-slate-950 hover:bg-amber-400"><Download className="mr-2 h-4 w-4" />{busy ? "Preparing backup..." : "Download encrypted backup"}</Button>
          {message && <p role="status" className="text-xs text-foreground">{message}</p>}
        </form>
        <form onSubmit={reviewBackup} className="space-y-3 border-t pt-4">
          <div><p className="text-xs font-bold text-foreground">Review a backup for recovery</p><p className="mt-1 text-[11px] text-muted-foreground">This verifies the encrypted file only. It does not modify live records.</p></div>
          <div className="space-y-1"><Label htmlFor="restore-file" className="text-xs font-semibold">Encrypted backup file</Label><Input id="restore-file" type="file" accept="application/json,.json" required onChange={(event) => setRestoreFile(event.target.files?.[0] ?? null)} className="h-9 text-xs file:text-xs" /></div>
          <div className="space-y-1"><Label htmlFor="restore-passphrase" className="text-xs font-semibold">Backup passphrase</Label><Input id="restore-passphrase" type="password" autoComplete="off" value={restorePassphrase} onChange={(event) => setRestorePassphrase(event.target.value)} required className="h-9 text-xs" /></div>
          <Button type="submit" variant="outline" disabled={busy || !restoreFile} className="w-full">Check backup</Button>
          {restoreMessage && <p role="status" className="text-xs text-foreground">{restoreMessage}</p>}
        </form>
      </CardContent>
    </Card>
  );
}

export function AdminView() {
  const {
    currentUser,
    snapshot,
    isBusy,
    login,
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
    updateBrandLogo,
    openAuthModal,
  } = useDajem();

  const [activeArea, setActiveArea] = React.useState<AdminArea>("overview");
  const [farmsAction, setFarmsAction] = React.useState<FarmsAction>("catalog");
  const [homesAction, setHomesAction] = React.useState<HomesAction>("listings");
  const [orbitalAction, setOrbitalAction] = React.useState<OrbitalAction>("inquiries");

  // Filter / Search states (enabling quick finding without scrolling)
  const [farmSearch, setFarmSearch] = React.useState("");
  const [farmCategoryFilter, setFarmCategoryFilter] = React.useState<string>("all");
  const [homeSearch, setHomeSearch] = React.useState("");
  const [homeStatusFilter, setHomeStatusFilter] = React.useState<string>("all");
  const [orbitalSearch, setOrbitalSearch] = React.useState("");
  const [orbitalStatusFilter, setOrbitalStatusFilter] = React.useState<string>("all");
  const [supportStatusFilter, setSupportStatusFilter] = React.useState<string>("all");
  const [userSearch, setUserSearch] = React.useState("");

  // Editor Drafts and Modals
  const [inventoryDrafts, setInventoryDrafts] = React.useState<Record<string, InventoryItem>>({});
  const [editingInventoryItem, setEditingInventoryItem] = React.useState<InventoryItem | null>(null);
  const [newInventory, setNewInventory] = React.useState<InventoryItem>(blankInventory);
  const [farmDeliveryDraft, setFarmDeliveryDraft] = React.useState<FarmDeliverySettings>(snapshot.farmDeliverySettings);

  const [editingProperty, setEditingProperty] = React.useState<PropertyForm | null>(null);
  const [propertyDraft, setPropertyDraft] = React.useState<PropertyForm>(blankProperty);

  const [serviceDraft, setServiceDraft] = React.useState<SurveyService>(blankService);
  const [serviceEditorOpen, setServiceEditorOpen] = React.useState(false);

  const [deliveryDrafts, setDeliveryDrafts] = React.useState<Record<string, SurveyDeliveryDraft>>({});
  const [ticketNotes, setTicketNotes] = React.useState<Record<string, string>>({});

  const [mediaError, setMediaError] = React.useState<string | null>(null);
  const [adminFeedback, setAdminFeedback] = React.useState<{ kind: "success" | "error"; message: string } | null>(null);
  const [brandLogoDraft, setBrandLogoDraft] = React.useState(snapshot.brandLogoUrl || "/images/dajem-logo.jpg");

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

  React.useEffect(() => {
    setBrandLogoDraft(snapshot.brandLogoUrl || "/images/dajem-logo.jpg");
  }, [snapshot.brandLogoUrl]);

  const saveInventory = async (item: InventoryItem) => {
    setAdminFeedback(null);
    try {
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
      setAdminFeedback({ kind: "success", message: `Inventory item "${item.name}" updated successfully.` });
      setEditingInventoryItem(null);
      return true;
    } catch (error) {
      setAdminFeedback({ kind: "error", message: error instanceof Error ? error.message : "Failed to update item." });
      return false;
    }
  };

  const saveProperty = async (draft: PropertyForm) => {
    setAdminFeedback(null);
    try {
      await upsertPropertyListing({
        id: draft.id || undefined,
        title: draft.title,
        location: draft.location,
        price: draft.price,
        type: draft.type,
        category: draft.category,
        listingGroup: draft.listingGroup,
        residenceType: draft.listingGroup === "land-sale" || draft.listingGroup === "land-lease" ? undefined : draft.residenceType,
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
      setAdminFeedback({ kind: "success", message: `Property listing "${draft.title}" saved successfully.` });
      setPropertyDraft(blankProperty);
      setEditingProperty(null);
      return true;
    } catch (error) {
      setAdminFeedback({ kind: "error", message: error instanceof Error ? error.message : "Failed to save property." });
      return false;
    }
  };

  const saveService = async (draft: SurveyService) => {
    setAdminFeedback(null);
    try {
      await upsertSurveyService(draft);
      setAdminFeedback({ kind: "success", message: `Survey service "${draft.title}" saved successfully.` });
      setServiceDraft(blankService);
      setServiceEditorOpen(false);
    } catch (error) {
      setAdminFeedback({ kind: "error", message: error instanceof Error ? error.message : "Failed to save service." });
    }
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

  // Auth gate check
  if (!currentUser) {
    return (
      <Card className="luxury-card mx-auto max-w-xl overflow-hidden border-border/80 p-6 sm:p-8">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
            <Lock className="h-8 w-8" />
          </div>
          <Badge variant="secondary" className="mb-2">Admin Portal Security Gate</Badge>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">DAJEM Group Operations Console</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground leading-relaxed">
            Please authenticate with your administrator account to manage subsidiary operations, listings, customer orders, and finances.
          </p>

          <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              className="sheen-glow rounded-xl bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary/90"
              onClick={() => openAuthModal("login")}
            >
              <LogIn className="h-4 w-4 mr-2" />
              Sign in with credentials
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-xl border-border/80"
              onClick={async () => {
                try {
                  await login({ email: "admin@dajem.local", password: "ChangeMe123!" });
                } catch {
                  openAuthModal("login");
                }
              }}
            >
              <ShieldCheck className="h-4 w-4 mr-2 text-emerald-500" />
              Demo Admin Instant Login
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (currentUser.role !== "admin") {
    return (
      <Card className="luxury-card mx-auto max-w-md border-destructive/30 p-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <CardTitle className="text-xl">Admin Access Required</CardTitle>
        <p className="mt-2 text-sm text-muted-foreground">
          Logged in as <strong className="text-foreground">{currentUser.email}</strong>, but this account lacks executive administrative privileges.
        </p>
      </Card>
    );
  }

  // Pre-calculate counts and filtered lists
  const pendingPropertiesCount = snapshot.propertyListings.filter((item) => item.status === "Pending Approval").length;
  const openSurveysCount = snapshot.surveys.filter((survey) => survey.status !== "Completed & Sent").length;
  const openSupportTicketsCount = snapshot.supportTickets.filter((ticket) => ticket.status === "Open" || ticket.status === "In Progress").length;

  const { start: activityStart, end: activityEnd } = reportBounds(reportPeriod, reportStart, reportEnd);
  const activityRows: ActivityRow[] = [
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

  // Filtered inventory
  const filteredInventory = snapshot.inventory.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(farmSearch.toLowerCase()) || item.category.toLowerCase().includes(farmSearch.toLowerCase());
    const matchesCat = farmCategoryFilter === "all" || item.category === farmCategoryFilter;
    return matchesSearch && matchesCat;
  });

  // Filtered properties
  const filteredProperties = snapshot.propertyListings.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(homeSearch.toLowerCase()) || item.location.toLowerCase().includes(homeSearch.toLowerCase());
    const matchesStatus = homeStatusFilter === "all" || item.status === homeStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered surveys
  const filteredSurveys = snapshot.surveys.filter((survey) => {
    const matchesSearch = survey.location.toLowerCase().includes(orbitalSearch.toLowerCase()) || survey.userName.toLowerCase().includes(orbitalSearch.toLowerCase()) || survey.serviceType.toLowerCase().includes(orbitalSearch.toLowerCase());
    const matchesStatus = orbitalStatusFilter === "all" || survey.status === orbitalStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered support tickets
  const filteredSupportTickets = snapshot.supportTickets.filter((ticket) => {
    return supportStatusFilter === "all" || ticket.status === supportStatusFilter;
  });

  // Filtered users
  const filteredUsers = snapshot.users.filter((user) => {
    return user.name.toLowerCase().includes(userSearch.toLowerCase()) || user.email.toLowerCase().includes(userSearch.toLowerCase()) || user.phone.includes(userSearch);
  });

  const farmOrders = snapshot.orders.filter((order) => order.app === "farms");

  const sectionsNav = [
    { id: "overview" as const, label: "Overview", icon: BarChart3, badge: null, tone: "bg-slate-900 text-white dark:bg-slate-800" },
    { id: "orbital" as const, label: "Orbital", icon: ClipboardList, badge: openSurveysCount > 0 ? `${openSurveysCount} open` : `${snapshot.surveys.length}`, tone: "bg-cyan-600 text-white" },
    { id: "farms" as const, label: "Farms", icon: Sprout, badge: `${snapshot.inventory.length}`, tone: "bg-emerald-600 text-white" },
    { id: "homes" as const, label: "Homes", icon: Building2, badge: pendingPropertiesCount > 0 ? `${pendingPropertiesCount} pending` : `${snapshot.propertyListings.length}`, tone: "bg-blue-600 text-white" },
    { id: "reports" as const, label: "Finance & Reports", icon: FileText, badge: null, tone: "bg-amber-500 text-slate-950 font-black" },
    { id: "support" as const, label: "Support Desk", icon: Headphones, badge: openSupportTicketsCount > 0 ? `${openSupportTicketsCount} new` : null, tone: "bg-violet-600 text-white" },
    { id: "users" as const, label: "Users & Staff", icon: Users, badge: `${snapshot.users.length}`, tone: "bg-indigo-600 text-white" },
  ];

  return (
    <div className="space-y-6">
      {/* Executive Command Header */}
      <div className="relative overflow-hidden rounded-[2rem] border border-border/80 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-6 text-white shadow-xl shadow-slate-950/20 sm:p-7">
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-24 h-48 w-48 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex h-7 items-center rounded-full bg-white/10 px-3 text-xs font-semibold tracking-wide text-white backdrop-blur-md">
                <ShieldCheck className="mr-1.5 h-3.5 w-3.5 text-emerald-400" /> Executive Console
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] text-slate-300">
                Logged in as <strong className="text-white">{currentUser.name}</strong>
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">DAJEM Central Operations Hub</h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-300">
              Manage subsidiaries, inventory pricing, client requests, DHL tracking, and financial ledgers without manual complexity.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium backdrop-blur-md ${snapshot.integrations.supabaseConfigured ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-amber-500/30 bg-amber-500/10 text-amber-300"}`}>
              <span className={`mr-1.5 h-2 w-2 rounded-full ${snapshot.integrations.supabaseConfigured ? "bg-emerald-400" : "bg-amber-400"}`} />
              Database {snapshot.integrations.supabaseConfigured ? "Connected" : "Local state"}
            </span>
            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium backdrop-blur-md ${snapshot.integrations.flutterwaveConfigured ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-300" : "border-slate-500/30 bg-slate-500/10 text-slate-300"}`}>
              <span className={`mr-1.5 h-2 w-2 rounded-full ${snapshot.integrations.flutterwaveConfigured ? "bg-cyan-400" : "bg-slate-400"}`} />
              Payments {snapshot.integrations.flutterwaveConfigured ? "Active" : "Ready"}
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic Feedback Alerts */}
      {mediaError && (
        <div className="flex items-center justify-between rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <span>{mediaError}</span>
          <Button size="sm" variant="ghost" onClick={() => setMediaError(null)}><X className="h-4 w-4" /></Button>
        </div>
      )}
      {adminFeedback && (
        <div className={`flex items-center justify-between rounded-2xl border p-4 text-sm transition-all ${adminFeedback.kind === "success" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100" : "border-destructive/30 bg-destructive/10 text-destructive"}`}>
          <span>{adminFeedback.message}</span>
          <Button size="sm" variant="ghost" onClick={() => setAdminFeedback(null)}><X className="h-4 w-4" /></Button>
        </div>
      )}

      {/* Main Section Navigation Bar - Sleek Segmented Bar */}
      <div className="sticky top-16 z-30 -mx-1 px-1 py-1">
        <div className="overflow-x-auto no-scrollbar rounded-2xl border border-border/70 bg-card/85 p-1.5 shadow-md backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/85">
          <nav aria-label="Admin Sections" className="flex min-w-max items-center gap-1.5">
            {sectionsNav.map((section) => {
              const isActive = activeArea === section.id;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveArea(section.id)}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${isActive ? `${section.tone} shadow-md` : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"}`}
                >
                  <section.icon className="h-4 w-4 shrink-0" />
                  <span>{section.label}</span>
                  {section.badge && (
                    <span className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold ${isActive ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"}`}>
                      {section.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: OVERVIEW & CENTRAL KPIs                       */}
      {/* ======================================================== */}
      {activeArea === "overview" && (
        <div className="space-y-6">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {[
              { label: "Registered Users", value: snapshot.users.length, icon: Users, tone: "text-blue-500 bg-blue-500/10", action: () => setActiveArea("users") },
              { label: "Completed Orders", value: snapshot.orders.length, icon: Package, tone: "text-emerald-500 bg-emerald-500/10", action: () => setActiveArea("reports") },
              { label: "Pending Properties", value: pendingPropertiesCount, icon: Home, tone: "text-amber-500 bg-amber-500/10", action: () => { setActiveArea("homes"); setHomesAction("listings"); } },
              { label: "Active Surveys", value: openSurveysCount, icon: ClipboardList, tone: "text-cyan-500 bg-cyan-500/10", action: () => { setActiveArea("orbital"); setOrbitalAction("inquiries"); } },
            ].map((metric) => (
              <Card
                key={metric.label}
                onClick={metric.action}
                className="luxury-card cursor-pointer border-border/80 transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <CardContent className="flex items-center justify-between p-4 sm:p-5">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{metric.label}</p>
                    <p className="mt-1 text-2xl font-black text-foreground sm:text-3xl">{metric.value}</p>
                  </div>
                  <div className={`rounded-xl p-2.5 sm:p-3 ${metric.tone}`}>
                    <metric.icon className="h-5 w-5" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 2-Column Split: Operations Summary & Recent Activity */}
          <div className="grid gap-6 lg:grid-cols-[1fr_1.25fr]">
            {/* Left: Quick Actions & Subsidiary Directory */}
            <div className="space-y-6">
              <Card className="luxury-card border-border/80">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>Direct Access Shortcuts</span>
                    <Badge variant="secondary" className="text-[10px]">Instant Navigation</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-2">
                  <button
                    type="button"
                    onClick={() => { setActiveArea("orbital"); setOrbitalAction("inquiries"); }}
                    className="flex items-center justify-between rounded-xl border border-cyan-500/20 bg-cyan-500/[0.04] p-3 text-left transition hover:bg-cyan-500/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-cyan-600 p-2 text-white"><Truck className="h-4 w-4" /></div>
                      <div>
                        <p className="text-xs font-bold text-foreground">DHL Survey Deliveries & Tracker</p>
                        <p className="text-[11px] text-muted-foreground">Update waybill numbers and survey dispatch</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>

                  <button
                    type="button"
                    onClick={() => { setActiveArea("farms"); setFarmsAction("add-product"); }}
                    className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-3 text-left transition hover:bg-emerald-500/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-emerald-600 p-2 text-white"><Plus className="h-4 w-4" /></div>
                      <div>
                        <p className="text-xs font-bold text-foreground">Add New Farm Product</p>
                        <p className="text-[11px] text-muted-foreground">List fresh produce, chicken cuts, or livestock</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>

                  <button
                    type="button"
                    onClick={() => { setActiveArea("homes"); setHomesAction("listings"); setHomeStatusFilter("Pending Approval"); }}
                    className="flex items-center justify-between rounded-xl border border-blue-500/20 bg-blue-500/[0.04] p-3 text-left transition hover:bg-blue-500/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-blue-600 p-2 text-white"><Home className="h-4 w-4" /></div>
                      <div>
                        <p className="text-xs font-bold text-foreground">Review Pending Real Estate ({pendingPropertiesCount})</p>
                        <p className="text-[11px] text-muted-foreground">Approve agent listings or publish properties</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                </CardContent>
              </Card>

              <Card className="luxury-card border-border/80">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Subsidiary Overview</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.04] p-3.5">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-cyan-800 dark:text-cyan-300">Orbital Requests</p>
                    <p className="mt-1 text-2xl font-black text-foreground">{snapshot.surveys.length}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">Total survey jobs</p>
                  </div>
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-3.5">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-800 dark:text-emerald-300">Farms Inventory</p>
                    <p className="mt-1 text-2xl font-black text-foreground">{snapshot.inventory.length}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">Active shop items</p>
                  </div>
                  <div className="rounded-2xl border border-blue-500/20 bg-blue-500/[0.04] p-3.5">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-blue-800 dark:text-blue-300">Homes Catalog</p>
                    <p className="mt-1 text-2xl font-black text-foreground">{snapshot.propertyListings.length}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">Properties listed</p>
                  </div>
                  <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-3.5">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-amber-800 dark:text-amber-300">Paid Invoices</p>
                    <p className="mt-1 text-2xl font-black text-foreground">{snapshot.orders.filter((o) => o.paymentStatus === "Paid").length}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">Settled orders</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right: Chronological Activity Feed (Height contained to prevent long scroll) */}
            <Card className="luxury-card border-border/80">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base">Recent Ledger & Operations Activity</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">Real-time transactions across all subsidiaries</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setActiveArea("reports")}>
                  Full Statement <ExternalLink className="h-3.5 w-3.5 ml-1" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="max-h-[460px] overflow-y-auto pr-1 space-y-2 no-scrollbar">
                  {activityRows.slice(0, 10).map((row) => (
                    <div
                      key={`${row.area}-${row.id}`}
                      className="grid grid-cols-[4.5rem_1fr_auto] items-center gap-3 rounded-xl border border-border/70 bg-card/40 px-3.5 py-2.5 text-xs transition hover:bg-muted/40"
                    >
                      <span className="text-[11px] font-bold text-muted-foreground">
                        {dateValue(row.date)?.toLocaleDateString("en-NG", { day: "2-digit", month: "short" }) ?? row.date}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-bold text-foreground">{row.activity}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`inline-block rounded px-1.5 py-0.2 text-[9px] font-black uppercase ${row.area === "Farms" ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : row.area === "Homes" ? "bg-blue-500/15 text-blue-700 dark:text-blue-300" : "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300"}`}>
                            {row.area}
                          </span>
                          <span className="text-[10px] text-muted-foreground">· {row.status}</span>
                        </div>
                      </div>
                      {row.amount !== undefined ? (
                        <span className="text-right font-black text-foreground">{formatCurrency(row.amount)}</span>
                      ) : (
                        <span className="text-right text-[11px] text-muted-foreground">-</span>
                      )}
                    </div>
                  ))}
                  {activityRows.length === 0 && (
                    <p className="py-12 text-center text-xs text-muted-foreground">No operations activity recorded yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="luxury-card border-border/80">
              <CardHeader className="border-b bg-slate-500/[0.03] pb-4">
                <CardTitle className="flex items-center gap-2 text-base"><ImageIcon className="h-4 w-4 text-primary" /> Company logo</CardTitle>
                <p className="text-xs leading-relaxed text-muted-foreground">Upload the official DAJEM logo from this device. The shared header and footer use this image across the platform.</p>
              </CardHeader>
              <CardContent className="space-y-4 p-4 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <ImagePreview imageUrl={brandLogoDraft} fallbackClass="bg-slate-900 text-white" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Label htmlFor="brand-logo-file" className="text-xs font-semibold">Replace logo from this device (Max 5MB)</Label>
                    <Input
                      id="brand-logo-file"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) void uploadManagedImage(file, "brand")
                          .then(setBrandLogoDraft)
                          .catch((error) => setMediaError(error instanceof Error ? error.message : "Logo upload failed."));
                      }}
                      className="h-9 text-xs file:text-xs"
                    />
                  </div>
                </div>
                <Button
                  disabled={isBusy || !brandLogoDraft}
                  className="w-full"
                  onClick={() => void updateBrandLogo(brandLogoDraft)
                    .then(() => setAdminFeedback({ kind: "success", message: "Company logo saved across the DAJEM platform." }))
                    .catch((error) => setAdminFeedback({ kind: "error", message: error instanceof Error ? error.message : "Logo could not be saved." }))}
                >
                  <UploadCloud className="mr-2 h-4 w-4" /> Save company logo
                </Button>
              </CardContent>
            </Card>
            <BackupCard />
          </div>

          <Card className="luxury-card border-border/80">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-base">Account audit log</CardTitle>
              <p className="text-xs text-muted-foreground">Recent customer profile and administrator changes, linked to the relevant user ID.</p>
            </CardHeader>
            <CardContent className="p-4 sm:p-5">
              <div className="grid max-h-72 gap-2 overflow-y-auto pr-1 sm:grid-cols-2 no-scrollbar">
                {snapshot.auditLogs.slice(0, 12).map((entry) => (
                  <div key={entry.id} className="rounded-xl border border-border/70 bg-card/60 p-3 text-xs">
                    <p className="font-bold text-foreground">{entry.action}</p>
                    <p className="mt-1 text-muted-foreground">{entry.actorEmail} · User ID {entry.targetUserId || entry.actorUserId}</p>
                    <p className="mt-1 text-muted-foreground">{entry.detail}</p>
                  </div>
                ))}
                {snapshot.auditLogs.length === 0 && <p className="py-5 text-center text-xs text-muted-foreground sm:col-span-2">Account changes will be recorded here.</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 2: DAJEM FARMS ADMIN                             */}
      {/* ======================================================== */}
      {activeArea === "farms" && (
        <Card className="luxury-card border-border/80">
          <CardHeader className="border-b bg-emerald-500/[0.03] pb-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Sprout className="h-5 w-5 text-emerald-600" /> DAJEM Farms Operations
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Manage inventory, chicken cuts studio, slashed promo prices, and nationwide delivery rates.
                </p>
              </div>

              {/* Sub-action pills */}
              <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-emerald-500/20 bg-card p-1">
                <Button
                  size="sm"
                  variant={farmsAction === "catalog" ? "default" : "ghost"}
                  className={farmsAction === "catalog" ? "bg-emerald-600 text-white hover:bg-emerald-700 text-xs" : "text-xs"}
                  onClick={() => setFarmsAction("catalog")}
                >
                  <Package className="h-3.5 w-3.5 mr-1" /> Products ({snapshot.inventory.length})
                </Button>
                <Button
                  size="sm"
                  variant={farmsAction === "add-product" ? "default" : "ghost"}
                  className={farmsAction === "add-product" ? "bg-emerald-600 text-white hover:bg-emerald-700 text-xs" : "text-xs"}
                  onClick={() => setFarmsAction("add-product")}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Product
                </Button>
                <Button
                  size="sm"
                  variant={farmsAction === "orders" ? "default" : "ghost"}
                  className={farmsAction === "orders" ? "bg-emerald-600 text-white hover:bg-emerald-700 text-xs" : "text-xs"}
                  onClick={() => setFarmsAction("orders")}
                >
                  <ReceiptText className="h-3.5 w-3.5 mr-1" /> Orders ({farmOrders.length})
                </Button>
                <Button
                  size="sm"
                  variant={farmsAction === "delivery-fees" ? "default" : "ghost"}
                  className={farmsAction === "delivery-fees" ? "bg-emerald-600 text-white hover:bg-emerald-700 text-xs" : "text-xs"}
                  onClick={() => setFarmsAction("delivery-fees")}
                >
                  <Truck className="h-3.5 w-3.5 mr-1" /> Delivery Matrix
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6">
            {/* SUB-VIEW 1: PRODUCT CATALOG */}
            {farmsAction === "catalog" && (
              <div className="space-y-4">
                {/* Search & Category Filter Toolbar */}
                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search farm products..."
                      value={farmSearch}
                      onChange={(e) => setFarmSearch(e.target.value)}
                      className="pl-9 h-9 text-xs"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                    <Select
                      className="h-9 w-44 text-xs"
                      value={farmCategoryFilter}
                      onChange={(e) => setFarmCategoryFilter(e.target.value)}
                      options={[
                        { value: "all", label: "All Categories" },
                        ...inventoryCategories,
                      ]}
                    />
                  </div>
                </div>

                {/* Products Compact Scroll Grid (Max height contained) */}
                <div className="max-h-[560px] overflow-y-auto pr-1 space-y-2.5 no-scrollbar">
                  {filteredInventory.map((item) => {
                    const draft = inventoryDrafts[item.productId] ?? item;
                    return (
                      <div
                        key={item.productId}
                        className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card/60 p-3 transition hover:border-emerald-500/50 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <ImagePreview imageUrl={draft.imageUrl} fallbackClass={draft.imageBg} />
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate font-bold text-foreground text-sm">{draft.name}</p>
                              <Badge variant={draft.stockStatus === "In Stock" ? "default" : draft.stockStatus === "Out of Stock" ? "destructive" : "secondary"} className="text-[10px]">
                                {draft.stockStatus}
                              </Badge>
                              {draft.promoPrice && (
                                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                  Promo Active
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {inventoryCategories.find((c) => c.value === draft.category)?.label} · <strong className="text-foreground">{formatCurrency(draft.promoPrice ?? draft.price)}</strong>
                              {draft.originalPrice && <span className="line-through ml-1 text-muted-foreground/70">{formatCurrency(draft.originalPrice)}</span>}
                              {" · "}{draft.availableUnits} units left
                              {draft.shippingWeightKg && ` · ${draft.shippingWeightKg}kg`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 sm:justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-8"
                            onClick={() => setEditingInventoryItem(draft)}
                          >
                            <Edit3 className="h-3.5 w-3.5 mr-1" /> Edit
                          </Button>
                          {draft.stockStatus !== "Out of Stock" ? (
                            <Button
                              size="sm"
                              variant="destructive"
                              className="text-xs h-8"
                              disabled={isBusy}
                              onClick={() => void saveInventory({ ...draft, availableUnits: 0, stockStatus: "Out of Stock" })}
                            >
                              Mark Out of Stock
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="secondary"
                              className="text-xs h-8 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300"
                              disabled={isBusy}
                              onClick={() => void saveInventory({ ...draft, availableUnits: 10, stockStatus: "In Stock" })}
                            >
                              Restock (10)
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {filteredInventory.length === 0 && (
                    <div className="rounded-2xl border border-dashed p-8 text-center text-xs text-muted-foreground">
                      No farm products match your search query.
                    </div>
                  )}
                </div>
              </div>
            )}

            {farmsAction === "orders" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b pb-3">
                  <div><h3 className="text-sm font-bold text-foreground">Farm orders</h3><p className="text-xs text-muted-foreground">Paid orders, customer details, and delivery arrangements.</p></div>
                  <Badge variant="secondary">{farmOrders.length} total</Badge>
                </div>
                <div className="max-h-[560px] space-y-3 overflow-y-auto pr-1 no-scrollbar">
                  {farmOrders.map((order) => (
                    <article key={order.id} className="rounded-2xl border border-border/80 bg-card/60 p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div><div className="flex flex-wrap items-center gap-2"><p className="font-bold text-foreground text-sm">{order.invoiceNumber}</p><Badge variant={order.status === "Completed" ? "default" : "secondary"} className="text-[10px]">{order.status}</Badge>{order.delivery?.requiresWhatsAppConfirmation && <Badge variant="outline" className="text-[10px]">Delivery arrangement needed</Badge>}</div><p className="mt-1 text-xs text-muted-foreground">{order.userEmail} · {order.date} · {formatCurrency(order.total)}</p></div>
                        <p className="text-[11px] font-semibold text-muted-foreground">Order ID: {order.id}</p>
                      </div>
                      <div className="mt-3 grid gap-3 text-xs sm:grid-cols-2">
                        <div className="rounded-xl border border-border/60 bg-muted/30 p-3"><p className="font-bold uppercase tracking-wide text-muted-foreground text-[10px]">Items</p><p className="mt-1 font-semibold text-foreground">{order.items.map((item) => `${item.quantity} × ${item.name}`).join(", ")}</p></div>
                        {order.delivery ? <div className="rounded-xl border border-border/60 bg-muted/30 p-3"><p className="font-bold uppercase tracking-wide text-muted-foreground text-[10px]">Delivery</p><p className="mt-1 font-semibold text-foreground">{order.delivery.serviceName}</p><p className="mt-1 text-muted-foreground">{order.delivery.recipientName} · {order.delivery.phone}<br />{order.delivery.address}, {order.delivery.localGovernment}, {order.delivery.state}</p></div> : <div className="rounded-xl border border-border/60 bg-muted/30 p-3"><p className="font-bold uppercase tracking-wide text-muted-foreground text-[10px]">Delivery</p><p className="mt-1 font-semibold text-foreground">Customer pickup</p></div>}
                      </div>
                    </article>
                  ))}
                  {farmOrders.length === 0 && <div className="rounded-2xl border border-dashed p-8 text-center text-xs text-muted-foreground">No farm orders have been received yet.</div>}
                </div>
              </div>
            )}

            {/* SUB-VIEW 2: ADD PRODUCT */}
            {farmsAction === "add-product" && (
              <form
                className="space-y-4 max-w-4xl"
                onSubmit={(event) => {
                  event.preventDefault();
                  void saveInventory(newInventory).then((saved) => {
                    if (saved) {
                      setNewInventory(blankInventory);
                      setFarmsAction("catalog");
                    }
                  });
                }}
              >
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Add New Farm Item to Store</h3>
                    <p className="text-xs text-muted-foreground">Fill out product details, pricing, and stock limits.</p>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setFarmsAction("catalog")}>Cancel</Button>
                </div>

                <div className="grid gap-3.5 sm:grid-cols-3">
                  <div className="space-y-1 sm:col-span-2">
                    <Label htmlFor="new-name" className="text-xs font-semibold">Product Name</Label>
                    <Input
                      id="new-name"
                      required
                      placeholder="e.g. Fresh Whole Dressed Broiler Chicken"
                      value={newInventory.name}
                      onChange={(e) => setNewInventory((cur) => ({ ...cur, name: e.target.value }))}
                      className="h-9 text-xs"
                    />
                  </div>
                  <Select
                    label="Category"
                    value={newInventory.category}
                    onChange={(e) => setNewInventory((cur) => ({ ...cur, category: e.target.value as InventoryCategory }))}
                    options={inventoryCategories}
                  />

                  <div className="space-y-1">
                    <Label htmlFor="new-price" className="text-xs font-semibold">Selling Price (NGN)</Label>
                    <Input
                      id="new-price"
                      type="number"
                      min={0}
                      required
                      value={newInventory.price || ""}
                      onChange={(e) => setNewInventory((cur) => ({ ...cur, price: Number(e.target.value) }))}
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="new-orig-price" className="text-xs font-semibold">Slash Price (Original)</Label>
                    <Input
                      id="new-orig-price"
                      type="number"
                      min={0}
                      placeholder="Optional crossed-out price"
                      value={newInventory.originalPrice ?? ""}
                      onChange={(e) => setNewInventory((cur) => ({ ...cur, originalPrice: e.target.value ? Number(e.target.value) : undefined }))}
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="new-promo-price" className="text-xs font-semibold">Promo Price</Label>
                    <Input
                      id="new-promo-price"
                      type="number"
                      min={0}
                      placeholder="Optional discounted price"
                      value={newInventory.promoPrice ?? ""}
                      onChange={(e) => setNewInventory((cur) => ({ ...cur, promoPrice: e.target.value ? Number(e.target.value) : undefined }))}
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="new-units" className="text-xs font-semibold">Available Units</Label>
                    <Input
                      id="new-units"
                      type="number"
                      min={0}
                      value={newInventory.availableUnits}
                      onChange={(e) => setNewInventory((cur) => ({ ...cur, availableUnits: Number(e.target.value) }))}
                      className="h-9 text-xs"
                    />
                  </div>
                  <Select
                    label="Stock Status"
                    value={newInventory.stockStatus}
                    onChange={(e) => setNewInventory((cur) => ({ ...cur, stockStatus: e.target.value as InventoryStockStatus }))}
                    options={stockStatuses}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="new-weight" className="text-xs font-semibold">Courier Weight (kg)</Label>
                    <Input
                      id="new-weight"
                      type="number"
                      min={0}
                      step="0.01"
                      value={newInventory.shippingWeightKg ?? ""}
                      onChange={(e) => setNewInventory((cur) => ({ ...cur, shippingWeightKg: e.target.value ? Number(e.target.value) : undefined }))}
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="new-age" className="text-xs font-semibold">Animal Age / Stage</Label>
                    <Input
                      id="new-age"
                      placeholder="Optional, e.g. 8 weeks"
                      value={newInventory.age ?? ""}
                      onChange={(e) => setNewInventory((cur) => ({ ...cur, age: e.target.value }))}
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="new-display-weight" className="text-xs font-semibold">Product Weight / Pack Size</Label>
                    <Input
                      id="new-display-weight"
                      placeholder="Optional, e.g. 1.5 kg"
                      value={newInventory.weight ?? ""}
                      onChange={(e) => setNewInventory((cur) => ({ ...cur, weight: e.target.value }))}
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="new-desc" className="text-xs font-semibold">Product Description</Label>
                  <Textarea
                    id="new-desc"
                    required
                    placeholder="Short description describing quality, packaging, origin, and freshness..."
                    value={newInventory.description}
                    onChange={(e) => setNewInventory((cur) => ({ ...cur, description: e.target.value }))}
                    className="min-h-20 text-xs"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="new-img" className="text-xs font-semibold">Image URL</Label>
                    <Input
                      id="new-img"
                      value={newInventory.imageUrl ?? ""}
                      onChange={(e) => setNewInventory((cur) => ({ ...cur, imageUrl: e.target.value }))}
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="new-file" className="text-xs font-semibold">Or Upload Local Image (Max 5MB)</Label>
                    <Input
                      id="new-file"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void uploadManagedImage(file, "farm")
                          .then((url) => setNewInventory((cur) => ({ ...cur, imageUrl: url })))
                          .catch((err) => setMediaError(err instanceof Error ? err.message : "Upload failed."));
                      }}
                      className="h-9 text-xs file:text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setFarmsAction("catalog")}>Cancel</Button>
                  <Button type="submit" disabled={isBusy} className="bg-emerald-600 text-white hover:bg-emerald-700">
                    <UploadCloud className="h-4 w-4 mr-1.5" /> Publish Farm Product
                  </Button>
                </div>
              </form>
            )}

            {/* SUB-VIEW 3: DELIVERY SETTINGS */}
            {farmsAction === "delivery-fees" && (
              <form
                className="space-y-5 max-w-4xl"
                onSubmit={(e) => {
                  e.preventDefault();
                  void updateFarmDeliverySettings(farmDeliveryDraft).then(() => {
                    setAdminFeedback({ kind: "success", message: "Farm delivery settings successfully saved." });
                  });
                }}
              >
                <div className="grid gap-3 sm:grid-cols-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4">
                  <div className="space-y-1">
                    <Label htmlFor="farm-rest-fee" className="text-xs font-semibold">Rest of Country Flat Delivery Fee (NGN)</Label>
                    <Input
                      id="farm-rest-fee"
                      type="number"
                      min={0}
                      value={farmDeliveryDraft.restOfCountryFee}
                      onChange={(e) => setFarmDeliveryDraft((cur) => ({ ...cur, restOfCountryFee: Number(e.target.value) }))}
                      className="h-9 text-xs"
                    />
                    <p className="text-[10px] text-muted-foreground">Applied to any Nigerian state not explicitly listed in the matrix.</p>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="farm-whatsapp" className="text-xs font-semibold">Delivery WhatsApp Support Phone</Label>
                    <Input
                      id="farm-whatsapp"
                      inputMode="tel"
                      value={farmDeliveryDraft.whatsappNumber}
                      onChange={(e) => setFarmDeliveryDraft((cur) => ({ ...cur, whatsappNumber: e.target.value.replace(/\D/g, "") }))}
                      className="h-9 text-xs"
                    />
                    <p className="text-[10px] text-muted-foreground">Used for automated delivery confirmation links.</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-foreground">Specific State Delivery Rates</p>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="text-xs h-7"
                      onClick={() => {
                        const nextState = nigeriaStates.find((state) => !farmDeliveryDraft.stateRates.some((r) => r.state === state));
                        if (nextState) setFarmDeliveryDraft((cur) => ({ ...cur, stateRates: [...cur.stateRates, { state: nextState, fee: 3500 }] }));
                      }}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add State Rate
                    </Button>
                  </div>

                  <div className="max-h-[360px] overflow-y-auto rounded-2xl border border-border/80 divide-y no-scrollbar">
                    {farmDeliveryDraft.stateRates.map((rate, idx) => (
                      <div key={`${rate.state}-${idx}`} className="grid grid-cols-[1fr_8rem_2.5rem] items-center gap-2 p-2.5 bg-card/40">
                        <Select
                          className="h-8 text-xs"
                          value={rate.state}
                          onChange={(e) => setFarmDeliveryDraft((cur) => ({
                            ...cur,
                            stateRates: cur.stateRates.map((item, itemIdx) => itemIdx === idx ? { ...item, state: e.target.value } : item),
                          }))}
                          options={nigeriaStates.map((s) => ({ value: s, label: s }))}
                        />
                        <Input
                          type="number"
                          min={0}
                          value={rate.fee}
                          onChange={(e) => setFarmDeliveryDraft((cur) => ({
                            ...cur,
                            stateRates: cur.stateRates.map((item, itemIdx) => itemIdx === idx ? { ...item, fee: Number(e.target.value) } : item),
                          }))}
                          className="h-8 text-xs"
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => setFarmDeliveryDraft((cur) => ({
                            ...cur,
                            stateRates: cur.stateRates.filter((_, itemIdx) => itemIdx !== idx),
                          }))}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={isBusy} className="bg-emerald-600 text-white hover:bg-emerald-700">
                    Save Delivery Rates
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {/* ======================================================== */}
      {/* SECTION 3: DAJEM HOMES ADMIN                             */}
      {/* ======================================================== */}
      {activeArea === "homes" && (
        <Card className="luxury-card border-border/80">
          <CardHeader className="border-b bg-blue-500/[0.03] pb-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" /> DAJEM Homes Real Estate & Bids
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Approve agent listings, manage luxury short-lets, and connect high-value property bids.
                </p>
              </div>

              {/* Sub-action pills */}
              <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-blue-500/20 bg-card p-1">
                <Button
                  size="sm"
                  variant={homesAction === "listings" ? "default" : "ghost"}
                  className={homesAction === "listings" ? "bg-blue-600 text-white hover:bg-blue-700 text-xs" : "text-xs"}
                  onClick={() => setHomesAction("listings")}
                >
                  <Home className="h-3.5 w-3.5 mr-1" /> Listings ({snapshot.propertyListings.length})
                </Button>
                <Button
                  size="sm"
                  variant={homesAction === "add-listing" ? "default" : "ghost"}
                  className={homesAction === "add-listing" ? "bg-blue-600 text-white hover:bg-blue-700 text-xs" : "text-xs"}
                  onClick={() => setHomesAction("add-listing")}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Listing
                </Button>
                <Button
                  size="sm"
                  variant={homesAction === "bids" ? "default" : "ghost"}
                  className={homesAction === "bids" ? "bg-blue-600 text-white hover:bg-blue-700 text-xs" : "text-xs"}
                  onClick={() => setHomesAction("bids")}
                >
                  <ReceiptText className="h-3.5 w-3.5 mr-1" /> Bids ({snapshot.bids.length})
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6">
            {/* SUB-VIEW 1: PROPERTY LISTINGS */}
            {homesAction === "listings" && (
              <div className="space-y-4">
                {/* Search & Status Filter Toolbar */}
                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search property or location..."
                      value={homeSearch}
                      onChange={(e) => setHomeSearch(e.target.value)}
                      className="pl-9 h-9 text-xs"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                    <Select
                      className="h-9 w-44 text-xs"
                      value={homeStatusFilter}
                      onChange={(e) => setHomeStatusFilter(e.target.value)}
                      options={[
                        { value: "all", label: "All Statuses" },
                        { value: "Pending Approval", label: "Pending Approval" },
                        { value: "Approved", label: "Approved" },
                        { value: "Rejected", label: "Rejected" },
                      ]}
                    />
                  </div>
                </div>

                {/* Listings Compact Scroll List */}
                <div className="max-h-[560px] overflow-y-auto pr-1 space-y-3 no-scrollbar">
                  {filteredProperties.map((property) => (
                    <div
                      key={property.id}
                      className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card/60 p-4 transition hover:border-blue-500/50 sm:flex-row sm:items-start sm:justify-between"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <ImagePreview imageUrl={property.imageUrl} fallbackClass="border-blue-500/20 bg-blue-500/10 text-blue-600" />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-bold text-foreground text-sm">{property.title}</p>
                            <Badge variant={property.status === "Approved" ? "default" : property.status === "Rejected" ? "destructive" : "secondary"} className="text-[10px]">
                              {property.status}
                            </Badge>
                            <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-300">
                              {homesGroupLabel(property.listingGroup, property.type)}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {property.location} · <strong className="text-foreground">{formatCurrency(property.price)}</strong>
                            {property.beds && ` · ${property.beds} beds`} · {property.size} sqm
                          </p>
                          {property.residenceType && <p className="mt-1 text-[11px] font-semibold text-blue-700 dark:text-blue-300">{residenceLabel(property.residenceType)}</p>}
                          {property.submittedByEmail && (
                            <p className="mt-1 text-[11px] text-muted-foreground">
                              Agent: <strong className="text-foreground">{property.submittedByName}</strong> ({property.submittedByEmail})
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0 sm:justify-end">
                        {property.status !== "Approved" && (
                          <Button
                            size="sm"
                            className="bg-emerald-600 text-white hover:bg-emerald-700 h-8 text-xs"
                            disabled={isBusy}
                            onClick={() => void updatePropertyListingStatus(property.id, "Approved")}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve
                          </Button>
                        )}
                        {property.status !== "Rejected" && (
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-8 text-xs"
                            disabled={isBusy}
                            onClick={() => void updatePropertyListingStatus(property.id, "Rejected")}
                          >
                            Reject
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs"
                          onClick={() => setEditingProperty({
                            ...property,
                            highlightsText: joinHighlights(property.highlights),
                          })}
                        >
                          <Edit3 className="h-3.5 w-3.5 mr-1" /> Edit
                        </Button>

                        {property.submittedByEmail && (
                          <Select
                            className="h-8 w-36 text-[11px]"
                            value={property.agentListingPaymentStatus ?? "Not Requested"}
                            onChange={(e) => void updatePropertyListingAgentPayment(property.id, e.target.value as AgentListingPaymentStatus)}
                            options={[
                              { value: "Not Requested", label: "No contact fee" },
                              { value: "Awaiting Payment", label: "Awaiting fee" },
                              { value: "Payment Submitted", label: "Proof submitted" },
                              { value: "Paid", label: "Fee confirmed" },
                            ]}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                  {filteredProperties.length === 0 && (
                    <div className="rounded-2xl border border-dashed p-8 text-center text-xs text-muted-foreground">
                      No property listings match your query.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SUB-VIEW 2: ADD LISTING */}
            {homesAction === "add-listing" && (
              <form
                className="space-y-4 max-w-4xl"
                onSubmit={(e) => {
                  e.preventDefault();
                  void saveProperty(propertyDraft).then((saved) => {
                    if (saved) setHomesAction("listings");
                  });
                }}
              >
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Create New Real Estate Listing</h3>
                    <p className="text-xs text-muted-foreground">Add details for short-lets, apartments, land, or commercial spaces.</p>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setHomesAction("listings")}>Cancel</Button>
                </div>

                <div className="grid gap-3.5 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="prop-title" className="text-xs font-semibold">Listing Title</Label>
                    <Input
                      id="prop-title"
                      required
                      placeholder="e.g. Executive 3-Bedroom Penthouse Suite"
                      value={propertyDraft.title}
                      onChange={(e) => setPropertyDraft((cur) => ({ ...cur, title: e.target.value }))}
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="prop-loc" className="text-xs font-semibold">Location / Address</Label>
                    <Input
                      id="prop-loc"
                      required
                      placeholder="e.g. Independence Layout, Enugu"
                      value={propertyDraft.location}
                      onChange={(e) => setPropertyDraft((cur) => ({ ...cur, location: e.target.value }))}
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-4">
                  <div className="space-y-1">
                    <Label htmlFor="prop-price" className="text-xs font-semibold">Price (NGN)</Label>
                    <Input
                      id="prop-price"
                      type="number"
                      min={0}
                      required
                      value={propertyDraft.price || ""}
                      onChange={(e) => setPropertyDraft((cur) => ({ ...cur, price: Number(e.target.value) }))}
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="prop-size" className="text-xs font-semibold">Size (sqm)</Label>
                    <Input
                      id="prop-size"
                      type="number"
                      min={1}
                      required
                      value={propertyDraft.size || ""}
                      onChange={(e) => setPropertyDraft((cur) => ({ ...cur, size: Number(e.target.value) }))}
                      className="h-9 text-xs"
                    />
                  </div>
                  <Select
                    label="Property Group"
                    value={propertyDraft.listingGroup ?? "short-let"}
                    onChange={(e) => {
                      const selected = homesListingGroupOptions.find((option) => option.value === e.target.value);
                      if (selected) setPropertyDraft((cur) => ({
                        ...cur,
                        listingGroup: selected.value,
                        type: selected.type,
                        category: selected.category,
                        residenceType: selected.value === "house-rent" ? "self-contain" : cur.residenceType,
                      }));
                    }}
                    options={homesListingGroupOptions}
                  />
                  {propertyDraft.listingGroup === "land-sale" || propertyDraft.listingGroup === "land-lease" ? (
                    <div className="rounded-xl border bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground">Empty plot listing</div>
                  ) : (
                    <Select
                      label="Home Type"
                      value={propertyDraft.residenceType ?? "self-contain"}
                      onChange={(e) => setPropertyDraft((cur) => ({ ...cur, residenceType: e.target.value as ResidenceType }))}
                      options={propertyDraft.listingGroup === "house-rent" ? rentalResidenceTypeOptions : residenceTypeOptions}
                    />
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="prop-beds" className="text-xs font-semibold">Bedrooms</Label>
                    <Input
                      id="prop-beds"
                      type="number"
                      min={0}
                      value={propertyDraft.beds ?? 1}
                      onChange={(e) => setPropertyDraft((cur) => ({ ...cur, beds: Number(e.target.value) }))}
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="prop-baths" className="text-xs font-semibold">Bathrooms</Label>
                    <Input
                      id="prop-baths"
                      type="number"
                      min={0}
                      value={propertyDraft.baths ?? 1}
                      onChange={(e) => setPropertyDraft((cur) => ({ ...cur, baths: Number(e.target.value) }))}
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="prop-summary" className="text-xs font-semibold">Summary / Description</Label>
                  <Textarea
                    id="prop-summary"
                    required
                    placeholder="Comprehensive overview of amenities, power backup, security, and access roads..."
                    value={propertyDraft.summary}
                    onChange={(e) => setPropertyDraft((cur) => ({ ...cur, summary: e.target.value }))}
                    className="min-h-20 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="prop-highlights" className="text-xs font-semibold">Highlights (Comma-separated)</Label>
                  <Input
                    id="prop-highlights"
                    placeholder="24/7 Security, High-Speed WiFi, Generator Backup, Swimming Pool"
                    value={propertyDraft.highlightsText}
                    onChange={(e) => setPropertyDraft((cur) => ({ ...cur, highlightsText: e.target.value }))}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-1">
                    <Label htmlFor="prop-img" className="text-xs font-semibold">Image URL</Label>
                    <Input
                      id="prop-img"
                      value={propertyDraft.imageUrl ?? ""}
                      onChange={(e) => setPropertyDraft((cur) => ({ ...cur, imageUrl: e.target.value }))}
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="prop-file" className="text-xs font-semibold">Or Upload Image</Label>
                    <Input
                      id="prop-file"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void uploadManagedImage(file, "property")
                          .then((url) => setPropertyDraft((cur) => ({ ...cur, imageUrl: url })))
                          .catch((err) => setMediaError(err instanceof Error ? err.message : "Upload failed."));
                      }}
                      className="h-9 text-xs file:text-xs"
                    />
                  </div>
                  <Select
                    label="Initial Status"
                    value={propertyDraft.status}
                    onChange={(e) => setPropertyDraft((cur) => ({ ...cur, status: e.target.value as ApprovalStatus }))}
                    options={approvalStatuses}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setHomesAction("listings")}>Cancel</Button>
                  <Button type="submit" disabled={isBusy} className="bg-blue-600 text-white hover:bg-blue-700">
                    <UploadCloud className="h-4 w-4 mr-1.5" /> Publish Property Listing
                  </Button>
                </div>
              </form>
            )}

            {/* SUB-VIEW 3: CLIENT BIDS */}
            {homesAction === "bids" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b pb-2.5">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Property Offers & Bids</h3>
                    <p className="text-xs text-muted-foreground">Review buyer offers and connect interested parties directly.</p>
                  </div>
                  <Badge variant="secondary">{snapshot.bids.length} bids logged</Badge>
                </div>

                <div className="max-h-[520px] overflow-y-auto pr-1 space-y-3 no-scrollbar">
                  {snapshot.bids.map((bid) => (
                    <div
                      key={bid.id}
                      className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card/60 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-bold text-foreground text-sm">{bid.propertyTitle}</p>
                          <Badge variant={bid.status === "Connected" ? "default" : bid.status === "Rejected" ? "destructive" : "secondary"} className="text-[10px]">
                            {bid.status}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Buyer: <strong className="text-foreground">{bid.userName}</strong> · {bid.userEmail} · {bid.userPhone}
                        </p>
                        <p className="mt-1 text-xs">
                          Offered: <strong className="text-foreground">{formatCurrency(bid.bidAmount)}</strong>
                          <span className="text-muted-foreground ml-1.5">(Asking price: {formatCurrency(bid.propertyPrice)})</span>
                        </p>
                        {bid.notes && <p className="mt-2 text-xs italic text-muted-foreground">"{bid.notes}"</p>}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 text-xs bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 dark:text-blue-300"
                          disabled={isBusy || bid.status === "Connected"}
                          onClick={() => void handleBidStatus(bid.id, "Connected")}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                          {bid.status === "Connected" ? "Connected" : "Connect Client"}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-8 text-xs"
                          disabled={isBusy || bid.status === "Rejected"}
                          onClick={() => void handleBidStatus(bid.id, "Rejected")}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                  {snapshot.bids.length === 0 && (
                    <div className="rounded-2xl border border-dashed p-8 text-center text-xs text-muted-foreground">
                      No buyer bids have been submitted yet.
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ======================================================== */}
      {/* SECTION 4: DAJEM ORBITAL ADMIN                           */}
      {/* ======================================================== */}
      {activeArea === "orbital" && (
        <Card className="luxury-card border-border/80">
          <CardHeader className="border-b bg-cyan-500/[0.03] pb-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-cyan-600" /> DAJEM Orbital Survey Desk
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Track client survey requests, attached title documents, DHL waybills, and survey services.
                </p>
              </div>

              {/* Sub-action pills */}
              <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-cyan-500/20 bg-card p-1">
                <Button
                  size="sm"
                  variant={orbitalAction === "inquiries" ? "default" : "ghost"}
                  className={orbitalAction === "inquiries" ? "bg-cyan-600 text-white hover:bg-cyan-700 text-xs" : "text-xs"}
                  onClick={() => setOrbitalAction("inquiries")}
                >
                  <ClipboardList className="h-3.5 w-3.5 mr-1" /> Inquiries & Jobs ({snapshot.surveys.length})
                </Button>
                <Button
                  size="sm"
                  variant={orbitalAction === "services" ? "default" : "ghost"}
                  className={orbitalAction === "services" ? "bg-cyan-600 text-white hover:bg-cyan-700 text-xs" : "text-xs"}
                  onClick={() => setOrbitalAction("services")}
                >
                  <Layers className="h-3.5 w-3.5 mr-1" /> Survey Services ({snapshot.surveyServices.length})
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6">
            {/* SUB-VIEW 1: INQUIRIES & DHL TRACKER */}
            {orbitalAction === "inquiries" && (
              <div className="space-y-4">
                {/* Search & Status Filter Toolbar */}
                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by client, location, or service..."
                      value={orbitalSearch}
                      onChange={(e) => setOrbitalSearch(e.target.value)}
                      className="pl-9 h-9 text-xs"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                    <Select
                      className="h-9 w-44 text-xs"
                      value={orbitalStatusFilter}
                      onChange={(e) => setOrbitalStatusFilter(e.target.value)}
                      options={[
                        { value: "all", label: "All Request Statuses" },
                        { value: "Pending Approval", label: "Pending Approval" },
                        { value: "In Progress", label: "In Progress" },
                        { value: "Completed & Sent", label: "Completed & Sent" },
                        { value: "Rejected", label: "Rejected" },
                      ]}
                    />
                  </div>
                </div>

                {/* Survey Job Cards (Height contained) */}
                <div className="max-h-[560px] overflow-y-auto pr-1 space-y-4 no-scrollbar">
                  {filteredSurveys.map((survey) => (
                    <div
                      key={survey.id}
                      className="rounded-2xl border border-border/80 bg-card/60 p-4 transition hover:border-cyan-500/50"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-bold text-foreground text-sm flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-cyan-600" /> {survey.location}
                            </p>
                            <Badge variant={survey.status === "Completed & Sent" ? "default" : survey.status === "Rejected" ? "destructive" : "secondary"} className="text-[10px]">
                              {survey.status}
                            </Badge>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Client: <strong className="text-foreground">{survey.userName}</strong> · {survey.serviceType} · {dateValue(survey.date)?.toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" })}
                          </p>
                        </div>

                        {/* Status update selector */}
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-muted-foreground font-semibold">Status:</span>
                          <Select
                            className="h-8 w-40 text-xs"
                            value={survey.status}
                            onChange={(e) => void updateSurveyStatus(survey.id, e.target.value as SurveyStatus)}
                            options={[
                              { value: "Pending Approval", label: "Pending Approval" },
                              { value: "In Progress", label: "In Progress" },
                              { value: "Completed & Sent", label: "Completed & Sent" },
                              { value: "Rejected", label: "Rejected" },
                            ]}
                          />
                        </div>
                      </div>

                      <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed whitespace-pre-line bg-muted/30 p-3 rounded-xl border border-border/40">
                        {survey.description}
                      </p>

                      {/* Documents Attachments */}
                      {survey.documentAttachments && survey.documentAttachments.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-2 text-xs">
                          {survey.documentAttachments.map((att) => (
                            <span key={`${att.documentName}-${att.fileName}`} className="inline-flex items-center rounded-lg border bg-muted/40 px-2.5 py-1 text-[11px] text-muted-foreground">
                              <FileText className="h-3.5 w-3.5 mr-1 text-cyan-600" />
                              {att.documentName}: <strong className="text-foreground ml-1">{att.fileName}</strong> ({att.fileSizeKb} KB)
                            </span>
                          ))}
                        </div>
                      )}

                      {/* DHL Delivery Fulfillment Container */}
                      {survey.delivery && deliveryDrafts[survey.id] && (
                        <div className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-3 text-xs">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2">
                              <div className="rounded-lg bg-amber-600 p-1.5 text-white"><Truck className="h-3.5 w-3.5" /></div>
                              <div>
                                <p className="font-bold text-foreground">DHL Express Dispatch</p>
                                <p className="text-[11px] text-muted-foreground">
                                  {survey.delivery.recipientName} ({survey.delivery.phone}) · {survey.delivery.address}, {survey.delivery.city}, {survey.delivery.state}
                                </p>
                              </div>
                            </div>
                            <span className="font-bold text-foreground text-right">{formatCurrency(survey.delivery.fee)}</span>
                          </div>

                          <div className="mt-3 grid gap-2.5 sm:grid-cols-[1fr_10rem_auto] sm:items-end">
                            <div className="space-y-1">
                              <Label htmlFor={`tracking-${survey.id}`} className="text-[11px] font-semibold">DHL Waybill Number</Label>
                              <Input
                                id={`tracking-${survey.id}`}
                                value={deliveryDrafts[survey.id].trackingNumber}
                                onChange={(e) => setDeliveryDrafts((cur) => ({
                                  ...cur,
                                  [survey.id]: { ...cur[survey.id], trackingNumber: e.target.value },
                                }))}
                                placeholder="Enter tracking code after dispatch..."
                                className="h-8 text-xs"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor={`del-status-${survey.id}`} className="text-[11px] font-semibold">Fulfillment Status</Label>
                              <Select
                                id={`del-status-${survey.id}`}
                                value={deliveryDrafts[survey.id].status}
                                onChange={(e) => setDeliveryDrafts((cur) => ({
                                  ...cur,
                                  [survey.id]: { ...cur[survey.id], status: e.target.value as SurveyDeliveryStatus },
                                }))}
                                options={surveyDeliveryStatuses.map((st) => ({ value: st, label: st }))}
                                className="h-8 text-xs"
                              />
                            </div>
                            <Button
                              size="sm"
                              disabled={isBusy}
                              className="h-8 text-xs bg-amber-600 text-white hover:bg-amber-700"
                              onClick={() => void updateSurveyDelivery(
                                survey.id,
                                deliveryDrafts[survey.id].status,
                                deliveryDrafts[survey.id].trackingNumber,
                              ).then(() => setAdminFeedback({ kind: "success", message: "DHL tracking details updated." }))}
                            >
                              Save Tracking
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {filteredSurveys.length === 0 && (
                    <div className="rounded-2xl border border-dashed p-8 text-center text-xs text-muted-foreground">
                      No survey requests match your filter.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SUB-VIEW 2: SURVEY SERVICES CATALOG */}
            {orbitalAction === "services" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Active Survey Services</h3>
                    <p className="text-xs text-muted-foreground">Configure baseline prices, turnaround windows, and descriptions.</p>
                  </div>
                  <Button
                    size="sm"
                    className="bg-cyan-600 text-white hover:bg-cyan-700 text-xs"
                    onClick={() => { setServiceDraft(blankService); setServiceEditorOpen(true); }}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Survey Service
                  </Button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {snapshot.surveyServices.map((service) => (
                    <div key={service.id} className="rounded-2xl border border-border/80 bg-card/60 p-4 transition hover:border-cyan-500/50">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-foreground text-sm">{service.title}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            Starting from <strong className="text-foreground">{formatCurrency(service.priceFrom)}</strong> · {service.timeline}
                          </p>
                        </div>
                        <Badge variant={service.status === "Approved" ? "default" : "secondary"} className="text-[10px]">
                          {service.status}
                        </Badge>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {service.description}
                      </p>
                      <div className="mt-3 flex justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => { setServiceDraft(service); setServiceEditorOpen(true); }}
                        >
                          <Edit3 className="h-3.5 w-3.5 mr-1" /> Edit Service
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ======================================================== */}
      {/* SECTION 5: FINANCIAL REPORTS & LEDGER                    */}
      {/* ======================================================== */}
      {activeArea === "reports" && (
        <Card className="luxury-card border-border/80">
          <CardHeader className="border-b bg-amber-500/[0.03] pb-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <FileText className="h-5 w-5 text-amber-500" /> Financial Statements & Activity Reports
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Audited register of paid customer invoices, bid deposits, and survey inquiries.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => window.print()}>
                  <ReceiptText className="h-3.5 w-3.5 mr-1" /> Print
                </Button>
                <Button
                  size="sm"
                  className="bg-amber-500 text-slate-950 hover:bg-amber-400 text-xs h-8 font-bold"
                  onClick={() => downloadCsv(`dajem-ledger-${reportPeriod}.csv`, activityRows)}
                >
                  <Download className="h-3.5 w-3.5 mr-1" /> Export CSV
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 space-y-5">
            {/* Report Filter Controls */}
            <div className="grid gap-3 sm:grid-cols-[12rem_1fr_1fr] sm:items-end">
              <Select
                label="Period Window"
                value={reportPeriod}
                onChange={(e) => setReportPeriod(e.target.value as ReportPeriod)}
                options={[
                  { value: "today", label: "Today" },
                  { value: "week", label: "Last 7 Days" },
                  { value: "month", label: "This Month" },
                  { value: "custom", label: "Custom Range" },
                ]}
              />
              {reportPeriod === "custom" && (
                <>
                  <div className="space-y-1">
                    <Label htmlFor="rep-start" className="text-xs font-semibold">From Date</Label>
                    <Input id="rep-start" type="date" value={reportStart} onChange={(e) => setReportStart(e.target.value)} className="h-9 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="rep-end" className="text-xs font-semibold">To Date</Label>
                    <Input id="rep-end" type="date" value={reportEnd} onChange={(e) => setReportEnd(e.target.value)} className="h-9 text-xs" />
                  </div>
                </>
              )}
            </div>

            {/* Quick KPI Stat Ribbon */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl border bg-card/60 p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Transactions Logged</p>
                <p className="mt-1 text-2xl font-black text-foreground">{activityRows.length}</p>
              </div>
              <div className="rounded-2xl border bg-card/60 p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Recorded Value</p>
                <p className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(reportValue)}</p>
              </div>
              <div className="rounded-2xl border bg-card/60 p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Active Period</p>
                <p className="mt-1 text-xs font-bold text-foreground">
                  {activityStart.toLocaleDateString("en-NG", { day: "2-digit", month: "short" })} - {activityEnd.toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" })}
                </p>
              </div>
            </div>

            {/* Scroll-contained Data Table */}
            <div className="max-h-[460px] overflow-y-auto overflow-x-auto rounded-2xl border border-border/80 no-scrollbar">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-muted/80 backdrop-blur-md text-[11px] uppercase tracking-wider text-muted-foreground border-b font-extrabold">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Business</th>
                    <th className="p-3">Activity</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Value (NGN)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 bg-card/40">
                  {activityRows.map((row) => (
                    <tr key={`report-${row.area}-${row.id}`} className="hover:bg-muted/30 transition">
                      <td className="p-3 text-muted-foreground whitespace-nowrap">
                        {dateValue(row.date)?.toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" }) ?? row.date}
                      </td>
                      <td className="p-3 font-bold text-foreground">{row.area}</td>
                      <td className="p-3 font-semibold text-foreground">{row.activity}</td>
                      <td className="p-3">
                        <Badge variant={row.status === "Paid" || row.status === "Approved" || row.status === "Completed & Sent" ? "default" : row.status === "Rejected" ? "destructive" : "secondary"} className="text-[10px]">
                          {row.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-right font-bold text-foreground">
                        {row.amount !== undefined ? formatCurrency(row.amount) : "-"}
                      </td>
                    </tr>
                  ))}
                  {activityRows.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-xs text-muted-foreground">
                        No transactions recorded for the selected date window.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ======================================================== */}
      {/* SECTION 6: CUSTOMER SUPPORT DESK                         */}
      {/* ======================================================== */}
      {activeArea === "support" && (
        <Card className="luxury-card border-border/80">
          <CardHeader className="border-b bg-violet-500/[0.03] pb-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Headphones className="h-5 w-5 text-violet-600" /> Customer Support Center
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Direct customer inquiries, delivery questions, and official executive responses.
                </p>
              </div>

              {/* Status filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <Select
                  className="h-9 w-40 text-xs"
                  value={supportStatusFilter}
                  onChange={(e) => setSupportStatusFilter(e.target.value)}
                  options={[
                    { value: "all", label: "All Tickets" },
                    ...supportTicketStatuses.map((st) => ({ value: st, label: st })),
                  ]}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6">
            <div className="max-h-[560px] overflow-y-auto pr-1 space-y-4 no-scrollbar">
              {filteredSupportTickets.map((ticket) => (
                <div key={ticket.id} className="rounded-2xl border border-border/80 bg-card/60 p-4 transition hover:border-violet-500/50 space-y-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold text-foreground text-sm">{ticket.subject}</p>
                        <Badge variant={ticket.status === "Resolved" || ticket.status === "Closed" ? "default" : ticket.status === "In Progress" ? "secondary" : "outline"} className="text-[10px]">
                          {ticket.status}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {ticket.userName} ({ticket.userEmail}) · Category: <strong className="text-foreground">{ticket.category}</strong> · {new Date(ticket.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                      {ticket.orderId && <p className="mt-1 text-xs font-bold text-primary">Related Order Reference: #{ticket.orderId}</p>}
                    </div>

                    <Select
                      className="h-8 w-36 text-xs"
                      value={ticket.status}
                      onChange={(e) => void updateSupportTicket({
                        ticketId: ticket.id,
                        status: e.target.value as SupportTicketStatus,
                        adminNote: ticketNotes[ticket.id] ?? ticket.adminNote,
                      }).then(() => setAdminFeedback({ kind: "success", message: "Ticket status updated." }))}
                      options={supportTicketStatuses.map((st) => ({ value: st, label: st }))}
                    />
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap bg-muted/30 p-3 rounded-xl border border-border/40">
                    {ticket.message}
                  </p>

                  <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold text-muted-foreground">Executive Staff Response</Label>
                      <Textarea
                        placeholder="Write a response visible to the customer..."
                        value={ticketNotes[ticket.id] ?? ticket.adminNote ?? ""}
                        onChange={(e) => setTicketNotes((cur) => ({ ...cur, [ticket.id]: e.target.value }))}
                        className="text-xs min-h-16"
                      />
                    </div>
                    <Button
                      size="sm"
                      disabled={isBusy}
                      className="bg-violet-600 text-white hover:bg-violet-700 h-9 text-xs"
                      onClick={() => void updateSupportTicket({
                        ticketId: ticket.id,
                        status: ticket.status,
                        adminNote: ticketNotes[ticket.id] ?? ticket.adminNote,
                      }).then(() => setAdminFeedback({ kind: "success", message: "Response saved and dispatched to customer." }))}
                    >
                      Save & Reply
                    </Button>
                  </div>
                </div>
              ))}
              {filteredSupportTickets.length === 0 && (
                <div className="rounded-2xl border border-dashed p-8 text-center text-xs text-muted-foreground">
                  No support tickets match the selected status.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ======================================================== */}
      {/* SECTION 7: USERS & STAFF DIRECTORY                       */}
      {/* ======================================================== */}
      {activeArea === "users" && (
        <Card className="luxury-card border-border/80">
          <CardHeader className="border-b bg-indigo-500/[0.03] pb-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-600" /> Users & Staff Directory
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Registered customer profiles, administrative roles, and telephone contacts.
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search user name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6">
            <div className="max-h-[560px] overflow-y-auto pr-1 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 no-scrollbar">
              {filteredUsers.map((user) => (
                <div key={user.id} className="rounded-2xl border border-border/80 bg-card/60 p-4 transition hover:border-indigo-500/50">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600/10 font-black text-indigo-700 dark:text-indigo-300 text-sm">
                        {user.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-bold text-foreground text-sm">{user.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <Badge variant={user.role === "admin" ? "default" : "outline"} className="text-[10px]">
                      {user.role}
                    </Badge>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{user.phone || "No phone registered"}</span>
                  </div>
                </div>
              ))}
              {filteredUsers.length === 0 && (
                <div className="col-span-full rounded-2xl border border-dashed p-8 text-center text-xs text-muted-foreground">
                  No users found matching your search term.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ======================================================== */}
      {/* EDIT MODAL: INVENTORY ITEM DIALOG                        */}
      {/* ======================================================== */}
      {editingInventoryItem && (
        <Dialog
          isOpen={Boolean(editingInventoryItem)}
          onClose={() => setEditingInventoryItem(null)}
          title={`Edit Product: ${editingInventoryItem.name}`}
        >
          <div className="space-y-4 pt-2">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs font-semibold">Product Name</Label>
                <Input
                  value={editingInventoryItem.name}
                  onChange={(e) => setEditingInventoryItem({ ...editingInventoryItem, name: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>
              <Select
                label="Category"
                value={editingInventoryItem.category}
                onChange={(e) => setEditingInventoryItem({ ...editingInventoryItem, category: e.target.value as InventoryCategory })}
                options={inventoryCategories}
              />
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Selling Price (NGN)</Label>
                <Input
                  type="number"
                  min={0}
                  value={editingInventoryItem.price}
                  onChange={(e) => setEditingInventoryItem({ ...editingInventoryItem, price: Number(e.target.value) })}
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Available Units</Label>
                <Input
                  type="number"
                  min={0}
                  value={editingInventoryItem.availableUnits}
                  onChange={(e) => setEditingInventoryItem({ ...editingInventoryItem, availableUnits: Number(e.target.value) })}
                  className="h-9 text-xs"
                />
              </div>
              <Select
                label="Stock Status"
                value={editingInventoryItem.stockStatus}
                onChange={(e) => setEditingInventoryItem({ ...editingInventoryItem, stockStatus: e.target.value as InventoryStockStatus })}
                options={stockStatuses}
              />
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Animal Age / Stage</Label>
                <Input
                  value={editingInventoryItem.age ?? ""}
                  placeholder="Optional, e.g. 8 weeks"
                  onChange={(e) => setEditingInventoryItem({ ...editingInventoryItem, age: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Product Weight / Pack Size</Label>
                <Input
                  value={editingInventoryItem.weight ?? ""}
                  placeholder="Optional, e.g. 1.5 kg"
                  onChange={(e) => setEditingInventoryItem({ ...editingInventoryItem, weight: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Courier Weight (kg)</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={editingInventoryItem.shippingWeightKg ?? ""}
                  onChange={(e) => setEditingInventoryItem({ ...editingInventoryItem, shippingWeightKg: e.target.value ? Number(e.target.value) : undefined })}
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Slash Price (Original NGN)</Label>
                <Input
                  type="number"
                  min={0}
                  value={editingInventoryItem.originalPrice ?? ""}
                  onChange={(e) => setEditingInventoryItem({ ...editingInventoryItem, originalPrice: e.target.value ? Number(e.target.value) : undefined })}
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Promo Discount Price (NGN)</Label>
                <Input
                  type="number"
                  min={0}
                  value={editingInventoryItem.promoPrice ?? ""}
                  onChange={(e) => setEditingInventoryItem({ ...editingInventoryItem, promoPrice: e.target.value ? Number(e.target.value) : undefined })}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Description</Label>
              <Textarea
                value={editingInventoryItem.description}
                onChange={(e) => setEditingInventoryItem({ ...editingInventoryItem, description: e.target.value })}
                className="text-xs min-h-20"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Product Image URL</Label>
                <Input
                  value={editingInventoryItem.imageUrl ?? ""}
                  onChange={(e) => setEditingInventoryItem({ ...editingInventoryItem, imageUrl: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Replace with Local Image (Max 5MB)</Label>
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void uploadManagedImage(file, "farm")
                      .then((url) => setEditingInventoryItem((current) => current ? { ...current, imageUrl: url } : current))
                      .catch((err) => setMediaError(err instanceof Error ? err.message : "Upload failed."));
                  }}
                  className="h-9 text-xs file:text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button type="button" variant="outline" onClick={() => setEditingInventoryItem(null)}>Cancel</Button>
              <Button
                type="button"
                disabled={isBusy}
                className="bg-emerald-600 text-white hover:bg-emerald-700"
                onClick={() => void saveInventory(editingInventoryItem)}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* ======================================================== */}
      {/* EDIT MODAL: PROPERTY LISTING DIALOG                      */}
      {/* ======================================================== */}
      {editingProperty && (
        <Dialog
          isOpen={Boolean(editingProperty)}
          onClose={() => setEditingProperty(null)}
          title={`Edit Property: ${editingProperty.title}`}
        >
          <div className="space-y-4 pt-2">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs font-semibold">Title</Label>
                <Input
                  value={editingProperty.title}
                  onChange={(e) => setEditingProperty({ ...editingProperty, title: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs font-semibold">Location</Label>
                <Input
                  value={editingProperty.location}
                  onChange={(e) => setEditingProperty({ ...editingProperty, location: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Price (NGN)</Label>
                <Input
                  type="number"
                  min={0}
                  value={editingProperty.price}
                  onChange={(e) => setEditingProperty({ ...editingProperty, price: Number(e.target.value) })}
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Size (sqm)</Label>
                <Input
                  type="number"
                  min={1}
                  value={editingProperty.size}
                  onChange={(e) => setEditingProperty({ ...editingProperty, size: Number(e.target.value) })}
                  className="h-9 text-xs"
                />
              </div>
              <Select
                label="Property Group"
                value={editingProperty.listingGroup ?? "short-let"}
                onChange={(e) => {
                  const selected = homesListingGroupOptions.find((option) => option.value === e.target.value);
                  if (selected) setEditingProperty({
                    ...editingProperty,
                    listingGroup: selected.value,
                    type: selected.type,
                    category: selected.category,
                    residenceType: selected.value === "house-rent" ? "self-contain" : editingProperty.residenceType,
                  });
                }}
                options={homesListingGroupOptions}
              />
              {editingProperty.listingGroup === "land-sale" || editingProperty.listingGroup === "land-lease" ? (
                <div className="rounded-xl border bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground">Empty plot listing</div>
              ) : (
                <Select
                  label="Home Type"
                  value={editingProperty.residenceType ?? "self-contain"}
                  onChange={(e) => setEditingProperty({ ...editingProperty, residenceType: e.target.value as ResidenceType })}
                  options={editingProperty.listingGroup === "house-rent" ? rentalResidenceTypeOptions : residenceTypeOptions}
                />
              )}
              <Select
                label="Status"
                value={editingProperty.status}
                onChange={(e) => setEditingProperty({ ...editingProperty, status: e.target.value as ApprovalStatus })}
                options={approvalStatuses}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Summary</Label>
              <Textarea
                value={editingProperty.summary}
                onChange={(e) => setEditingProperty({ ...editingProperty, summary: e.target.value })}
                className="text-xs min-h-20"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Highlights (Comma-separated)</Label>
              <Input
                value={editingProperty.highlightsText}
                onChange={(e) => setEditingProperty({ ...editingProperty, highlightsText: e.target.value })}
                className="h-9 text-xs"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Image URL</Label>
                <Input
                  value={editingProperty.imageUrl ?? ""}
                  onChange={(e) => setEditingProperty({ ...editingProperty, imageUrl: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Replace with Local Image (Max 5MB)</Label>
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void uploadManagedImage(file, "property")
                      .then((url) => setEditingProperty((current) => current ? { ...current, imageUrl: url } : current))
                      .catch((err) => setMediaError(err instanceof Error ? err.message : "Upload failed."));
                  }}
                  className="h-9 text-xs file:text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button type="button" variant="outline" onClick={() => setEditingProperty(null)}>Cancel</Button>
              <Button
                type="button"
                disabled={isBusy}
                className="bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => void saveProperty(editingProperty)}
              >
                Save Property
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* ======================================================== */}
      {/* EDIT MODAL: SURVEY SERVICE DIALOG                        */}
      {/* ======================================================== */}
      {serviceEditorOpen && (
        <Dialog
          isOpen={serviceEditorOpen}
          onClose={() => setServiceEditorOpen(false)}
          title={serviceDraft.id ? `Edit Service: ${serviceDraft.title}` : "Add Survey Service"}
        >
          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Service Title</Label>
              <Input
                required
                value={serviceDraft.title}
                onChange={(e) => setServiceDraft({ ...serviceDraft, title: e.target.value })}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Description</Label>
              <Textarea
                required
                value={serviceDraft.description}
                onChange={(e) => setServiceDraft({ ...serviceDraft, description: e.target.value })}
                className="text-xs min-h-20"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Starting Price (NGN)</Label>
                <Input
                  type="number"
                  min={0}
                  value={serviceDraft.priceFrom}
                  onChange={(e) => setServiceDraft({ ...serviceDraft, priceFrom: Number(e.target.value) })}
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Timeline Window</Label>
                <Input
                  value={serviceDraft.timeline}
                  onChange={(e) => setServiceDraft({ ...serviceDraft, timeline: e.target.value })}
                  placeholder="e.g. 5 - 10 working days"
                  className="h-9 text-xs"
                />
              </div>
            </div>
            <Select
              label="Service Status"
              value={serviceDraft.status}
              onChange={(e) => setServiceDraft({ ...serviceDraft, status: e.target.value as ApprovalStatus })}
              options={approvalStatuses}
            />

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button type="button" variant="outline" onClick={() => setServiceEditorOpen(false)}>Cancel</Button>
              <Button
                type="button"
                disabled={isBusy}
                className="bg-cyan-600 text-white hover:bg-cyan-700"
                onClick={() => void saveService(serviceDraft)}
              >
                Save Survey Service
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
