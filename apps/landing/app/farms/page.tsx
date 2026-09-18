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
  SubsidiaryNav,
  SubsidiaryPageIntro,
  SubsidiaryRouteGrid,
  TrustRibbon,
  Select,
  Sheet,
  Textarea,
  dajemCompanyProfiles,
  shippingWeightKg,
  useDajem,
} from "@repo/ui";
import { localGovernmentsForState, nigeriaStates } from "@repo/ui/lib/nigeria-locations";
import {
  CheckCircle2,
  CreditCard,
  Egg,
  Home,
  ClipboardList,
  Drumstick,
  Minus,
  Store,
  Search,
  ShieldCheck,
  ShoppingCart,
  Trash2,
  Truck,
  Plus,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

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

const farmNavItems = [
  { href: "/farms", label: "Home", icon: Home },
  { href: "/farms/shop", label: "Shop", icon: Store },
  { href: "/farms/chicken", label: "Chicken", icon: Drumstick },
  { href: "/farms/bulk-order", label: "Bulk", icon: ClipboardList },
];

const farmPageMeta = {
  shop: {
    eyebrow: "Farm marketplace",
    title: "Fresh products and active farm offers",
    description: "Browse products and add them to your shared cart.",
  },
  chicken: {
    eyebrow: "Chicken order studio",
    title: "Choose exactly how your chicken is prepared",
    description: "Choose live, processed, or grilled chicken and your preferred cut.",
  },
  "bulk-order": {
    eyebrow: "Commercial supply desk",
    title: "Request a tailored bulk farm quotation",
    description: "Send the quantity, delivery location, and supply requirements.",
  },
} as const;

function getChickenVariantLabel(type: ChickenType, cut: string) {
  if (type === "live") return "Live Chicken";
  if (type === "processed") return `Eviscerated/Processed Chicken - ${cut}`;
  return `Grilled Chicken - ${cut}`;
}

function getChickenVariantKey(label: string) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function PoultryPage() {
  const pathname = usePathname();
  const router = useRouter();
  const pageView = pathname === "/farms/shop"
    ? "shop"
    : pathname === "/farms/chicken"
      ? "chicken"
      : pathname === "/farms/bulk-order"
        ? "bulk-order"
        : "home";
  const activePageMeta = pageView === "home" ? null : farmPageMeta[pageView];
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
    startPaymentCheckout,
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
  const [deliveryRequested, setDeliveryRequested] = React.useState(false);
  const [deliveryQuote, setDeliveryQuote] = React.useState<{ provider: string; serviceName: string; amount: number; estimatedDelivery: string; note: string } | null>(null);
  const [deliveryError, setDeliveryError] = React.useState<string | null>(null);
  const [isCalculatingDelivery, setIsCalculatingDelivery] = React.useState(false);
  const [deliveryDetails, setDeliveryDetails] = React.useState({
    recipientName: "",
    phone: "",
    address: "",
    state: "",
    localGovernment: "",
    postalCode: "",
  });
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
  const cartWeightKg = snapshot.cart.reduce((total, item) => total + (shippingWeightKg(item) * item.quantity), 0);
  const selectedLocalGovernments = localGovernmentsForState(deliveryDetails.state);
  const checkoutTotal = cartTotal + (deliveryQuote?.amount ?? 0);

  const useSavedDeliveryAddress = React.useCallback(() => {
    if (!currentUser) return;
    setDeliveryDetails({
      recipientName: currentUser.name,
      phone: currentUser.phone,
      address: currentUser.address ?? "",
      state: currentUser.state ?? "",
      localGovernment: currentUser.localGovernment ?? "",
      postalCode: "",
    });
    setDeliveryQuote(null);
    setDeliveryError(null);
  }, [currentUser]);

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
    if (currentUser) useSavedDeliveryAddress();
    setInvoiceReference("DFYYYYMMDDXXXXXX (issued when payment is created)");
    setInvoiceOpen(true);
  };

  const calculateDelivery = async () => {
    setDeliveryError(null);
    setDeliveryQuote(null);
    setIsCalculatingDelivery(true);

    try {
      const response = await fetch("/api/dhl/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          destination: {
            ...deliveryDetails,
            city: deliveryDetails.localGovernment,
            countryCode: "NG",
            weightKg: cartWeightKg,
          },
          zone: deliveryDetails.state === "Enugu" ? "enugu" : ["Abia", "Anambra", "Ebonyi", "Imo"].includes(deliveryDetails.state) ? "southeast" : "other",
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? "Unable to calculate delivery.");
      setDeliveryQuote(data);
    } catch (error) {
      setDeliveryError(error instanceof Error ? error.message : "Unable to calculate delivery.");
    } finally {
      setIsCalculatingDelivery(false);
    }
  };

  const handleCheckout = async () => {
    if (!requireAuth("login")) return;
    if (deliveryRequested && !deliveryQuote) {
      setCheckoutError("Calculate delivery before proceeding to payment.");
      return;
    }
    setCheckoutError(null);

    try {
      const result = await startPaymentCheckout("flutterwave", {
        delivery: deliveryRequested ? deliveryDetails : undefined,
      });
      if (result.payment?.mode === "redirect" && result.payment.checkoutUrl) {
        setInvoiceOpen(false);
        window.location.href = result.payment.checkoutUrl;
        return;
      }

      if (result.order) {
        setInvoiceOpen(false);
        setLastOrder(result.order);
        setCartOpen(false);
        await navigateToUrl("/dashboard#billing");
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
        <SubsidiaryNav label="DAJEM Farms" items={farmNavItems} accent="emerald" />

        {activePageMeta && (
          <SubsidiaryPageIntro
            eyebrow={activePageMeta.eyebrow}
            title={activePageMeta.title}
            description={activePageMeta.description}
            accent="emerald"
          />
        )}

        {pageView === "home" && (
          <>
        <HeroSlideshow
          className="dajem-mobile-hero py-14 sm:py-20 lg:py-24"
          overlayClassName="bg-[linear-gradient(135deg,rgba(236,253,245,0.3),rgba(236,253,245,0.52),rgba(255,255,255,0.84))] dark:bg-[linear-gradient(135deg,rgba(6,78,59,0.28),rgba(2,6,23,0.54),rgba(2,6,23,0.84))]"
          slides={[
            { src: "/images/farms-hero-farm-v2.png", position: "center", label: "Fresh livestock and farm produce", actionLabel: "Shop fresh farm products", href: "/farms/shop" },
            { src: "/images/farms-hero-generated.png", position: "center", label: "Prepared poultry orders", actionLabel: "Customize a chicken order", href: "/farms/chicken" },
          ]}
        >
          <div className="absolute top-0 right-0 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl -z-10" />
          <div className="absolute bottom-10 left-10 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl -z-10" />

          <div className="container mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 px-5 sm:px-6 md:grid-cols-2 md:gap-12">
            <div className="dajem-hero-copy-panel space-y-5 rounded-[1.75rem] p-5 sm:space-y-6 sm:p-8">
              <Badge variant="secondary" className="border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/15">
                Started {profile.startDate}
              </Badge>
              <h1 className="text-[2.55rem] font-bold leading-[0.98] sm:text-5xl">
                <span className="dajem-hero-title block">{profile.shortName}</span>
                <span className="mt-3 block text-[1.08rem] font-semibold leading-[1.3] tracking-tight text-slate-800 dark:text-slate-100 sm:text-[1.45rem]">
                  Food, livestock, grills, and farm supplies from one trusted source
                </span>
              </h1>
              <p className="dajem-hero-lede text-base leading-relaxed">
                Fresh livestock, poultry, grills, eggs, produce, and farm supplies.
              </p>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap sm:gap-4">
                <Button
                  size="lg"
                  className="sheen-glow w-full sm:w-auto rounded-full bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-600/25 hover:bg-emerald-700 transition-all"
                  onClick={() => router.push("/farms/shop")}
                >
                  <ShoppingCart className="h-5 w-5 mr-1" />
                  Shop Farm Catalog
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto rounded-full border-border/80 bg-background/60 hover:bg-background/90 text-foreground font-semibold shadow-sm backdrop-blur-md transition-all"
                  onClick={() => cartOpen ? setCartOpen(false) : setCartOpen(true)}
                >
                  Shared Cart ({cartCount})
                </Button>
              </div>
            </div>

            <div className="dajem-hero-info-panel mx-auto hidden max-w-md space-y-4 rounded-[1.5rem] border p-5 shadow-xl backdrop-blur-xl transition-transform duration-500 hover:-translate-y-1 sm:p-8 md:block">
              <div className="flex items-start justify-between">
                <h4 className="text-lg font-bold text-emerald-700 dark:text-emerald-400">Connected Checkout</h4>
                <Badge variant="default" className="bg-emerald-600 text-white">
                  Secure payments
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 border-t border-border pt-4 text-xs font-semibold text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  Shared cart
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-emerald-500" />
                  Order tracking
                </div>
              </div>
            </div>
          </div>
        </HeroSlideshow>

        <TrustRibbon companyName={profile.displayName} registrationNumber={profile.registrationNumber} />

        <SubsidiaryRouteGrid
          title="What would you like to do?"
          accent="emerald"
          items={[
            { ...farmNavItems[1], meta: `${snapshot.inventory.length} products`, description: "Browse products and current offers." },
            { ...farmNavItems[2], meta: "Made to order", description: "Select preparation and cut." },
            { ...farmNavItems[3], meta: "Business supply", description: "Request volume pricing." },
            { href: "/dashboard", label: "Orders", icon: Truck, meta: "Track activity", description: "Review your orders." },
          ]}
        />
          </>
        )}

        {pageView === "chicken" && (
        <section id="chicken-selection" className="border-b border-emerald-500/20 bg-emerald-500/5 py-12 sm:py-14">
          <div className="container mx-auto max-w-6xl px-4">
            <Card className="overflow-hidden border-emerald-500/20 bg-card/92 shadow-lg">
              <CardContent className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[0.9fr_1.1fr] lg:p-8">
                <div className="space-y-3">
                  <Badge className="bg-emerald-600 text-white">Chicken Selection</Badge>
                  <h2 className="text-2xl font-bold text-primary dark:text-foreground">Choose Your Chicken Order Style</h2>
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
        )}

        {pageView === "shop" && (
          <>
        {promoProducts.length > 0 && (
          <section id="flash-sales" className="border-y border-emerald-500/20 bg-emerald-500/10 py-10 sm:py-12">
            <div className="container mx-auto max-w-6xl px-4">
              <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <Badge className="bg-emerald-600 text-white">Flash Sales</Badge>
                  <h2 className="mt-2 text-2xl font-bold text-primary dark:text-foreground">Current Farm Offers</h2>
                </div>
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
          <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
            {[{ value: "all", label: "All products" }, { value: "livestock", label: "Livestock" }, { value: "grills", label: "Grills" }, { value: "eggs", label: "Eggs" }, { value: "produce", label: "Produce" }, { value: "equipment", label: "Equipment" }, { value: "consultancy", label: "Services" }].map((category) => (
              <Button key={category.value} size="sm" variant={selectedCategory === category.value ? "default" : "outline"} className="h-auto min-h-10 justify-center whitespace-normal text-xs" onClick={() => setSelectedCategory(category.value)}>{category.label}</Button>
            ))}
          </div>
          <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <Badge variant="secondary" className="mb-3">{profile.displayName}</Badge>
              <h2 className="text-3xl font-bold text-primary dark:text-foreground">Browse Farm Products</h2>
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
          </>
        )}

        {pageView === "bulk-order" && (
        <section id="bulk-order" className="border-t border-border bg-muted/30 py-14 sm:py-20">
          <div className="container mx-auto max-w-4xl px-4">
            <Card className="border bg-card p-8 shadow-lg">
              <div className="mx-auto mb-8 max-w-2xl text-center">
                  <Badge variant="secondary" className="mb-2">Bulk Orders</Badge>
                  <h3 className="text-2xl font-bold text-primary dark:text-foreground">Request Commercial Farm Quotation</h3>
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
        )}
      </main>

      <Footer compact />

      <button
        type="button"
        className="fixed bottom-[calc(6.75rem+env(safe-area-inset-bottom))] right-4 z-40 inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-emerald-300/35 bg-emerald-600 px-4 font-bold text-white shadow-2xl shadow-emerald-900/30 transition hover:-translate-y-0.5 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 lg:bottom-5 lg:right-5"
        onClick={() => setCartOpen(true)}
      >
        <ShoppingCart className="h-5 w-5" />
        <span className="text-sm">Cart</span>
        <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs tabular-nums">{cartCount}</span>
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
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Delivery weight</span>
                  <span className="font-semibold text-foreground">{cartWeightKg.toFixed(2)} kg</span>
                </div>
              </div>

              {checkoutError && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {checkoutError}
                </div>
              )}

              <Button className="w-full bg-emerald-600 text-white hover:bg-emerald-700" disabled={isBusy} onClick={openInvoiceReview}>
                <CreditCard className="h-4 w-4" />
                Review Invoice & Pay
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
              Your final DF invoice number is issued atomically when the selected payment session is created.
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

          <div className="rounded-2xl border bg-muted/30 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-bold text-foreground">Delivery</p>
                <p className="mt-1 text-xs text-muted-foreground">{cartWeightKg.toFixed(2)} kg shipment. Within Enugu is N5,000; other locations are priced through DHL.</p>
              </div>
              <div className="flex rounded-xl border bg-background p-1 text-xs font-bold">
                <button type="button" onClick={() => { setDeliveryRequested(false); setDeliveryQuote(null); setDeliveryError(null); }} className={`rounded-lg px-3 py-2 ${!deliveryRequested ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>No</button>
                <button type="button" onClick={() => setDeliveryRequested(true)} className={`rounded-lg px-3 py-2 ${deliveryRequested ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>Yes</button>
              </div>
            </div>

            {deliveryRequested && (
              <div className="mt-4 space-y-3 border-t pt-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">Delivery address</p>
                  <Button type="button" size="sm" variant="outline" onClick={useSavedDeliveryAddress}>Use my saved address</Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5"><Label htmlFor="delivery-recipient">Recipient name</Label><Input id="delivery-recipient" required value={deliveryDetails.recipientName} onChange={(event) => { setDeliveryDetails((current) => ({ ...current, recipientName: event.target.value })); setDeliveryQuote(null); }} /></div>
                  <div className="space-y-1.5"><Label htmlFor="delivery-phone">Phone number</Label><Input id="delivery-phone" type="tel" required value={deliveryDetails.phone} onChange={(event) => { setDeliveryDetails((current) => ({ ...current, phone: event.target.value })); setDeliveryQuote(null); }} /></div>
                </div>
                <div className="space-y-1.5"><Label htmlFor="delivery-address">Address</Label><Input id="delivery-address" required value={deliveryDetails.address} onChange={(event) => { setDeliveryDetails((current) => ({ ...current, address: event.target.value })); setDeliveryQuote(null); }} /></div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Select label="State" value={deliveryDetails.state} onChange={(event) => { setDeliveryDetails((current) => ({ ...current, state: event.target.value, localGovernment: "" })); setDeliveryQuote(null); }} options={[{ value: "", label: "Select state" }, ...nigeriaStates.map((state) => ({ value: state, label: state }))]} />
                  <Select label="Local government" disabled={!deliveryDetails.state} value={deliveryDetails.localGovernment} onChange={(event) => { setDeliveryDetails((current) => ({ ...current, localGovernment: event.target.value })); setDeliveryQuote(null); }} options={[{ value: "", label: deliveryDetails.state ? "Select local government" : "Choose a state first" }, ...selectedLocalGovernments.map((localGovernment) => ({ value: localGovernment, label: localGovernment }))]} />
                </div>
                {deliveryDetails.state && deliveryDetails.state !== "Enugu" && <div className="space-y-1.5"><Label htmlFor="delivery-postal-code">Postal code <span className="font-normal text-muted-foreground">(helps DHL price precisely)</span></Label><Input id="delivery-postal-code" inputMode="numeric" value={deliveryDetails.postalCode} onChange={(event) => { setDeliveryDetails((current) => ({ ...current, postalCode: event.target.value })); setDeliveryQuote(null); }} /></div>}
                <Button type="button" variant="outline" className="w-full" disabled={isCalculatingDelivery} onClick={() => void calculateDelivery()}><Truck className="h-4 w-4" />{isCalculatingDelivery ? "Calculating delivery..." : "Calculate delivery"}</Button>
                {deliveryError && <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">{deliveryError}</p>}
                {deliveryQuote && <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm"><div className="flex items-center justify-between gap-3"><span className="font-bold text-foreground">{deliveryQuote.serviceName}</span><span className="font-black text-foreground">{formatCurrency(deliveryQuote.amount)}</span></div><p className="mt-1 text-xs text-muted-foreground">{deliveryQuote.estimatedDelivery}</p><p className="mt-1 text-xs text-muted-foreground">{deliveryQuote.note}</p></div>}
              </div>
            )}
          </div>

          <div className="rounded-xl border bg-muted/30 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Items</span>
              <span className="font-semibold">{cartCount}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Shipment weight</span>
              <span className="font-semibold text-foreground">{cartWeightKg.toFixed(2)} kg</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-lg font-bold text-foreground">
              <span>Amount Due</span>
              <span>{formatCurrency(checkoutTotal)}</span>
            </div>
            {deliveryQuote && <div className="mt-2 flex items-center justify-between text-sm"><span className="text-muted-foreground">Delivery</span><span className="font-semibold text-foreground">{formatCurrency(deliveryQuote.amount)}</span></div>}
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
              Pay with Flutterwave
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
              <p><strong>Invoice:</strong> {lastOrder.invoiceNumber}</p>
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
