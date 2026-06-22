"use client";

import React from "react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  Footer,
  Header,
  Input,
  Label,
  Select,
  Sheet,
  Textarea,
  dajemCompanyProfiles,
  useDajem,
  type PropertyCategory,
  type PropertyListing,
  type PropertyType,
} from "@repo/ui";
import {
  Bath,
  BedDouble,
  Building,
  CheckCircle2,
  MapPin,
  Maximize,
  Search,
  ShieldCheck,
  Tag,
} from "lucide-react";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

const propertyTypeOptions: { value: PropertyType | "all"; label: string }[] = [
  { value: "all", label: "All Listings" },
  { value: "sale", label: "For Sale" },
  { value: "short-let", label: "Short-Let" },
  { value: "hotel", label: "Hotel / Suite" },
  { value: "management", label: "Management" },
];

const propertyCategoryOptions: { value: PropertyCategory | "all"; label: string }[] = [
  { value: "all", label: "All Categories" },
  { value: "apartment", label: "Apartment" },
  { value: "suite", label: "Suite" },
  { value: "hotel", label: "Hotel" },
  { value: "land", label: "Land" },
  { value: "commercial", label: "Commercial" },
  { value: "short-let", label: "Short-Let" },
];

function propertyTypeLabel(type: PropertyType) {
  return propertyTypeOptions.find((entry) => entry.value === type)?.label ?? type;
}

export default function RealEstatePage() {
  const profile = dajemCompanyProfiles["real-estate"];
  const {
    currentUser,
    isBusy,
    openAuthModal,
    requireAuth,
    snapshot,
    submitBid,
    submitPropertyListing,
  } = useDajem();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedType, setSelectedType] = React.useState<PropertyType | "all">("all");
  const [selectedCategory, setSelectedCategory] = React.useState<PropertyCategory | "all">("all");
  const [selectedPrice, setSelectedPrice] = React.useState<string>("all");
  const [activeProperty, setActiveProperty] = React.useState<PropertyListing | null>(null);
  const [bidSuccess, setBidSuccess] = React.useState(false);
  const [listSubmitted, setListSubmitted] = React.useState(false);
  const [bidForm, setBidForm] = React.useState({ amount: "", notes: "" });
  const [listingForm, setListingForm] = React.useState({
    title: "",
    location: "",
    type: "short-let" as PropertyType,
    category: "short-let" as PropertyCategory,
    price: "",
    size: "",
    beds: "",
    baths: "",
    summary: "",
    highlights: "",
    imageUrl: "",
  });

  const approvedProperties = snapshot.propertyListings.filter((property) => property.status === "Approved");
  const filteredProperties = approvedProperties.filter((property) => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase())
      || property.location.toLowerCase().includes(searchTerm.toLowerCase())
      || property.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || property.type === selectedType;
    const matchesCategory = selectedCategory === "all" || property.category === selectedCategory;

    let matchesPrice = true;
    if (selectedPrice !== "all") {
      if (selectedPrice === "under-10m") matchesPrice = property.price < 10000000;
      if (selectedPrice === "10m-50m") matchesPrice = property.price >= 10000000 && property.price <= 50000000;
      if (selectedPrice === "50m-150m") matchesPrice = property.price >= 50000000 && property.price <= 150000000;
      if (selectedPrice === "150m-plus") matchesPrice = property.price > 150000000;
    }

    return matchesSearch && matchesType && matchesCategory && matchesPrice;
  });

  const handleBidSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!activeProperty) return;
    if (!requireAuth("login")) return;

    await submitBid({
      propertyId: activeProperty.id,
      propertyTitle: activeProperty.title,
      propertyLocation: activeProperty.location,
      propertyPrice: activeProperty.price,
      bidAmount: Number(bidForm.amount),
      notes: bidForm.notes,
    });

    setActiveProperty(null);
    setBidSuccess(true);
    setBidForm({ amount: "", notes: "" });
  };

  const handleListingSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!requireAuth("signup")) return;

    await submitPropertyListing({
      title: listingForm.title,
      location: listingForm.location,
      type: listingForm.type,
      category: listingForm.category,
      price: Number(listingForm.price),
      size: Number(listingForm.size),
      beds: listingForm.beds ? Number(listingForm.beds) : undefined,
      baths: listingForm.baths ? Number(listingForm.baths) : undefined,
      summary: listingForm.summary,
      highlights: listingForm.highlights.split(",").map((item) => item.trim()).filter(Boolean),
      imageUrl: listingForm.imageUrl || undefined,
    });

    setListSubmitted(true);
    setListingForm({
      title: "",
      location: "",
      type: "short-let",
      category: "short-let",
      price: "",
      size: "",
      beds: "",
      baths: "",
      summary: "",
      highlights: "",
      imageUrl: "",
    });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header activeApp="real-estate" />

      <main className="flex-1">
        <section
          className="relative overflow-hidden bg-cover bg-center py-24"
          style={{
            backgroundImage: "linear-gradient(135deg, rgba(240,253,250,.92), rgba(240,253,250,.76), rgba(255,255,255,.96)), url('/images/homes-hero.svg')",
          }}
        >
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#064e3b12_1px,transparent_1px),linear-gradient(to_bottom,#064e3b12_1px,transparent_1px)] bg-[size:32px_32px] -z-10" />

          <div className="container mx-auto max-w-6xl px-4 text-center space-y-6">
            <Badge variant="secondary" className="bg-emerald-100 px-3 py-1 font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
              {profile.registrationNumber} - Started {profile.startDate}
            </Badge>
            <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-primary dark:text-foreground sm:text-5xl">
              {profile.displayName}: Homes, Hospitality, Development, and Property Management
            </h1>
            <p className="mx-auto max-w-3xl text-base text-muted-foreground">
              {profile.summary}
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Button size="lg" className="bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => document.getElementById("listings")?.scrollIntoView({ behavior: "smooth" })}>
                Browse Listings
              </Button>
              <Button size="lg" variant="outline" onClick={() => document.getElementById("submit-property")?.scrollIntoView({ behavior: "smooth" })}>
                Submit Property
              </Button>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-muted/20 py-12">
          <div className="container mx-auto grid max-w-6xl gap-4 px-4 md:grid-cols-3">
            <div className="rounded-xl border bg-card p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Office</p>
              <p className="mt-2 text-sm text-foreground">{profile.address}</p>
            </div>
            <div className="rounded-xl border bg-card p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</p>
              <p className="mt-2 text-sm text-foreground">{profile.email}</p>
            </div>
            <div className="rounded-xl border bg-card p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Focus</p>
              <p className="mt-2 text-sm text-foreground">Short-let, hospitality, development, sales, marketing, consultancy, and property management.</p>
            </div>
          </div>
        </section>

        <section id="listings" className="container mx-auto max-w-6xl px-4 py-20">
          <div className="mb-12 text-center">
            <Badge variant="secondary" className="mb-2">Dajem Homes Catalog</Badge>
            <h2 className="text-3xl font-bold text-primary dark:text-foreground">Approved Properties & Hospitality Offers</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Public listings are approved from the unified admin portal before they appear here.
            </p>
          </div>

          <Card className="mb-10 border bg-card/60 p-6 backdrop-blur-sm">
            <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div className="space-y-1.5 lg:col-span-2">
                <Label htmlFor="search">Search Keywords</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
                  <Input
                    id="search"
                    placeholder="Search short-let, Enugu, suite..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />
                </div>
              </div>
              <Select
                label="Listing Type"
                value={selectedType}
                onChange={(event) => setSelectedType(event.target.value as PropertyType | "all")}
                options={propertyTypeOptions}
              />
              <Select
                label="Category"
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value as PropertyCategory | "all")}
                options={propertyCategoryOptions}
              />
              <Select
                label="Price Range"
                value={selectedPrice}
                onChange={(event) => setSelectedPrice(event.target.value)}
                options={[
                  { value: "all", label: "Any Price" },
                  { value: "under-10m", label: "Under NGN 10M" },
                  { value: "10m-50m", label: "NGN 10M - NGN 50M" },
                  { value: "50m-150m", label: "NGN 50M - NGN 150M" },
                  { value: "150m-plus", label: "NGN 150M+" },
                ]}
              />
            </div>
          </Card>

          {filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredProperties.map((property) => (
                <Card key={property.id} className="group relative flex h-full flex-col overflow-hidden transition-all duration-300 hover:shadow-lg">
                  <div
                    className={`flex h-56 flex-col justify-between rounded-t-xl border-b bg-gradient-to-br bg-cover bg-center p-4 ${property.imageBg}`}
                    style={property.imageUrl ? { backgroundImage: `linear-gradient(135deg, rgba(15,23,42,.28), rgba(4,120,87,.18)), url(${property.imageUrl})` } : undefined}
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant="default" className={property.type === "sale" ? "bg-primary text-white" : "bg-emerald-600 text-white"}>
                        {propertyTypeLabel(property.type)}
                      </Badge>
                      {property.featured && (
                        <Badge className="border-transparent bg-amber-500 text-white hover:bg-amber-600">
                          Featured
                        </Badge>
                      )}
                    </div>
                    <div className="flex w-max items-center gap-1.5 rounded-full bg-background/85 px-2.5 py-1 text-xs font-semibold text-foreground shadow-sm backdrop-blur-sm">
                      <Tag className="h-3 w-3 text-emerald-500" />
                      <span className="capitalize">{property.category}</span>
                    </div>
                  </div>

                  <CardHeader className="flex-1 p-5">
                    <CardTitle className="line-clamp-1 text-xl font-bold tracking-tight">{property.title}</CardTitle>
                    <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      <span className="line-clamp-1">{property.location}</span>
                    </div>
                  </CardHeader>

                  <CardContent className="px-5 pb-4 pt-0">
                    <p className="mb-4 text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(property.price)}
                      {(property.type === "short-let" || property.type === "hotel") && <span className="text-sm font-normal text-muted-foreground"> / night from</span>}
                    </p>
                    <div className="grid grid-cols-3 gap-2 border-t pt-3 text-xs font-semibold text-muted-foreground">
                      {property.beds !== undefined && (
                        <div className="flex items-center gap-1">
                          <BedDouble className="h-4 w-4 shrink-0 text-emerald-500" />
                          <span>{property.beds} Beds</span>
                        </div>
                      )}
                      {property.baths !== undefined && (
                        <div className="flex items-center gap-1">
                          <Bath className="h-4 w-4 shrink-0 text-emerald-500" />
                          <span>{property.baths} Baths</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Maximize className="h-4 w-4 shrink-0 text-emerald-500" />
                        <span>{property.size} sqm</span>
                      </div>
                    </div>
                  </CardContent>

                  <div className="border-t border-border/50 p-5">
                    <Button
                      className="w-full bg-primary font-semibold text-white hover:bg-primary/95"
                      onClick={() => {
                        setActiveProperty(property);
                        setBidForm({ amount: String(property.price), notes: "" });
                      }}
                    >
                      View Details & Submit Bid
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border bg-card py-20 text-center">
              <p className="text-muted-foreground">No approved listings match your active search terms or filters.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedType("all");
                  setSelectedCategory("all");
                  setSelectedPrice("all");
                }}
              >
                Clear Search Filters
              </Button>
            </div>
          )}
        </section>

        <section id="submit-property" className="border-t border-border bg-muted/20 py-20">
          <div className="container mx-auto max-w-4xl px-4">
            <Card className="border bg-card p-8 shadow-xl">
              <div className="mx-auto mb-8 max-w-2xl text-center">
                <Badge variant="secondary" className="mb-2">Owners & Agents</Badge>
                <h3 className="text-2xl font-bold text-primary dark:text-foreground">Submit Property for Approval</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Submit short-let, suite, hotel, development, sale, or management opportunities. They remain pending until admin approves them.
                </p>
              </div>

              {!currentUser && (
                <div className="mb-5 rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                  <p className="mb-3">Sign in first so your property submission can be tracked and approval notifications can be prepared.</p>
                  <div className="flex flex-wrap gap-3">
                    <Button type="button" onClick={() => openAuthModal("login")}>Login</Button>
                    <Button type="button" variant="outline" onClick={() => openAuthModal("signup")}>
                      Create account
                    </Button>
                  </div>
                </div>
              )}

              <form onSubmit={handleListingSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="p-title">Property Title</Label>
                    <Input id="p-title" required placeholder="e.g. Furnished 2-Bedroom Short-Let" value={listingForm.title} onChange={(event) => setListingForm((current) => ({ ...current, title: event.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="p-loc">Exact Location</Label>
                    <Input id="p-loc" required placeholder="e.g. GRA, Enugu" value={listingForm.location} onChange={(event) => setListingForm((current) => ({ ...current, location: event.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                  <Select label="Listing Type" value={listingForm.type} onChange={(event) => setListingForm((current) => ({ ...current, type: event.target.value as PropertyType }))} options={propertyTypeOptions.filter((item) => item.value !== "all")} />
                  <Select label="Category" value={listingForm.category} onChange={(event) => setListingForm((current) => ({ ...current, category: event.target.value as PropertyCategory }))} options={propertyCategoryOptions.filter((item) => item.value !== "all")} />
                  <div className="space-y-1.5">
                    <Label htmlFor="p-price">Expected Price</Label>
                    <Input id="p-price" type="number" required placeholder="e.g. 85000" value={listingForm.price} onChange={(event) => setListingForm((current) => ({ ...current, price: event.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="p-size">Size (sqm)</Label>
                    <Input id="p-size" type="number" required placeholder="e.g. 120" value={listingForm.size} onChange={(event) => setListingForm((current) => ({ ...current, size: event.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="p-beds">Beds</Label>
                    <Input id="p-beds" type="number" placeholder="Optional" value={listingForm.beds} onChange={(event) => setListingForm((current) => ({ ...current, beds: event.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="p-baths">Baths</Label>
                    <Input id="p-baths" type="number" placeholder="Optional" value={listingForm.baths} onChange={(event) => setListingForm((current) => ({ ...current, baths: event.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="p-image">Image URL</Label>
                    <Input id="p-image" placeholder="Optional image URL" value={listingForm.imageUrl} onChange={(event) => setListingForm((current) => ({ ...current, imageUrl: event.target.value }))} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="p-desc">Property Description</Label>
                  <Textarea id="p-desc" required rows={4} placeholder="Describe the property, amenities, title documents, management requirements, or hospitality use..." value={listingForm.summary} onChange={(event) => setListingForm((current) => ({ ...current, summary: event.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="p-highlights">Highlights</Label>
                  <Input id="p-highlights" placeholder="Separate with commas, e.g. Serviced, Secure parking, Daily cleaning" value={listingForm.highlights} onChange={(event) => setListingForm((current) => ({ ...current, highlights: event.target.value }))} />
                </div>
                <Button type="submit" className="w-full bg-emerald-600 font-semibold text-white hover:bg-emerald-700" disabled={isBusy}>
                  Submit for Pending Approval
                </Button>
              </form>
            </Card>
          </div>
        </section>
      </main>

      <Footer />

      <Sheet isOpen={activeProperty !== null} onClose={() => setActiveProperty(null)} title={activeProperty?.title ?? "Property Detail"} widthClassName="max-w-2xl">
        {activeProperty && (
          <div className="space-y-6">
            <div
              className={`rounded-2xl border bg-gradient-to-br bg-cover bg-center p-6 ${activeProperty.imageBg}`}
              style={activeProperty.imageUrl ? { backgroundImage: `linear-gradient(135deg, rgba(255,255,255,.76), rgba(255,255,255,.52)), url(${activeProperty.imageUrl})` } : undefined}
            >
              <div className="mb-4 flex items-center justify-between">
                <Badge variant="default" className={activeProperty.type === "sale" ? "bg-primary text-white" : "bg-emerald-600 text-white"}>
                  {propertyTypeLabel(activeProperty.type)}
                </Badge>
                {activeProperty.featured && <Badge className="bg-amber-500 text-white">Featured</Badge>}
              </div>
              <p className="text-3xl font-extrabold text-primary dark:text-foreground">
                {formatCurrency(activeProperty.price)}
              </p>
              <p className="mt-3 text-sm text-muted-foreground">{activeProperty.summary}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border p-4 text-sm">
                <p className="font-semibold text-foreground">Location</p>
                <p className="mt-1 text-muted-foreground">{activeProperty.location}</p>
              </div>
              <div className="rounded-xl border p-4 text-sm">
                <p className="font-semibold text-foreground">Size</p>
                <p className="mt-1 text-muted-foreground">{activeProperty.size} sqm</p>
              </div>
              <div className="rounded-xl border p-4 text-sm">
                <p className="font-semibold text-foreground">Category</p>
                <p className="mt-1 capitalize text-muted-foreground">{activeProperty.category}</p>
              </div>
            </div>

            <div className="rounded-xl border p-5">
              <div className="mb-3 flex items-center gap-2 font-semibold text-foreground">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Deal highlights
              </div>
              <div className="flex flex-wrap gap-2">
                {activeProperty.highlights.map((highlight) => (
                  <Badge key={highlight} variant="secondary">
                    {highlight}
                  </Badge>
                ))}
              </div>
            </div>

            {!currentUser ? (
              <div className="rounded-xl border border-dashed p-5 text-sm text-muted-foreground">
                <p className="mb-4">Sign in to send a tracked bid and follow the status from your dashboard.</p>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => openAuthModal("login")}>Login</Button>
                  <Button variant="outline" onClick={() => openAuthModal("signup")}>
                    Create account
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleBidSubmit} className="space-y-4 rounded-xl border p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Building className="h-4 w-4 text-emerald-500" />
                  Submit tracked bid
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bid-amount">Bid Amount</Label>
                  <Input
                    id="bid-amount"
                    type="number"
                    required
                    min={1}
                    value={bidForm.amount}
                    onChange={(event) => setBidForm((current) => ({ ...current, amount: event.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bid-notes">Notes for the deal desk</Label>
                  <Textarea
                    id="bid-notes"
                    rows={4}
                    placeholder="Preferred inspection date, title questions, hospitality notes, or management requirements..."
                    value={bidForm.notes}
                    onChange={(event) => setBidForm((current) => ({ ...current, notes: event.target.value }))}
                  />
                </div>
                <Button type="submit" className="w-full bg-emerald-600 text-white hover:bg-emerald-700" disabled={isBusy}>
                  Submit Bid for Review
                </Button>
              </form>
            )}
          </div>
        )}
      </Sheet>

      <Dialog isOpen={bidSuccess} onClose={() => setBidSuccess(false)} title="Bid Pending Approval">
        <div className="space-y-4 py-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/50">
            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-foreground">Bid logged successfully</p>
            <p className="text-sm text-muted-foreground">
              Your offer is now marked as pending approval. An email preview has been saved in your dashboard while real email delivery is prepared later.
            </p>
          </div>
          <Button className="bg-primary text-white" onClick={() => setBidSuccess(false)}>
            Close
          </Button>
        </div>
      </Dialog>

      <Dialog isOpen={listSubmitted} onClose={() => setListSubmitted(false)} title="Property Pending Approval">
        <div className="space-y-4 py-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/50">
            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-foreground">Submission received</p>
            <p className="text-sm text-muted-foreground">
              Your property has been saved as pending approval. Admin can approve it from the unified admin page, and an email preview has been logged for later delivery.
            </p>
          </div>
          <Button className="bg-primary text-white" onClick={() => setListSubmitted(false)}>
            Close
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
