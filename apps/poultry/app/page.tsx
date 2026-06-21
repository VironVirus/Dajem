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
  Input,
  Label,
  Select,
  Sheet,
  Textarea,
  getAppBaseUrl,
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

export default function PoultryPage() {
  const {
    snapshot,
    addToCart,
    cartCount,
    currentUser,
    isBusy,
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

  const filteredProducts = snapshot.inventory.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
      || product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const cartTotal = snapshot.cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const handleAddToCart = async (productId: string) => {
    if (!requireAuth("signup")) return;
    await addToCart(productId, 1);
    setCartOpen(true);
  };

  const handleCheckout = async () => {
    if (!requireAuth("login")) return;
    setCheckoutError(null);

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

  return (
    <div className="flex min-h-screen flex-col">
      <Header activeApp="poultry" onCartClick={() => setCartOpen(true)} />

      <main className="flex-1">
        <section className="relative overflow-hidden py-20 bg-gradient-to-br from-amber-500/10 via-transparent to-background">
          <div className="absolute top-0 right-0 h-80 w-80 rounded-full bg-amber-500/5 blur-3xl -z-10" />
          <div className="absolute bottom-10 left-10 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl -z-10" />

          <div className="container mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 md:grid-cols-2">
            <div className="space-y-6">
              <Badge variant="secondary" className="bg-amber-100 px-3 py-1 font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                Sustainable Agriculture
              </Badge>
              <h1 className="text-4xl font-extrabold leading-tight text-primary dark:text-foreground sm:text-5xl">
                Shared Poultry Cart, Live Inventory, and Flutterwave-Ready Checkout
              </h1>
              <p className="text-base leading-relaxed text-muted-foreground">
                Dajem Poultry now runs on the shared Dajem portal. Sign in once, add products to your cart, and track orders from the dashboard across the whole group.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Button
                  size="lg"
                  className="bg-amber-600 text-white hover:bg-amber-700"
                  onClick={() => document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" })}
                >
                  <ShoppingCart className="h-5 w-5" />
                  Shop Catalog
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => cartOpen ? setCartOpen(false) : setCartOpen(true)}
                >
                  Shared Cart ({cartCount})
                </Button>
              </div>
            </div>

            <div className="mx-auto max-w-md space-y-6 rounded-2xl border bg-card p-8 shadow-xl">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Operations Linkage</span>
                  <h4 className="text-lg font-bold text-amber-600">Checkout Status</h4>
                </div>
                <Badge variant="default" className="bg-amber-600 text-white">
                  {snapshot.integrations.flutterwaveConfigured ? "Flutterwave Ready" : "Simulation Mode"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Your cart and order history are tied to the shared Dajem account layer, with Supabase-ready persistence and a live Flutterwave handshake when keys are added.
              </p>
              <div className="grid grid-cols-2 gap-4 border-t border-border pt-4 text-xs font-semibold text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  Cross-app auth cookie
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-emerald-500" />
                  Shared delivery flow
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-500" />
                  Dashboard tracking
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-emerald-500" />
                  Payment callback ready
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="why-us" className="border-y border-border bg-muted/20 py-16">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {[
                {
                  title: "Bio-Secure Incubators",
                  desc: "All breeders are raised under strict veterinary surveillance with early vaccination schedules.",
                  icon: ShieldCheck,
                  color: "text-emerald-500 bg-emerald-500/10",
                },
                {
                  title: "100% Organic Feeds",
                  desc: "Zero hormones, balanced formulations, and transparent stock management through the shared admin portal.",
                  icon: Sparkles,
                  color: "text-amber-500 bg-amber-500/10",
                },
                {
                  title: "Logistics Optimization",
                  desc: "Coordinated fulfillment and route-ready order tracking from the unified dashboard.",
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

        <section id="catalog" className="container mx-auto max-w-6xl px-4 py-20">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <Badge variant="secondary" className="mb-3">Dajem Store</Badge>
              <h2 className="text-3xl font-bold text-primary dark:text-foreground">Browse Farm Products</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Inventory is now centrally managed and visible in the admin portal.
              </p>
            </div>

            <div className="flex w-full flex-col items-center gap-4 sm:flex-row md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground opacity-50" />
                <Input
                  className="h-9 pl-9"
                  placeholder="Search products..."
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
                    { value: "chicks", label: "Day-Old Chicks" },
                    { value: "feeds", label: "Poultry Feeds" },
                    { value: "equipment", label: "Farm Equipment" },
                    { value: "processed", label: "Processed Products" },
                  ]}
                />
              </div>
            </div>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {filteredProducts.map((product) => (
                <Card key={product.productId} className="flex h-full flex-col hover:-translate-y-1 duration-300">
                  <div className={`flex h-40 items-center justify-center rounded-t-xl border-b ${product.imageBg}`}>
                    <Egg className="h-12 w-12 opacity-80" />
                  </div>
                  <CardHeader className="flex-1 p-5">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <Badge variant="outline" className="capitalize">{product.category}</Badge>
                      <span className={`text-xs font-semibold ${product.stockStatus === "In Stock" ? "text-emerald-500" : product.stockStatus === "Low Stock" ? "text-amber-500" : "text-destructive"}`}>
                        {product.stockStatus}
                      </span>
                    </div>
                    <CardTitle className="text-lg font-bold leading-snug">{product.name}</CardTitle>
                    <CardDescription className="mt-1 line-clamp-3 text-xs">{product.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between px-5 pb-4 pt-0">
                    <span className="text-xl font-extrabold text-primary dark:text-foreground">
                      {formatCurrency(product.price)}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {product.availableUnits} left
                    </span>
                  </CardContent>
                  <div className="border-t border-border/50 p-5">
                    <Button
                      className="w-full bg-amber-600 font-semibold text-white hover:bg-amber-700"
                      onClick={() => void handleAddToCart(product.productId)}
                      disabled={product.stockStatus === "Out of Stock" || isBusy}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Add to shared cart
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border bg-card py-16 text-center">
              <p className="text-muted-foreground">No poultry products match your active search or filters.</p>
              <Button variant="outline" className="mt-4" onClick={() => { setSearchTerm(""); setSelectedCategory("all"); }}>
                Reset Filters
              </Button>
            </div>
          )}
        </section>

        <section id="bulk-order" className="border-t border-border bg-muted/30 py-20">
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
                  <Input id="b-name" required placeholder="Farm Manager / Owner" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="b-email">Email Address</Label>
                  <Input id="b-email" type="email" required placeholder="farm@example.com" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="b-phone">Phone Number</Label>
                  <Input id="b-phone" type="tel" required placeholder="+234..." />
                </div>
                <div className="space-y-1.5">
                  <Select
                    label="Desired Product Category"
                    options={[
                      { value: "chicks-bulk", label: "Day-Old Chicks (1,000+)" },
                      { value: "feeds-bulk", label: "Commercial Feed Supply (100+ bags)" },
                      { value: "equip-bulk", label: "Automated Hatchery/Feeding Equipment" },
                    ]}
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="b-notes">Delivery Location & Special Instructions</Label>
                  <Textarea id="b-notes" required rows={4} placeholder="State exact delivery city and specify preferred vaccination schedule..." />
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

      <Sheet
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        title={`Shared Cart${currentUser ? ` for ${currentUser.name}` : ""}`}
      >
        <div className="space-y-5">
          {!currentUser ? (
            <div className="space-y-4 rounded-xl border border-dashed p-5 text-sm text-muted-foreground">
              <p>Sign in to keep your poultry cart synced with the Dajem dashboard.</p>
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
                  <div key={item.productId} className="rounded-xl border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{formatCurrency(item.price)} each</p>
                      </div>
                      <button
                        className="rounded-md border p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        onClick={() => void removeCartItem(item.productId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          className="rounded-md border p-2 hover:bg-accent"
                          onClick={() => void updateCartItem(item.productId, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <button
                          className="rounded-md border p-2 hover:bg-accent"
                          onClick={() => void updateCartItem(item.productId, item.quantity + 1)}
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

              <Button className="w-full bg-amber-600 text-white hover:bg-amber-700" disabled={isBusy} onClick={() => void handleCheckout()}>
                <CreditCard className="h-4 w-4" />
                {snapshot.integrations.flutterwaveConfigured ? "Proceed with Flutterwave" : "Complete simulated checkout"}
              </Button>
            </>
          )}
        </div>
      </Sheet>

      <Dialog isOpen={Boolean(lastOrder)} onClose={() => setLastOrder(null)} title="Order Confirmed">
        {lastOrder && (
          <div className="space-y-4 py-2 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/50">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-semibold text-foreground">Checkout completed</p>
              <p className="text-sm text-muted-foreground">
                Your shared Dajem order has been saved and is now visible in the dashboard.
              </p>
            </div>
            <div className="rounded-lg bg-muted p-4 text-left text-xs font-mono">
              <p><strong>Reference:</strong> {lastOrder.reference}</p>
              <p><strong>Provider:</strong> {lastOrder.provider}</p>
              <p><strong>Total:</strong> {formatCurrency(lastOrder.total)}</p>
            </div>
            <div className="flex gap-3">
              <a href={`${getAppBaseUrl("landing")}/dashboard`} className="w-full">
                <Button className="w-full bg-primary text-white">Open Dashboard</Button>
              </a>
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
              Our B2B sales desk has received your logistics request and will respond with a customized SLA quote.
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
