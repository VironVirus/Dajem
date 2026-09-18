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
  HeroSlideshow,
  Input,
  Label,
  SubsidiaryNav,
  SubsidiaryPageIntro,
  SubsidiaryRouteGrid,
  TrustRibbon,
  Select,
  Sheet,
  Textarea,
  dajemCompanyProfiles,
  useDajem,
  type PropertyCategory,
  type HomesListingGroup,
  type PropertyListing,
  type PropertyType,
  type ResidenceType,
} from "@repo/ui";
import {
  Bath,
  BedDouble,
  Building,
  CheckCircle2,
  ClipboardList,
  Home,
  LayoutDashboard,
  ListFilter,
  MapPin,
  Maximize,
  Search,
  ShieldCheck,
  Tag,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

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

const homesGroupOptions: { value: HomesListingGroup; label: string; type: PropertyType; category: PropertyCategory }[] = [
  { value: "land-sale", label: "Lands for Sale", type: "sale", category: "land" },
  { value: "land-lease", label: "Lands for Lease", type: "management", category: "land" },
  { value: "house-rent", label: "House for Rent / Lease", type: "management", category: "apartment" },
  { value: "house-sale", label: "House for Sale", type: "sale", category: "apartment" },
  { value: "short-let", label: "Short-let Apartments", type: "short-let", category: "short-let" },
];

const residenceOptions: { value: ResidenceType; label: string }[] = [
  { value: "self-contain", label: "Self contain" },
  { value: "one-bedroom", label: "One bedroom" },
  { value: "two-bedroom", label: "Two bedroom" },
  { value: "three-bedroom", label: "Three bedroom" },
  { value: "single-room", label: "Single room" },
  { value: "bungalow", label: "Bungalow" },
  { value: "duplex", label: "Duplex" },
];

function propertyTypeLabel(type: PropertyType) {
  return propertyTypeOptions.find((entry) => entry.value === type)?.label ?? type;
}

function propertyGroupLabel(group: HomesListingGroup | undefined, type: PropertyType) {
  return homesGroupOptions.find((entry) => entry.value === group)?.label ?? propertyTypeLabel(type);
}

const homesNavItems = [
  { href: "/properties", label: "Home", icon: Home },
  { href: "/properties/listings", label: "Listings", icon: ListFilter },
  { href: "/properties/submit", label: "Submit", icon: ClipboardList },
];

const homesPageMeta = {
  listings: {
    eyebrow: "Property discovery",
    title: "Approved homes, land, short-lets, and hospitality",
    description: "Search listings, compare prices, and submit a bid.",
  },
  submit: {
    eyebrow: "Owner and agent desk",
    title: "Submit a property for verification and approval",
    description: "Add the property details for verification and approval.",
  },
} as const;

export default function RealEstatePage() {
  const pathname = usePathname();
  const router = useRouter();
  const pageView = pathname === "/properties/listings" ? "listings" : pathname === "/properties/submit" ? "submit" : "home";
  const activePageMeta = pageView === "home" ? null : homesPageMeta[pageView];
  const profile = dajemCompanyProfiles["real-estate"];
  const {
    currentUser,
    isBusy,
    openAuthModal,
    requireAuth,
    snapshot,
    submitBid,
    submitPropertyListing,
    submitPropertyListingPaymentProof,
    startPaymentCheckout,
  } = useDajem();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedType, setSelectedType] = React.useState<PropertyType | "all">("all");
  const [selectedCategory, setSelectedCategory] = React.useState<PropertyCategory | "all">("all");
  const [selectedGroup, setSelectedGroup] = React.useState<HomesListingGroup | "all">("all");
  const [selectedPrice, setSelectedPrice] = React.useState<string>("all");
  const [activeProperty, setActiveProperty] = React.useState<PropertyListing | null>(null);
  const [bidSuccess, setBidSuccess] = React.useState(false);
  const [listSubmitted, setListSubmitted] = React.useState(false);
  const [pendingListing, setPendingListing] = React.useState<PropertyListing | null>(null);
  const [listingPaymentError, setListingPaymentError] = React.useState<string | null>(null);
  const [listingProofPath, setListingProofPath] = React.useState("");
  const [bidForm, setBidForm] = React.useState({ amount: "", notes: "" });
  const [listingForm, setListingForm] = React.useState({
    title: "",
    location: "",
    type: "short-let" as PropertyType,
    category: "short-let" as PropertyCategory,
    listingGroup: "short-let" as HomesListingGroup,
    residenceType: "one-bedroom" as ResidenceType,
    price: "",
    size: "",
    beds: "",
    baths: "",
    summary: "",
    highlights: "",
    imageUrl: "",
    agentCompany: "",
    requestContactPublication: true,
  });

  const approvedProperties = snapshot.propertyListings.filter((property) => property.status === "Approved");
  const filteredProperties = approvedProperties.filter((property) => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase())
      || property.location.toLowerCase().includes(searchTerm.toLowerCase())
      || property.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || property.type === selectedType;
    const matchesCategory = selectedCategory === "all" || property.category === selectedCategory;
    const matchesGroup = selectedGroup === "all" || property.listingGroup === selectedGroup;

    let matchesPrice = true;
    if (selectedPrice !== "all") {
      if (selectedPrice === "under-10m") matchesPrice = property.price < 10000000;
      if (selectedPrice === "10m-50m") matchesPrice = property.price >= 10000000 && property.price <= 50000000;
      if (selectedPrice === "50m-150m") matchesPrice = property.price >= 50000000 && property.price <= 150000000;
      if (selectedPrice === "150m-plus") matchesPrice = property.price > 150000000;
    }

    return matchesSearch && matchesType && matchesCategory && matchesGroup && matchesPrice;
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

    const result = await submitPropertyListing({
      title: listingForm.title,
      location: listingForm.location,
      type: listingForm.type,
      category: listingForm.category,
      listingGroup: listingForm.listingGroup,
      residenceType: listingForm.listingGroup === "land-sale" || listingForm.listingGroup === "land-lease" ? undefined : listingForm.residenceType,
      price: Number(listingForm.price),
      size: Number(listingForm.size),
      beds: listingForm.beds ? Number(listingForm.beds) : undefined,
      baths: listingForm.baths ? Number(listingForm.baths) : undefined,
      summary: listingForm.summary,
      highlights: listingForm.highlights.split(",").map((item) => item.trim()).filter(Boolean),
      imageUrl: listingForm.imageUrl || undefined,
      agentCompany: listingForm.agentCompany || undefined,
      requestContactPublication: listingForm.requestContactPublication,
    });

    setPendingListing(result.listing ?? null);
    setListSubmitted(!listingForm.requestContactPublication);
    setListingForm({
      title: "",
      location: "",
      type: "short-let",
      category: "short-let",
      listingGroup: "short-let",
      residenceType: "one-bedroom",
      price: "",
      size: "",
      beds: "",
      baths: "",
      summary: "",
      highlights: "",
      imageUrl: "",
      agentCompany: "",
      requestContactPublication: true,
    });
  };

  const uploadPropertyImage = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) throw new Error("Image must be 5MB or less.");
    const formData = new FormData();
    formData.append("scope", "property");
    formData.append("file", file);
    const response = await fetch("/api/storage/images", { method: "POST", credentials: "include", body: formData });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error ?? "Image upload failed.");
    setListingForm((current) => ({ ...current, imageUrl: data.imageUrl }));
  };

  const payListingFee = async () => {
    if (!pendingListing) return;
    setListingPaymentError(null);
    try {
      const result = await startPaymentCheckout("flutterwave", {
        purpose: "property-listing-fee",
        propertyListingId: pendingListing.id,
      });
      if (result.payment?.mode === "redirect" && result.payment.checkoutUrl) {
        window.location.assign(result.payment.checkoutUrl);
        return;
      }
      setPendingListing(null);
      setListSubmitted(true);
      if (result.order) window.location.assign("/dashboard#billing");
    } catch (error) {
      setListingPaymentError(error instanceof Error ? error.message : "Listing fee checkout failed.");
    }
  };

  const uploadListingPaymentProof = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) throw new Error("Payment proof must be 5MB or less.");
    const formData = new FormData();
    formData.append("scope", "property");
    formData.append("file", file);
    const response = await fetch("/api/storage/images", { method: "POST", credentials: "include", body: formData });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error ?? "Payment-proof upload failed.");
    setListingProofPath(String(data.storagePath));
  };

  const submitListingProof = async () => {
    if (!pendingListing || !listingProofPath) return;
    setListingPaymentError(null);
    try {
      await submitPropertyListingPaymentProof(pendingListing.id, listingProofPath);
      setPendingListing(null);
      setListSubmitted(true);
    } catch (error) {
      setListingPaymentError(error instanceof Error ? error.message : "Unable to submit payment proof.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header activeApp="real-estate" />

      <main className="flex-1">
        <SubsidiaryNav label="DAJEM Homes" items={homesNavItems} accent="blue" />

        {activePageMeta && (
          <SubsidiaryPageIntro
            eyebrow={activePageMeta.eyebrow}
            title={activePageMeta.title}
            description={activePageMeta.description}
            accent="blue"
          />
        )}

        {pageView === "home" && (
          <>
        <HeroSlideshow
          className="dajem-mobile-hero flex min-h-[31rem] items-center py-14 sm:min-h-0 sm:py-24"
          overlayClassName="bg-[linear-gradient(135deg,rgba(239,246,255,0.28),rgba(239,246,255,0.5),rgba(255,255,255,0.82))] dark:bg-[linear-gradient(135deg,rgba(30,64,175,0.24),rgba(2,6,23,0.54),rgba(2,6,23,0.84))]"
          slides={[
            { src: "/images/homes-hero-suite-v2.png", position: "center", label: "Verified homes and short-lets", actionLabel: "Browse available properties", href: "/properties/listings" },
            { src: "/images/homes-hero-generated.png", position: "center", label: "Property sales and management", actionLabel: "Submit your property", href: "/properties/submit" },
          ]}
        >
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1d4ed812_1px,transparent_1px),linear-gradient(to_bottom,#1d4ed812_1px,transparent_1px)] bg-[size:32px_32px] -z-10" />

          <div className="container mx-auto max-w-6xl px-5 text-center sm:px-6">
            <div className="dajem-hero-copy-panel mx-auto max-w-4xl space-y-5 rounded-[1.75rem] p-5 sm:space-y-6 sm:p-8">
              <Badge variant="secondary" className="border border-blue-500/20 bg-blue-500/10 px-3 py-1 font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-500/15">
                Started {profile.startDate}
              </Badge>
              <h1 className="text-[2.55rem] font-bold leading-[0.98] sm:text-5xl">
                <span className="dajem-hero-title block">{profile.shortName}</span>
                <span className="mt-3 block text-[1.08rem] font-semibold leading-[1.3] tracking-tight text-slate-800 dark:text-slate-100 sm:text-[1.45rem]">
                  Homes, hospitality, development, and property management
                </span>
              </h1>
              <p className="dajem-hero-lede mx-auto max-w-3xl text-base leading-relaxed">
                Verified homes, short-lets, hospitality, sales, and property management.
              </p>
              <div className="flex flex-col justify-center gap-3 pt-3 sm:flex-row sm:flex-wrap sm:gap-4 sm:pt-4">
                <Button size="lg" className="sheen-glow w-full sm:w-auto rounded-full bg-blue-600 text-white font-semibold shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition-all" onClick={() => router.push("/properties/listings")}>
                  Browse Listings
                </Button>
                <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full border-border/80 bg-background/60 hover:bg-background/90 text-foreground font-semibold shadow-sm backdrop-blur-md transition-all" onClick={() => router.push("/properties/submit")}>
                  Submit Property
                </Button>
              </div>
            </div>
          </div>
        </HeroSlideshow>

        <TrustRibbon companyName={profile.displayName} registrationNumber={profile.registrationNumber} />

        <SubsidiaryRouteGrid
          title="Open the right property workspace"
          accent="blue"
          items={[
            { ...homesNavItems[1], meta: `${approvedProperties.length} approved`, description: "Browse available properties." },
            { ...homesNavItems[2], meta: "Owners and agents", description: "Submit a property for approval." },
            { href: "/dashboard", label: "My Activity", icon: LayoutDashboard, meta: "Shared dashboard", description: "Track bids and submissions." },
            { href: `mailto:${profile.email}`, label: "Property Desk", icon: Building, meta: "Direct contact", description: "Contact DAJEM Homes." },
          ]}
        />

        <section id="contact-details" className="border-y border-border bg-muted/20 py-8 sm:py-12">
          <div className="container mx-auto grid max-w-6xl gap-3 px-5 sm:gap-4 sm:px-6 md:grid-cols-3">
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
              <p className="mt-2 text-sm text-foreground">Hospitality, sales, development, and management.</p>
            </div>
          </div>
        </section>
          </>
        )}

        {pageView === "listings" && (
        <section id="listings" className="container mx-auto max-w-6xl px-5 py-14 sm:px-6 sm:py-20">
          <div className="mb-8 text-center">
            <Badge variant="secondary" className="mb-2">Dajem Homes Catalog</Badge>
            <h2 className="text-3xl font-bold text-primary dark:text-foreground">Available Properties</h2>
          </div>

          <Card className="mb-10 border bg-card/60 p-6 backdrop-blur-sm">
            <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
              <Button size="sm" variant={selectedGroup === "all" ? "default" : "outline"} onClick={() => setSelectedGroup("all")}>All</Button>
              {homesGroupOptions.map((group) => (
                <Button key={group.value} size="sm" variant={selectedGroup === group.value ? "default" : "outline"} className="h-auto min-h-10 whitespace-normal text-xs" onClick={() => setSelectedGroup(group.value)}>{group.label}</Button>
              ))}
            </div>
            <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div className="space-y-1.5 lg:col-span-2">
                <Label htmlFor="search">Search Keywords</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
                  <Input
                    id="search"
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
              {filteredProperties.map((property) => {
                const listedBy = property.submittedByName ?? profile.displayName;
                const isOfficial = !property.submittedByEmail;
                return (
                <Card key={property.id} className="group relative flex h-full flex-col overflow-hidden transition-all duration-300 hover:shadow-lg">
                  <div
                    className={`flex h-56 flex-col justify-between rounded-t-xl border-b bg-gradient-to-br bg-cover bg-center p-4 ${property.imageBg}`}
                    style={property.imageUrl ? { backgroundImage: `linear-gradient(135deg, rgba(15,23,42,.28), rgba(37,99,235,.18)), url(${property.imageUrl})` } : undefined}
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant="default" className={property.type === "sale" ? "bg-primary text-white" : "bg-blue-600 text-white"}>
                        {propertyGroupLabel(property.listingGroup, property.type)}
                      </Badge>
                      {isOfficial && <Badge className="bg-blue-600 text-white">Official</Badge>}
                      {property.featured && (
                        <Badge className="border-transparent bg-amber-500 text-white hover:bg-amber-600">
                          Featured
                        </Badge>
                      )}
                    </div>
                    <div className="flex w-max items-center gap-1.5 rounded-full bg-background/85 px-2.5 py-1 text-xs font-semibold text-foreground shadow-sm backdrop-blur-sm">
                      <Tag className="h-3 w-3 text-blue-500" />
                      <span className="capitalize">{property.category}</span>
                    </div>
                  </div>

                  <CardHeader className="flex-1 p-5">
                    <CardTitle className="line-clamp-1 text-xl font-bold tracking-tight">{property.title}</CardTitle>
                    <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                      <span className="line-clamp-1">{property.location}</span>
                    </div>
                    <p className="mt-2 text-xs font-semibold text-muted-foreground">{isOfficial || property.agentListingPaymentStatus === "Paid" ? `Listed by ${listedBy}` : "Verified listing - contact released after fee confirmation"}</p>
                  </CardHeader>

                  <CardContent className="px-5 pb-4 pt-0">
                    <p className="mb-4 text-2xl font-extrabold text-blue-600 dark:text-blue-400">
                      {formatCurrency(property.price)}
                      {(property.type === "short-let" || property.type === "hotel") && <span className="text-sm font-normal text-muted-foreground"> / night from</span>}
                    </p>
                    <div className="grid grid-cols-3 gap-2 border-t pt-3 text-xs font-semibold text-muted-foreground">
                      {property.beds !== undefined && (
                        <div className="flex items-center gap-1">
                          <BedDouble className="h-4 w-4 shrink-0 text-blue-500" />
                          <span>{property.beds} Beds</span>
                        </div>
                      )}
                      {property.baths !== undefined && (
                        <div className="flex items-center gap-1">
                          <Bath className="h-4 w-4 shrink-0 text-blue-500" />
                          <span>{property.baths} Baths</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Maximize className="h-4 w-4 shrink-0 text-blue-500" />
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
              );
              })}
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
                  setSelectedGroup("all");
                  setSelectedPrice("all");
                }}
              >
                Clear Search Filters
              </Button>
            </div>
          )}
        </section>
        )}

        {pageView === "submit" && (
        <section id="submit-property" className="border-t border-border bg-muted/20 py-14 sm:py-20">
          <div className="container mx-auto max-w-4xl px-4">
            <Card className="border bg-card p-8 shadow-xl">
              <div className="mx-auto mb-8 max-w-2xl text-center">
                <Badge variant="secondary" className="mb-2">Owners & Agents</Badge>
                <h3 className="text-2xl font-bold text-primary dark:text-foreground">Submit a Property</h3>
              </div>

              {!currentUser && (
                <div className="mb-5 rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                  <p className="mb-3">Sign in to submit and track this property.</p>
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
                    <Input id="p-title" required value={listingForm.title} onChange={(event) => setListingForm((current) => ({ ...current, title: event.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="p-loc">Exact Location</Label>
                    <Input id="p-loc" required value={listingForm.location} onChange={(event) => setListingForm((current) => ({ ...current, location: event.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                  <Select label="Property group" value={listingForm.listingGroup} onChange={(event) => {
                    const selected = homesGroupOptions.find((entry) => entry.value === event.target.value);
                    if (selected) setListingForm((current) => ({ ...current, listingGroup: selected.value, type: selected.type, category: selected.category }));
                  }} options={homesGroupOptions.map((entry) => ({ value: entry.value, label: entry.label }))} />
                  {listingForm.listingGroup === "land-sale" || listingForm.listingGroup === "land-lease" ? (
                    <div className="rounded-xl border bg-muted/30 px-3 py-2.5 text-sm text-muted-foreground">Land listing</div>
                  ) : (
                    <Select label="Home type" value={listingForm.residenceType} onChange={(event) => setListingForm((current) => ({ ...current, residenceType: event.target.value as ResidenceType }))} options={residenceOptions} />
                  )}
                  <div className="space-y-1.5">
                    <Label htmlFor="p-price">Expected Price</Label>
                    <Input id="p-price" type="number" required value={listingForm.price} onChange={(event) => setListingForm((current) => ({ ...current, price: event.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="p-size">Size (sqm)</Label>
                    <Input id="p-size" type="number" required value={listingForm.size} onChange={(event) => setListingForm((current) => ({ ...current, size: event.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="p-beds">Beds</Label>
                    <Input id="p-beds" type="number" value={listingForm.beds} onChange={(event) => setListingForm((current) => ({ ...current, beds: event.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="p-baths">Baths</Label>
                    <Input id="p-baths" type="number" value={listingForm.baths} onChange={(event) => setListingForm((current) => ({ ...current, baths: event.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="p-image">Image URL</Label>
                    <Input id="p-image" value={listingForm.imageUrl} onChange={(event) => setListingForm((current) => ({ ...current, imageUrl: event.target.value }))} />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5"><Label htmlFor="p-image-file">Property image (max 5MB)</Label><Input id="p-image-file" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadPropertyImage(file).catch((error) => setListingPaymentError(error instanceof Error ? error.message : "Image upload failed.")); }} /></div>
                  <div className="space-y-1.5"><Label htmlFor="p-company">Agency / company</Label><Input id="p-company" value={listingForm.agentCompany} onChange={(event) => setListingForm((current) => ({ ...current, agentCompany: event.target.value }))} /></div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="p-desc">Property Description</Label>
                  <Textarea id="p-desc" required rows={4} value={listingForm.summary} onChange={(event) => setListingForm((current) => ({ ...current, summary: event.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="p-highlights">Highlights</Label>
                  <Input id="p-highlights" value={listingForm.highlights} onChange={(event) => setListingForm((current) => ({ ...current, highlights: event.target.value }))} />
                </div>
                <label className="flex items-start gap-3 rounded-xl border bg-muted/25 p-4 text-sm">
                  <input type="checkbox" className="mt-1 h-4 w-4" checked={listingForm.requestContactPublication} onChange={(event) => setListingForm((current) => ({ ...current, requestContactPublication: event.target.checked }))} />
                  <span><strong className="text-foreground">Display my agent contact details after approval</strong><span className="mt-1 block text-muted-foreground">Requires a one-time N20,000 listing fee. Until payment is confirmed, the listing can appear but your contact details stay private.</span></span>
                </label>
                <Button type="submit" className="w-full bg-blue-600 font-semibold text-white hover:bg-blue-700" disabled={isBusy}>
                  Submit for Pending Approval
                </Button>
              </form>
            </Card>
          </div>
        </section>
        )}
      </main>

      <Footer compact />

      <Sheet isOpen={activeProperty !== null} onClose={() => setActiveProperty(null)} title={activeProperty?.title ?? "Property Detail"} widthClassName="max-w-2xl">
        {activeProperty && (
          <div className="space-y-6">
            <div
              className={`rounded-2xl border bg-gradient-to-br bg-cover bg-center p-6 ${activeProperty.imageBg}`}
              style={activeProperty.imageUrl ? { backgroundImage: `linear-gradient(135deg, rgba(255,255,255,.76), rgba(255,255,255,.52)), url(${activeProperty.imageUrl})` } : undefined}
            >
              <div className="mb-4 flex items-center justify-between">
                <Badge variant="default" className={activeProperty.type === "sale" ? "bg-primary text-white" : "bg-blue-600 text-white"}>
                  {propertyGroupLabel(activeProperty.listingGroup, activeProperty.type)}
                </Badge>
                {!activeProperty.submittedByEmail && <Badge className="bg-blue-600 text-white">Official</Badge>}
                {activeProperty.featured && <Badge className="bg-amber-500 text-white">Featured</Badge>}
              </div>
              <p className="text-3xl font-extrabold text-primary dark:text-foreground">
                {formatCurrency(activeProperty.price)}
              </p>
              <p className="mt-3 text-sm text-muted-foreground">{activeProperty.summary}</p>
              <p className="mt-3 text-xs font-semibold text-muted-foreground">
                Listed by {activeProperty.submittedByName ?? profile.displayName}
              </p>
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

            {(!activeProperty.submittedByEmail || activeProperty.agentListingPaymentStatus === "Paid") ? (
              activeProperty.submittedByEmail && (
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950 dark:border-blue-950 dark:bg-blue-950/20 dark:text-blue-100">
                  <p className="font-bold">Agent contact</p>
                  <p className="mt-1">{activeProperty.agentName ?? activeProperty.submittedByName} · {activeProperty.agentPhone ?? activeProperty.submittedByPhone}</p>
                  <p>{activeProperty.agentEmail ?? activeProperty.submittedByEmail}</p>
                </div>
              )
            ) : (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-950 dark:bg-amber-950/20 dark:text-amber-100">
                <p className="font-bold">Agent contact pending</p>
                <p className="mt-1">This external listing is visible, but contact details unlock only after DAJEM confirms the listing fee.</p>
              </div>
            )}

            <div className="rounded-xl border p-5">
              <div className="mb-3 flex items-center gap-2 font-semibold text-foreground">
                <ShieldCheck className="h-4 w-4 text-blue-500" />
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
                  <Building className="h-4 w-4 text-blue-500" />
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
                    value={bidForm.notes}
                    onChange={(event) => setBidForm((current) => ({ ...current, notes: event.target.value }))}
                  />
                </div>
                <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700" disabled={isBusy}>
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

      <Dialog isOpen={pendingListing !== null} onClose={() => setPendingListing(null)} title="Activate Agent Contact Details">
        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">Pay the N20,000 DAJEM Homes listing fee to publish your contact details when this property is approved. The property remains pending review.</p>
          <div className="rounded-xl border bg-muted/30 p-4"><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Listing fee</p><p className="mt-1 text-2xl font-black text-foreground">{formatCurrency(20000)}</p></div>
          {listingPaymentError && <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{listingPaymentError}</p>}
          <Button className="w-full bg-blue-600 text-white hover:bg-blue-700" disabled={isBusy} onClick={() => void payListingFee()}>Pay with Flutterwave</Button>
          <div className="border-t pt-4"><p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Already paid externally?</p><Input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadListingPaymentProof(file).catch((error) => setListingPaymentError(error instanceof Error ? error.message : "Payment-proof upload failed.")); }} /><Button variant="outline" className="mt-2 w-full" disabled={isBusy || !listingProofPath} onClick={() => void submitListingProof()}>Submit payment proof for review</Button></div>
        </div>
      </Dialog>
    </div>
  );
}
