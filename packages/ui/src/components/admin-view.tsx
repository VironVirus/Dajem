"use client";

import * as React from "react";
import { BarChart3, ClipboardList, Home, ImageIcon, Package, Shield, UploadCloud, Users } from "lucide-react";
import { Badge } from "./badge";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Input } from "./input";
import { Label } from "./label";
import { Select } from "./select";
import { Textarea } from "./textarea";
import { useDajem } from "./dajem-provider";
import type {
  ApprovalStatus,
  InventoryCategory,
  InventoryItem,
  InventoryStockStatus,
  PropertyCategory,
  PropertyListing,
  PropertyType,
  SurveyService,
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

function readImageFile(file: File, onValue: (value: string) => void) {
  const reader = new FileReader();
  reader.onload = () => {
    if (typeof reader.result === "string") {
      onValue(reader.result);
    }
  };
  reader.readAsDataURL(file);
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

export function AdminView() {
  const {
    currentUser,
    snapshot,
    isBusy,
    updateBidStatus,
    updateInventoryItem,
    updatePropertyListingStatus,
    updateSurveyStatus,
    upsertPropertyListing,
    upsertSurveyService,
    openAuthModal,
  } = useDajem();
  const [inventoryDrafts, setInventoryDrafts] = React.useState<Record<string, InventoryItem>>({});
  const [newInventory, setNewInventory] = React.useState<InventoryItem>(blankInventory);
  const [propertyDraft, setPropertyDraft] = React.useState<PropertyForm>(blankProperty);
  const [serviceDraft, setServiceDraft] = React.useState<SurveyService>(blankService);

  React.useEffect(() => {
    const nextDrafts = Object.fromEntries(snapshot.inventory.map((item) => [item.productId, item]));
    setInventoryDrafts(nextDrafts);
  }, [snapshot.inventory]);

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

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-[1.75rem] border border-white/20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-xl shadow-slate-950/12">
        <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-emerald-400/16 blur-3xl" />
        <div className="relative">
          <Badge variant="secondary" className="mb-3">Unified Admin Portal</Badge>
          <h1 className="text-3xl font-bold text-white">DAJEM operations console</h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-200">
            Manage Dajem Farms products, Dajem Homes listings, Dajem Orbital service requests, approvals, images, users, and integrations from one shared workspace.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-200">
            <span className="rounded-full border border-white/15 bg-white/8 px-3 py-1">Backend: {snapshot.integrations.backend}</span>
            <span className="rounded-full border border-white/15 bg-white/8 px-3 py-1">Supabase: {snapshot.integrations.supabaseConfigured ? "Ready" : "Fallback mode"}</span>
            <span className="rounded-full border border-white/15 bg-white/8 px-3 py-1">Flutterwave: {snapshot.integrations.flutterwaveConfigured ? "Test handshake ready" : "Not active"}</span>
          </div>
        </div>
      </div>

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

      <Card>
        <CardHeader>
          <CardTitle>Dajem Farms Product Uploads</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
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
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) readImageFile(file, (imageUrl) => setNewInventory((current) => ({ ...current, imageUrl })));
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

          <div className="grid gap-4 xl:grid-cols-2">
            {snapshot.inventory.map((item) => {
              const draft = inventoryDrafts[item.productId] ?? item;
              return (
                <div key={item.productId} className="rounded-xl border p-4">
                  <div className="grid gap-4 md:grid-cols-[140px_1fr]">
                    <ImagePreview imageUrl={draft.imageUrl} fallbackClass={draft.imageBg} />
                    <div className="space-y-4">
                      <div className="grid gap-3 md:grid-cols-2">
                        <Input
                          value={draft.name}
                          onChange={(event) => setInventoryDrafts((current) => ({
                            ...current,
                            [item.productId]: { ...draft, name: event.target.value },
                          }))}
                        />
                        <Select
                          value={draft.category}
                          onChange={(event) => setInventoryDrafts((current) => ({
                            ...current,
                            [item.productId]: { ...draft, category: event.target.value as InventoryCategory },
                          }))}
                          options={inventoryCategories}
                        />
                      </div>
                      <Textarea
                        value={draft.description}
                        onChange={(event) => setInventoryDrafts((current) => ({
                          ...current,
                          [item.productId]: { ...draft, description: event.target.value },
                        }))}
                      />
                      <div className="grid gap-3 md:grid-cols-4">
                        <Input
                          type="number"
                          value={draft.price}
                          onChange={(event) => setInventoryDrafts((current) => ({
                            ...current,
                            [item.productId]: { ...draft, price: Number(event.target.value) },
                          }))} 
                        />
                        <Input
                          value={draft.age ?? ""}
                          aria-label="Age"
                          onChange={(event) => setInventoryDrafts((current) => ({
                            ...current,
                            [item.productId]: { ...draft, age: event.target.value },
                          }))}
                        />
                        <Input
                          value={draft.weight ?? ""}
                          aria-label="Weight"
                          onChange={(event) => setInventoryDrafts((current) => ({
                            ...current,
                            [item.productId]: { ...draft, weight: event.target.value },
                          }))}
                        />
                        <Input
                          type="number"
                          value={draft.availableUnits}
                          onChange={(event) => setInventoryDrafts((current) => ({
                            ...current,
                            [item.productId]: { ...draft, availableUnits: Number(event.target.value) },
                          }))}
                        />
                        <Select
                          value={draft.stockStatus}
                          onChange={(event) => setInventoryDrafts((current) => ({
                            ...current,
                            [item.productId]: { ...draft, stockStatus: event.target.value as InventoryItem["stockStatus"] },
                          }))}
                          options={stockStatuses}
                        />
                        <Button disabled={isBusy} onClick={() => void saveInventory(draft)}>
                          Save
                        </Button>
                      </div>
                      <div className="grid gap-3 md:grid-cols-4">
                        <Input
                          type="number"
                          aria-label="Price before slash"
                          value={draft.originalPrice ?? ""}
                          onChange={(event) => setInventoryDrafts((current) => ({
                            ...current,
                            [item.productId]: { ...draft, originalPrice: event.target.value ? Number(event.target.value) : undefined },
                          }))}
                        />
                        <Input
                          type="number"
                          aria-label="Promo price"
                          value={draft.promoPrice ?? ""}
                          onChange={(event) => setInventoryDrafts((current) => ({
                            ...current,
                            [item.productId]: { ...draft, promoPrice: event.target.value ? Number(event.target.value) : undefined },
                          }))}
                        />
                        <Input
                          type="date"
                          aria-label="Promo end date"
                          value={draft.promoEndsAt ?? ""}
                          onChange={(event) => setInventoryDrafts((current) => ({
                            ...current,
                            [item.productId]: { ...draft, promoEndsAt: event.target.value },
                          }))}
                        />
                        <Input
                          aria-label="Promo label"
                          value={draft.promoLabel ?? ""}
                          onChange={(event) => setInventoryDrafts((current) => ({
                            ...current,
                            [item.productId]: { ...draft, promoLabel: event.target.value },
                          }))}
                        />
                      </div>
                      <Input
                        value={draft.imageUrl ?? ""}
                        onChange={(event) => setInventoryDrafts((current) => ({
                          ...current,
                          [item.productId]: { ...draft, imageUrl: event.target.value },
                        }))}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Dajem Homes Listings & Approvals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
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
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) readImageFile(file, (imageUrl) => setPropertyDraft((current) => ({ ...current, imageUrl })));
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
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dajem Orbital Services & Requests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
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
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) readImageFile(file, (imageUrl) => setServiceDraft((current) => ({ ...current, imageUrl })));
                  }}
                />
              </div>
              <Button type="submit" disabled={isBusy} className="w-full bg-cyan-600 text-white hover:bg-cyan-700">
                Save Survey Service
              </Button>
            </form>

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
                  onClick={() => setServiceDraft(service)}
                >
                  Edit in Form
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
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
        </Card>

        <Card>
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
                      <p className="font-semibold text-foreground">{bid.propertyTitle}</p>
                      <p className="text-xs text-muted-foreground">{bid.userName} - {bid.userEmail}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatCurrency(bid.bidAmount)} against {formatCurrency(bid.propertyPrice)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="secondary" disabled={isBusy} onClick={() => void updateBidStatus(bid.id, "Connected")}>
                        Connect
                      </Button>
                      <Button size="sm" variant="destructive" disabled={isBusy} onClick={() => void updateBidStatus(bid.id, "Rejected")}>
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
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
      </Card>
    </div>
  );
}
