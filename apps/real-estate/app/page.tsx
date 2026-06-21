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
  useDajem,
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

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  type: "buy" | "rent";
  category: "apartment" | "house" | "land" | "office" | "villa";
  beds?: number;
  baths?: number;
  size: number;
  featured: boolean;
  imageBg: string;
  summary: string;
  highlights: string[];
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

const properties: Property[] = [
  {
    id: "prop-01",
    title: "Dajem Oakwood Villa",
    location: "Maitama District, Abuja",
    price: 280000000,
    type: "buy",
    category: "villa",
    beds: 5,
    baths: 6,
    size: 480,
    featured: true,
    imageBg: "from-blue-600/20 to-emerald-500/10 dark:from-blue-950 dark:to-emerald-950/20",
    summary: "A signature luxury villa with embassy-grade neighborhood security, integrated home automation, and landscaped entertainment zones.",
    highlights: ["C of O verified", "Smart home controls", "Private cinema room"],
  },
  {
    id: "prop-02",
    title: "Luxury 3-Bedroom Penthouse",
    location: "Wuse II, Abuja",
    price: 18000000,
    type: "rent",
    category: "apartment",
    beds: 3,
    baths: 4,
    size: 220,
    featured: true,
    imageBg: "from-slate-600/20 to-teal-500/10 dark:from-slate-950 dark:to-teal-950/20",
    summary: "High-rise executive penthouse with skyline views, concierge service, and direct elevator access.",
    highlights: ["Rooftop lounge", "Serviced access", "2-year lease options"],
  },
  {
    id: "prop-03",
    title: "Premium Commercial Office Suite",
    location: "Central Business District, Abuja",
    price: 450000000,
    type: "buy",
    category: "office",
    size: 650,
    featured: false,
    imageBg: "from-cyan-600/20 to-indigo-500/10 dark:from-cyan-950 dark:to-indigo-950/20",
    summary: "Flexible floor plate designed for finance, legal, or technology operations with ample parking and title clarity.",
    highlights: ["Generator-backed", "CBD frontage", "Corporate signage rights"],
  },
  {
    id: "prop-04",
    title: "Development Land Plot (Serviced)",
    location: "Gwarinpa, Abuja",
    price: 85000000,
    type: "buy",
    category: "land",
    size: 1200,
    featured: false,
    imageBg: "from-yellow-600/20 to-amber-500/10 dark:from-yellow-950 dark:to-amber-950/20",
    summary: "Serviced land with road access, drainage, and utilities already positioned for a fast development cycle.",
    highlights: ["Beaconed boundary", "Road access", "Survey package available"],
  },
  {
    id: "prop-05",
    title: "4-Bedroom Smart Terrace House",
    location: "Asokoro, Abuja",
    price: 165000000,
    type: "buy",
    category: "house",
    beds: 4,
    baths: 5,
    size: 310,
    featured: true,
    imageBg: "from-purple-600/20 to-pink-500/10 dark:from-purple-950 dark:to-pink-950/20",
    summary: "Elegant family residence with integrated automation, guarded estate access, and premium finishing throughout.",
    highlights: ["Solar-assisted power", "Private study", "Title reviewed"],
  },
  {
    id: "prop-06",
    title: "Executive 2-Bedroom Apartment",
    location: "Jabi, Abuja",
    price: 6500000,
    type: "rent",
    category: "apartment",
    beds: 2,
    baths: 2,
    size: 140,
    featured: false,
    imageBg: "from-emerald-600/20 to-emerald-500/10 dark:from-emerald-950 dark:to-emerald-950/20",
    summary: "Modern apartment close to transport corridors, built for young professionals who want premium access and privacy.",
    highlights: ["Secure parking", "Open-plan kitchen", "Annual and biannual payment options"],
  },
];

export default function RealEstatePage() {
  const { currentUser, isBusy, openAuthModal, requireAuth, submitBid } = useDajem();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedType, setSelectedType] = React.useState<string>("all");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [selectedPrice, setSelectedPrice] = React.useState<string>("all");
  const [activeProperty, setActiveProperty] = React.useState<Property | null>(null);
  const [bidSuccess, setBidSuccess] = React.useState(false);
  const [listSubmitted, setListSubmitted] = React.useState(false);
  const [bidForm, setBidForm] = React.useState({ amount: "", notes: "" });

  const filteredProperties = properties.filter((property) => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase())
      || property.location.toLowerCase().includes(searchTerm.toLowerCase());
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

  return (
    <div className="flex min-h-screen flex-col">
      <Header activeApp="real-estate" />

      <main className="flex-1">
        <section className="relative overflow-hidden py-24 bg-gradient-to-br from-emerald-500/10 via-transparent to-background">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px] -z-10" />
          <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-primary/5 blur-3xl -z-10" />

          <div className="container mx-auto max-w-6xl px-4 text-center space-y-6">
            <Badge variant="secondary" className="bg-emerald-100 px-3 py-1 font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
              Premium Property Brokerage
            </Badge>
            <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-primary dark:text-foreground sm:text-5xl">
              Property sheets, shared bidding, and admin-side deal tracking
            </h1>
            <p className="mx-auto max-w-2xl text-base text-muted-foreground">
              Dajem Real Estate now feeds a shared bidding workflow. Open a property sheet, place your bid, and track it from the unified dashboard.
            </p>
            <div className="flex justify-center gap-4 pt-4">
              <Button size="lg" className="bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => document.getElementById("listings")?.scrollIntoView({ behavior: "smooth" })}>
                Browse Listings
              </Button>
              <Button size="lg" variant="outline" onClick={() => document.getElementById("submit-property")?.scrollIntoView({ behavior: "smooth" })}>
                List Your Property
              </Button>
            </div>
          </div>
        </section>

        <section id="listings" className="container mx-auto max-w-6xl px-4 py-20">
          <div className="mb-12 text-center">
            <Badge variant="secondary" className="mb-2">Property Catalog</Badge>
            <h2 className="text-3xl font-bold text-primary dark:text-foreground">Available Properties</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Filter listings, inspect the full sheet, and submit a bid from one workflow.
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
                    placeholder="Search Maitama, Penthouse, villa..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />
                </div>
              </div>
              <Select
                label="Listing Type"
                value={selectedType}
                onChange={(event) => setSelectedType(event.target.value)}
                options={[
                  { value: "all", label: "Buy & Rent" },
                  { value: "buy", label: "For Sale" },
                  { value: "rent", label: "For Rent" },
                ]}
              />
              <Select
                label="Property Category"
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
                options={[
                  { value: "all", label: "All Categories" },
                  { value: "villa", label: "Villas" },
                  { value: "apartment", label: "Apartments" },
                  { value: "house", label: "Houses" },
                  { value: "office", label: "Office Spaces" },
                  { value: "land", label: "Lands" },
                ]}
              />
              <Select
                label="Price Range"
                value={selectedPrice}
                onChange={(event) => setSelectedPrice(event.target.value)}
                options={[
                  { value: "all", label: "Any Price" },
                  { value: "under-10m", label: "Under ₦10M" },
                  { value: "10m-50m", label: "₦10M - ₦50M" },
                  { value: "50m-150m", label: "₦50M - ₦150M" },
                  { value: "150m-plus", label: "₦150M+" },
                ]}
              />
            </div>
          </Card>

          {filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredProperties.map((property) => (
                <Card key={property.id} className="group relative flex h-full flex-col overflow-hidden transition-all duration-300 hover:shadow-lg">
                  <div className={`flex h-56 flex-col justify-between rounded-t-xl border-b bg-gradient-to-br p-4 ${property.imageBg}`}>
                    <div className="flex items-center justify-between">
                      <Badge variant="default" className={property.type === "buy" ? "bg-primary text-white" : "bg-emerald-600 text-white"}>
                        {property.type === "buy" ? "For Sale" : "For Rent"}
                      </Badge>
                      {property.featured && (
                        <Badge className="border-transparent bg-amber-500 text-white hover:bg-amber-600">
                          Featured
                        </Badge>
                      )}
                    </div>
                    <div className="flex w-max items-center gap-1.5 rounded-full bg-background/80 px-2.5 py-1 text-xs font-semibold text-foreground shadow-sm backdrop-blur-sm">
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
                      {property.type === "rent" && <span className="text-sm font-normal text-muted-foreground"> / year</span>}
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
              <p className="text-muted-foreground">No properties match your active search terms or filters.</p>
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
                <h3 className="text-2xl font-bold text-primary dark:text-foreground">Submit Property for Brokerage</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Looking to list a luxury villa, commercial building, or land? Submit the preliminary specifications here.
                </p>
              </div>

              <form onSubmit={(event) => { event.preventDefault(); setListSubmitted(true); }} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="p-title">Property Title</Label>
                    <Input id="p-title" required placeholder="e.g. Luxury 4-Bedroom Duplex" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="p-loc">Exact Location</Label>
                    <Input id="p-loc" required placeholder="e.g. Maitama, Abuja" />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Select
                    label="Listing Purpose"
                    options={[
                      { value: "sale", label: "For Sale" },
                      { value: "rent", label: "For Rent" },
                    ]}
                  />
                  <Select
                    label="Property Type"
                    options={[
                      { value: "apartment", label: "Apartment" },
                      { value: "villa", label: "Villa / Duplex" },
                      { value: "land", label: "Land Plot" },
                      { value: "office", label: "Office Space" },
                    ]}
                  />
                  <div className="space-y-1.5">
                    <Label htmlFor="p-price">Expected Price (₦)</Label>
                    <Input id="p-price" type="number" required placeholder="e.g. 150000000" />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="owner-name">Your Full Name</Label>
                    <Input id="owner-name" required placeholder="e.g. Chief Johnson" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="owner-email">Contact Email</Label>
                    <Input id="owner-email" type="email" required placeholder="johnson@example.com" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="p-desc">Property Description & Title Documents</Label>
                  <Textarea id="p-desc" required rows={4} placeholder="Describe infrastructure, size in sqm, title deeds held (C of O, R of O etc)..." />
                </div>
                <Button type="submit" className="w-full bg-emerald-600 font-semibold text-white hover:bg-emerald-700">
                  Submit Listing Proposal
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
            <div className={`rounded-2xl border bg-gradient-to-br p-6 ${activeProperty.imageBg}`}>
              <div className="mb-4 flex items-center justify-between">
                <Badge variant="default" className={activeProperty.type === "buy" ? "bg-primary text-white" : "bg-emerald-600 text-white"}>
                  {activeProperty.type === "buy" ? "For Sale" : "For Rent"}
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
                <p className="mb-4">Sign in to send a tracked bid for this property and follow the status from your dashboard.</p>
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
                  <Label htmlFor="bid-amount">Bid Amount (₦)</Label>
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
                    placeholder="Preferred inspection date, title questions, financing notes..."
                    value={bidForm.notes}
                    onChange={(event) => setBidForm((current) => ({ ...current, notes: event.target.value }))}
                  />
                </div>
                <Button type="submit" className="w-full bg-emerald-600 text-white hover:bg-emerald-700" disabled={isBusy}>
                  Submit Bid to Shared Dashboard
                </Button>
              </form>
            )}
          </div>
        )}
      </Sheet>

      <Dialog isOpen={bidSuccess} onClose={() => setBidSuccess(false)} title="Bid Submitted">
        <div className="space-y-4 py-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/50">
            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-foreground">Bid logged successfully</p>
            <p className="text-sm text-muted-foreground">
              Your offer is now visible in both the shared dashboard and the admin review queue.
            </p>
          </div>
          <Button className="bg-primary text-white" onClick={() => setBidSuccess(false)}>
            Close
          </Button>
        </div>
      </Dialog>

      <Dialog isOpen={listSubmitted} onClose={() => setListSubmitted(false)} title="Property Submission Received">
        <div className="space-y-4 py-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/50">
            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-foreground">Proposal received</p>
            <p className="text-sm text-muted-foreground">
              Your property details have been logged. Our compliance team will contact you to schedule inspection.
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
