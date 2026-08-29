"use client";

import React from "react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  Footer,
  Header,
  HeroSlideshow,
  Input,
  Label,
  SectionNav,
  TrustRibbon,
  Select,
  Sheet,
  Textarea,
  dajemCompanyProfiles,
  useDajem,
} from "@repo/ui";
import {
  CheckCircle2,
  CreditCard,
  Egg,
  Minus,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Trash2,
  Truck,
  Plus,
} from "lucide-react";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

type ChickenType = "live" | "processed" | "grilled";

const chickenTypeOptions = [
  { value: "live", label: "Live Chicken" },
  { value: "processed", label: "Eviscerated/Processed Chicken" },
  { value: "grilled", label: "Grilled Chicken" },
];

const processedChickenCuts = ["Whole", "Cut 8", "Cut 12", "Cut 15", "Cut 16", "Cut 20", "Cut 25", "Cut 30"];
const grilledChickenCuts = ["Whole", "Cut 8", "Cut 12", "Cut 15", "Cut 16", "Cut 20"];

function getChickenVariantLabel(type: ChickenType, cut: string) {
  if (type === "live") return "Live Chicken";
  if (type === "processed") return `Eviscerated/Processed Chicken - ${cut}`;
  return `Grilled Chicken - ${cut}`;
}

function getChickenVariantKey(label: string) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function PoultryPage() {
  const profile = dajemCompanyProfiles.poultry;
  const {
    snapshot,
    addToCart,
    cartCount,
    currentUser,
    isBusy,
    navigateToUrl,
    openAuthModal,
    removeCartItem,
    requireAuth,
    startFlutterwaveCheckout,
    updateCartItem,
  } = useDajem();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [cartOpen, setCartOpen] = React.useState(false);
  const [bulkSent, setBulkSent] = React.useState(false);
  const [lastOrder, setLastOrder] = React.useState<(typeof snapshot.orders)[number] | null>(null);
  const [checkoutError, setCheckoutError] = React.useState<string | null>(null);
  const [invoiceOpen, setInvoiceOpen] = React.useState(false);
  const [invoiceReference, setInvoiceReference] = React.useState("");
  const [chickenType, setChickenType] = React.useState<ChickenType>("live");
  const [chickenCut, setChickenCut] = React.useState("Whole");

  const filteredProducts = snapshot.inventory.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
      || product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  const promoProducts = snapshot.inventory.filter((product) => {
    const promoPrice = product.promoPrice ?? 0;
    const originalPrice = product.originalPrice ?? product.price;
    return promoPrice > 0 && promoPrice < originalPrice;
  });

  const poultryProduct = snapshot.inventory.find((product) => product.productId === "livestock-poultry-01");
  const chickenCutOptions = chickenType === "processed" ? processedChickenCuts : chickenType === "grilled" ? grilledChickenCuts : [];
  const selectedChickenVariantLabel = getChickenVariantLabel(chickenType, chickenCut);
  const cartTotal = snapshot.cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const handleAddToCart = async (productId: string) => {
    if (!requireAuth("signup")) return;
    await addToCart(productId, 1);
    setCartOpen(true);
  };

  const handleAddChickenToCart = async () => {
    if (!poultryProduct) return;
    if (!requireAuth("signup")) return;

    await addToCart(poultryProduct.productId, 1, {
      variantKey: getChickenVariantKey(selectedChickenVariantLabel),
      variantLabel: selectedChickenVariantLabel,
    });
    setCartOpen(true);
  };

  const openInvoiceReview = () => {
    if (!requireAuth("login")) return;
    if (snapshot.cart.length === 0) return;
    setCheckoutError(null);
    setInvoiceReference(`DAJEM-FARM-${Date.now().toString(36).toUpperCase()}`);
    setInvoiceOpen(true);
  };

  const handleCheckout = async () => {
    if (!requireAuth("login")) return;
    setCheckoutError(null);
    setInvoiceOpen(false);

    try {
      const result = await startFlutterwaveCheckout();
      if (result.payment?.mode === "redirect" && result.payment.checkoutUrl) {
        window.location.href = result.payment.checkoutUrl;
        return;
      }

      if (result.order) {
        setLastOrder(result.order);
        setCartOpen(false);
      }
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : "Checkout failed.");
    }
  };

  const printInvoice = () => {
    if (typeof window !== "undefined") window.print();
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header activeApp="poultry" onCartClick={() => setCartOpen(true)} />

      <main className="flex-1">
        <SectionNav label="DAJEM Farms" items={[
          { href: "#why-us", label: "Why DAJEM" },
          { href: "#chicken-selection", label: "Chicken Orders" },
          ...(promoProducts.length > 0 ? [{ href: "#flash-sales", label: "Offers" }] : []),
          { href: "#catalog", label: "Shop" },
          { href: "#bulk-order", label: "Bulk Order" },
        ]} />

        <HeroSlideshow
          className="dajem-mobile-hero py-14 sm:py-20 lg:py-24"
          overlayClassName="bg-[linear-gradient(135deg,rgba(236,253,245,0.3),rgba(236,253,245,0.52),rgba(255,255,255,0.84))] dark:bg-[linear-gradient(135deg,rgba(6,78,59,0.28),rgba(2,6,23,0.54),rgba(2,6,23,0.84))]"
          slides={[
            { src: "/images/farms-hero-farm-v2.png", position: "center", label: "Farm operations" },
            { src: "/images/farms-hero-generated.png", position: "center", label: "Fresh farm supply" },
          ]}
        >
          <div className="absolute top-0 right-0 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl -z-10" />
          <div className="absolute bottom-10 left-10 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl -z-10" />

          <div className="container mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 px-5 sm:px-6 md:grid-cols-2 md:gap-12">
            <div className="dajem-hero-copy-panel space-y-5 rounded-[1.75rem] p-5 sm:space-y-6 sm:p-8">
              <Badge variant="secondary" className="border border-emerald-200/25 bg-emerald-400/15 px-3 py-1 font-semibold text-emerald-100 hover:bg-emerald-400/20">
                Started {profile.startDate}
              </Badge>
              <h1 className="text-[2.55rem] font-bold leading-[0.98] text-white sm:text-5xl">
                <span className="dajem-hero-title block">{profile.shortName}</span>
                <span className="mt-3 block text-[1.08rem] font-semibold leading-[1.3] tracking-tight text-slate-100 sm:text-[1.45rem]">
                  Food, livestock, grills, and farm supplies from one trusted source
                </span>
              </h1>
              <p className="dajem-hero-lede text-base leading-relaxed">
                Shop Livestock, Poultry, Fish, Goats, Sheep, Turkey, Chicken Grills, Fish Grills, Eggs, Farm Consultancy, Farm Produce, Farm Equipment, And Agro-Allied Products From One Shared DAJEM Cart.
              </p>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap sm:gap-4">
                <Button
                  size="lg"
                  className="w-full bg-emerald-600 text-white hover:bg-emerald-700 sm:w-auto"
                  onClick={() => document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" })}
                >
                  <ShoppingCart className="h-5 w-5" />
                  Shop Farm Catalog
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-white/45 bg-white/10 text-white hover:bg-white/20 hover:text-white sm:w-auto"
                  onClick={() => cartOpen ? setCartOpen(false) : setCartOpen(true)}
                >
                  Shared Cart ({cartCount})
                </Button>
              </div>
            </div>

            <div className="mx-auto max-w-md space-y-5 rounded-[1.5rem] border bg-card/82 p-5 shadow-xl backdrop-blur-xl transition-transform duration-500 hover:-translate-y-1 sm:space-y-6 sm:p-8">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Operations Linkage</span>
                  <h4 className="text-lg font-bold text-emerald-600">Checkout Status</h4>
                </div>
                <Badge variant="default" className="bg-emerald-600 text-white">
                  {snapshot.integrations.flutterwaveConfigured ? "Flutterwave Ready" : "Simulation Mode"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Your cart and order history are tied to the shared DAJEM account layer. The current payment setup is ready for Flutterwave test keys before live keys are added later.
              </p>
              <div className="grid grid-cols-2 gap-4 border-t border-border pt-4 text-xs font-semibold text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  Shared account layer
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-emerald-500" />
                  Farm order flow
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-500" />
                  Dashboard tracking
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-emerald-500" />
                  Test payment ready
                </div>
              </div>
            </div>
          </div>
        </HeroSlideshow>

        <TrustRibbon companyName={profile.displayName} registrationNumber={profile.registrationNumber} />

        <section id="why-us" className="border-y border-border bg-muted/20 py-12 sm:py-16">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {[
                {
                  title: "General Farming Focus",
                  desc: "DAJEM Farms Limited supports livestock, grills, eggs, produce, equipment, agro-allied products, and farm consultancy.",
                  icon: ShieldCheck,
                  color: "text-emerald-500 bg-emerald-500/10",
                },
                {
                  title: "Farm Product Management",
                  desc: "Products, images, stock, and pricing are controlled from the unified admin portal.",
                  icon: Sparkles,
                  color: "text-emerald-500 bg-emerald-500/10",
                },
                {
                  title: "Order Coordination",
                  desc: "Order records and customer communication previews are linked to the shared dashboard.",
                  icon: Truck,
                  color: "text-blue-500 bg-blue-500/10",
                },
              ].map((feature) => (
                <div key={feature.title} className="flex gap-4 rounded-xl border bg-card p-6 shadow-sm">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${feature.color}`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-foreground">{feature.title}</h4>
                    <p className="text-sm leading-relaxed text-muted-foreground">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="chicken-selection" className="border-b border-emerald-500/20 bg-emerald-500/5 py-12 sm:py-14">
          <div className="container mx-auto max-w-6xl px-4">
            <Card className="overflow-hidden border-emerald-500/20 bg-card/92 shadow-lg">
              <CardContent className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[0.9fr_1.1fr] lg:p-8">
                <div className="space-y-3">
                  <Badge className="bg-emerald-600 text-white">Chicken Selection</Badge>
                  <h2 className="text-2xl font-bold text-primary dark:text-foreground">Choose Your Chicken Order Style</h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Select live chicken, processed chicken, or grilled chicken before adding it to your shared DAJEM cart.
                  </p>
                  {poultryProduct && (
                    <div className="rounded-2xl border bg-emerald-500/10 p-4 text-sm">
                      <p className="font-semibold text-foreground">{poultryProduct.name}</p>
                      <p className="text-muted-foreground">{formatCurrency(poultryProduct.promoPrice ?? poultryProduct.price)} each</p>
                    </div>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Select
                    label="Chicken Type"
                    value={chickenType}
                    onChange={(event) => {
                      setChickenType(event.target.value as ChickenType);
                      setChickenCut("Whole");
                    }}
                    options={chickenTypeOptions}
                  />
                  {chickenCutOptions.length > 0 ? (
                    <Select
                      label="Cut Option"
                      value={chickenCut}
                      onChange={(event) => setChickenCut(event.target.value)}
                      options={chickenCutOptions.map((cut) => ({ value: cut, label: cut }))}
                    />
                  ) : (
                    <div className="rounded-xl border bg-background/70 p-4 text-sm text-muted-foreground">
                      Live chicken is added whole with no cut selection.
                    </div>
                  )}
                  <div className="rounded-xl border bg-background/70 p-4 text-sm sm:col-span-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Selected Order</p>
                    <p className="mt-1 font-bold text-foreground">{selectedChickenVariantLabel}</p>
                  </div>
                  <Button
                    className="w-full bg-emerald-600 font-semibold text-white hover:bg-emerald-700 sm:col-span-2"
                    onClick={() => void handleAddChickenToCart()}
                    disabled={!poultryProduct || poultryProduct.stockStatus === "Out of Stock" || isBusy}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Add Selected Chicken To Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {promoProducts.length > 0 && (
          <section id="flash-sales" className="border-y border-emerald-500/20 bg-emerald-500/10 py-10 sm:py-12">
            <div className="container mx-auto max-w-6xl px-4">
              <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <Badge className="bg-emerald-600 text-white">Flash Sales</Badge>
                  <h2 className="mt-2 text-2xl font-bold text-primary dark:text-foreground">Farm deals with admin-controlled timers</h2>
                </div>
                <p className="text-sm text-muted-foreground">Promo prices and end dates are edited from the unified admin page.</p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {promoProducts.slice(0, 6).map((product) => (
                  <Card key={product.productId} className="overflow-hidden border-emerald-500/20 bg-card/85">
                    <CardContent className="flex items-center gap-4 p-4">
                      <div
                        className="h-20 w-20 shrink-0 rounded-2xl bg-cover bg-center"
                        style={product.imageUrl ? { backgroundImage: `linear-gradient(135deg, rgba(255,255,255,.45), rgba(16,185,129,.2)), url(${product.imageUrl})` } : undefined}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold text-foreground">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.promoLabel || "Limited farm promo"}{product.promoEndsAt ? ` - Ends ${product.promoEndsAt}` : ""}</p>
                        <div className="mt-2 flex items-baseline gap-2">
                          <span className="text-lg font-extrabold text-emerald-600">{formatCurrency(product.promoPrice ?? product.price)}</span>
                          <span className="text-xs text-muted-foreground line-through">{formatCurrency(product.originalPrice ?? product.price)}</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="bg-emerald-600 text-white hover:bg-emerald-700"
                        onClick={() => void (product.productId === "livestock-poultry-01" ? handleAddChickenToCart() : handleAddToCart(product.productId))}
                      >
                        Add
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        <section id="catalog" className="container mx-auto max-w-6xl px-5 py-14 sm:px-6 sm:py-20">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <Badge variant="secondary" className="mb-3">{profile.displayName}</Badge>
              <h2 className="text-3xl font-bold text-primary dark:text-foreground">Browse Farm Products</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Inventory, product images, price, and stock levels are centrally managed from the admin portal.
              </p>
            </div>

            <div className="flex w-full flex-col items-center gap-4 sm:flex-row md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground opacity-50" />
                <Input
                  className="h-9 pl-9"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>
              <div className="w-full sm:w-auto">
                <Select
                  value={selectedCategory}
                  onChange={(event) => setSelectedCategory(event.target.value)}
                  options={[
                    { value: "all", label: "All Categories" },
                    { value: "livestock", label: "Livestock" },
                    { value: "grills", label: "Grills" },
                    { value: "eggs", label: "Eggs" },
                    { value: "consultancy", label: "Farm Consultancy" },
                    { value: "produce", label: "Farm Produce" },
                    { value: "equipment", label: "Farm Equipment" },
                    { value: "agro-allied", label: "Agro-Allied Products" },
                  ]}
                />
              </div>
            </div>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => {
                const displayPrice = product.promoPrice ?? product.price;
                const hasPromo = Boolean(product.promoPrice && (product.originalPrice ?? product.price) > product.promoPrice);
                return (
                <Card key={product.productId} className="flex h-full flex-col overflow-hidden hover:-translate-y-1 duration-300">
                  <div
                    className={`flex h-32 items-center justify-center border-b bg-cover bg-center sm:h-40 ${product.imageBg}`}
                    style={product.imageUrl ? { backgroundImage: `linear-gradient(135deg, rgba(255,255,255,.58), rgba(255,255,255,.28)), url(${product.imageUrl})` } : undefined}
                  >
                    {!product.imageUrl && <Egg className="h-12 w-12 opacity-80" />}
                  </div>
                  <CardHeader className="flex-1 p-3 sm:p-5">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <Badge variant="outline" className="capitalize">{product.category}</Badge>
                      <span className={`text-xs font-semibold ${product.stockStatus === "In Stock" ? "text-emerald-500" : product.stockStatus === "Low Stock" ? "text-amber-500" : "text-destructive"}`}>
                        {product.stockStatus}
                      </span>
                    </div>
                    <CardTitle className="text-base font-bold leading-snug sm:text-lg">{product.name}</CardTitle>
                    <CardDescription className="mt-1 line-clamp-3 text-xs">{product.description}</CardDescription>
                    {(product.age || product.weight) && (
                      <p className="text-[11px] font-semibold text-muted-foreground">{[product.age, product.weight].filter(Boolean).join(" - ")}</p>
                    )}
                  </CardHeader>
                  <CardContent className="flex items-center justify-between gap-2 px-3 pb-4 pt-0 sm:px-5">
                    <div>
                      <span className="text-lg font-extrabold text-primary dark:text-foreground">
                        {formatCurrency(displayPrice)}
                      </span>
                      {hasPromo && (
                        <p className="text-xs text-muted-foreground line-through">{formatCurrency(product.originalPrice ?? product.price)}</p>
                      )}
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {product.availableUnits} left
                    </span>
                  </CardContent>
                  <div className="border-t border-border/50 p-3 sm:p-5">
                    <Button
                      className="w-full bg-emerald-600 font-semibold text-white hover:bg-emerald-700"
                      onClick={() => void (product.productId === "livestock-poultry-01" ? handleAddChickenToCart() : handleAddToCart(product.productId))}
                      disabled={product.stockStatus === "Out of Stock" || isBusy}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Add
                    </Button>
                  </div>
                </Card>
              );
              })}
            </div>
          ) : (
            <div className="rounded-xl border bg-card py-16 text-center">
              <p className="text-muted-foreground">No farm products match your active search or filters.</p>
              <Button variant="outline" className="mt-4" onClick={() => { setSearchTerm(""); setSelectedCategory("all"); }}>
                Reset Filters
              </Button>
            </div>
          )}
        </section>

        <section id="bulk-order" className="border-t border-border bg-muted/30 py-14 sm:py-20">
          <div className="container mx-auto max-w-4xl px-4">
            <Card className="border bg-card p-8 shadow-lg">
              <div className="mx-auto mb-8 max-w-2xl text-center">
                <Badge variant="secondary" className="mb-2">Bulk Orders</Badge>
                  <h3 className="text-2xl font-bold text-primary dark:text-foreground">Request Commercial Farm Quotation</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Operating at scale? Our logistics desk will prepare a volume-based proposal and delivery plan.
                </p>
              </div>

              <form onSubmit={(event) => { event.preventDefault(); setBulkSent(true); }} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="b-name">Contact Person</Label>
                  <Input id="b-name" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="b-email">Email Address</Label>
                  <Input id="b-email" type="email" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="b-phone">Phone Number</Label>
                  <Input id="b-phone" type="tel" required />
                </div>
                <div className="space-y-1.5">
                  <Select
                    label="Desired Product Category"
                    options={[
                      { value: "livestock-bulk", label: "Livestock Supply" },
                      { value: "grills-bulk", label: "Chicken and Fish Grills" },
                      { value: "eggs-bulk", label: "Eggs" },
                      { value: "produce-bulk", label: "Farm Produce Supply" },
                      { value: "equip-bulk", label: "Farm Equipment" },
                      { value: "agro-allied-bulk", label: "Agro-Allied Products" },
                      { value: "consultancy-bulk", label: "Farm Consultancy" },
                    ]}
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="b-notes">Delivery Location & Special Instructions</Label>
                  <Textarea id="b-notes" required rows={4} />
                </div>
                <div className="mt-2 sm:col-span-2">
                  <Button type="submit" className="w-full bg-emerald-500 font-semibold text-white hover:bg-emerald-600">
                    Submit Bulk Quotation Request
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </section>
      </main>

      <Footer />

      <button
        type="button"
        className="fixed bottom-5 right-5 z-40 inline-flex h-14 min-w-14 items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 font-bold text-white shadow-2xl shadow-emerald-900/25 transition hover:-translate-y-0.5 hover:bg-emerald-700"
        onClick={() => setCartOpen(true)}
      >
        <ShoppingCart className="h-5 w-5" />
        <span>{cartCount}</span>
      </button>

      <Sheet
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        title={`Shared Cart${currentUser ? ` for ${currentUser.name}` : ""}`}
      >
        <div className="space-y-5">
          {!currentUser ? (
            <div className="space-y-4 rounded-xl border border-dashed p-5 text-sm text-muted-foreground">
              <p>Sign in to keep your DAJEM Farms cart synced with the shared dashboard.</p>
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => openAuthModal("login")}>Login</Button>
                <Button variant="outline" onClick={() => openAuthModal("signup")}>
                  Create account
                </Button>
              </div>
            </div>
          ) : snapshot.cart.length === 0 ? (
            <div className="space-y-2 rounded-xl border border-dashed p-5 text-sm text-muted-foreground">
              <p>Your cart is empty.</p>
              <p>Add products from the catalog to begin checkout.</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {snapshot.cart.map((item) => (
                  <div key={`${item.productId}-${item.variantKey ?? "base"}`} className="rounded-xl border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">{item.name}</p>
                        {item.variantLabel && (
                          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{item.variantLabel}</p>
                        )}
                        <p className="text-xs text-muted-foreground">{formatCurrency(item.price)} each</p>
                      </div>
                      <button
                        className="rounded-md border p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        onClick={() => void removeCartItem(item.productId, { variantKey: item.variantKey })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          className="rounded-md border p-2 hover:bg-accent"
                          onClick={() => void updateCartItem(item.productId, item.quantity - 1, { variantKey: item.variantKey })}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <button
                          className="rounded-md border p-2 hover:bg-accent"
                          onClick={() => void updateCartItem(item.productId, item.quantity + 1, { variantKey: item.variantKey })}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <Badge>{formatCurrency(item.quantity * item.price)}</Badge>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border bg-muted/30 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Cart Items</span>
                  <span className="font-semibold">{cartCount}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-lg font-bold text-foreground">
                  <span>Total</span>
                  <span>{formatCurrency(cartTotal)}</span>
                </div>
              </div>

              {checkoutError && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {checkoutError}
                </div>
              )}

              <Button className="w-full bg-emerald-600 text-white hover:bg-emerald-700" disabled={isBusy} onClick={openInvoiceReview}>
                <CreditCard className="h-4 w-4" />
                {snapshot.integrations.flutterwaveConfigured ? "Review Invoice & Pay With Flutterwave" : "Review Invoice & Complete Checkout"}
              </Button>
            </>
          )}
        </div>
      </Sheet>

      <Dialog isOpen={invoiceOpen} onClose={() => setInvoiceOpen(false)} title="Invoice Review">
        <div className="space-y-5 py-2">
          <div className="rounded-2xl border bg-emerald-500/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Invoice Reference</p>
            <p className="mt-1 font-mono text-sm font-bold text-foreground">{invoiceReference || "DAJEM-FARM"}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Review your order summary before continuing to the current Flutterwave test checkout or simulated checkout.
            </p>
          </div>

          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-xl border p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Customer</p>
              <p className="mt-1 font-semibold text-foreground">{currentUser?.name ?? "Guest"}</p>
            </div>
            <div className="rounded-xl border p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contact</p>
              <p className="mt-1 font-semibold text-foreground">{currentUser?.email ?? "Sign in required"}</p>
            </div>
          </div>

          <div className="space-y-3">
            {snapshot.cart.map((item) => (
              <div key={`invoice-${item.productId}-${item.variantKey ?? "base"}`} className="rounded-xl border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-foreground">{item.name}</p>
                    {item.variantLabel && (
                      <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{item.variantLabel}</p>
                    )}
                    <p className="text-xs text-muted-foreground">Qty {item.quantity} x {formatCurrency(item.price)}</p>
                  </div>
                  <p className="shrink-0 font-bold text-foreground">{formatCurrency(item.quantity * item.price)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border bg-muted/30 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Items</span>
              <span className="font-semibold">{cartCount}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-lg font-bold text-foreground">
              <span>Amount Due</span>
              <span>{formatCurrency(cartTotal)}</span>
            </div>
          </div>

          {checkoutError && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {checkoutError}
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <Button variant="outline" onClick={printInvoice}>
              Print Invoice
            </Button>
            <Button className="bg-emerald-600 text-white hover:bg-emerald-700" disabled={isBusy} onClick={() => void handleCheckout()}>
              <CreditCard className="h-4 w-4" />
              Proceed To Payment
            </Button>
          </div>
        </div>
      </Dialog>

      <Dialog isOpen={Boolean(lastOrder)} onClose={() => setLastOrder(null)} title="Order Confirmed">
        {lastOrder && (
          <div className="space-y-4 py-2 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/50">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-semibold text-foreground">Checkout completed</p>
              <p className="text-sm text-muted-foreground">
                Your shared DAJEM order has been saved and is now visible in the dashboard.
              </p>
            </div>
            <div className="rounded-lg bg-muted p-4 text-left text-xs font-mono">
              <p><strong>Reference:</strong> {lastOrder.reference}</p>
              <p><strong>Provider:</strong> {lastOrder.provider}</p>
              <p><strong>Total:</strong> {formatCurrency(lastOrder.total)}</p>
            </div>
            <div className="space-y-2 rounded-lg border p-4 text-left text-xs">
              {lastOrder.items.map((item) => (
                <div key={`order-${item.productId}-${item.variantKey ?? "base"}`} className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{item.name}</p>
                    {item.variantLabel && <p className="text-emerald-600 dark:text-emerald-400">{item.variantLabel}</p>}
                    <p className="text-muted-foreground">Qty {item.quantity} x {formatCurrency(item.price)}</p>
                  </div>
                  <p className="font-bold text-foreground">{formatCurrency(item.quantity * item.price)}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                className="w-full bg-primary text-white"
                onClick={() => void navigateToUrl("/dashboard")}
              >
                Open Dashboard
              </Button>
              <Button variant="outline" className="w-full" onClick={printInvoice}>
                Print Invoice
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setLastOrder(null)}>
                Stay Here
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      <Dialog isOpen={bulkSent} onClose={() => setBulkSent(false)} title="Quotation Request Submitted">
        <div className="space-y-4 py-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/50">
            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-foreground">Request Logged</p>
            <p className="text-sm text-muted-foreground">
              Our DAJEM Farms desk has received your request and will respond with a customized quote.
            </p>
          </div>
          <Button className="bg-primary text-white" onClick={() => setBulkSent(false)}>
            Got it
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
