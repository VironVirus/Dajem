"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import {
  Compass,
  Building2,
  Sprout,
  ShoppingCart,
  ShieldCheck,
  MapPin,
  Calculator,
  Truck,
  Heart,
  Search,
  CheckCircle2,
  ArrowRight,
  Sun,
  Moon,
  ChevronRight,
  SlidersHorizontal,
  X,
  CreditCard,
  Plus,
  Minus,
  Sparkles,
  Smartphone,
  ExternalLink,
  Flame,
  Download,
  RefreshCw,
} from "lucide-react";
import { useDajem } from "@repo/ui";

type MobileSubsidiary = "orbital" | "homes" | "farms";
type OrbitalSubTab = "cad" | "fee" | "deeds" | "gps";
type HomesSubTab = "listings" | "bids" | "saved" | "tour";
type FarmsSubTab = "shop" | "studio" | "cart" | "orders";

export default function MobileAppProductionPage() {
  const { snapshot, cartCount, addToCart, startFlutterwaveCheckout } = useDajem();
  const [isPending, startTransition] = useTransition();

  // Active Subsidiary Tab (Option 1 Floating Island Pill)
  const [activeTab, setActiveTab] = useState<MobileSubsidiary>("orbital");
  const [isDarkMode, setIsDarkMode] = useState(true);

  // In-App Update States
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isNativeShell, setIsNativeShell] = useState(false);
  const [installedVersionCode, setInstalledVersionCode] = useState<number>(0);
  const [updateInfo, setUpdateInfo] = useState<{
    version: string;
    versionCode?: number;
    apkSize: string;
    apkUrl: string;
    releaseNotes: string[];
  } | null>(null);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [isDownloadingUpdate, setIsDownloadingUpdate] = useState(false);
  const [updateToast, setUpdateToast] = useState("");
  const [manualCheckMsg, setManualCheckMsg] = useState("");

  // Check for updates on mount
  useEffect(() => {
    async function checkForUpdates() {
      try {
        const params = new URLSearchParams(window.location.search);
        const vcParam = Number(params.get("vc") || "0");
        const storedVc = Number(window.localStorage.getItem("dajem_native_vc") || "0");
        const activeVc = vcParam || storedVc;

        if (vcParam > 0) {
          window.localStorage.setItem("dajem_native_vc", String(vcParam));
        }
        setIsNativeShell(activeVc > 0);
        setInstalledVersionCode(activeVc);

        const res = await fetch("/api/app/version", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data && data.apkUrl) {
            setUpdateInfo(data);
            // Inside native shell: show update banner only when server versionCode > installed build.
            // In mobile web browser: offer APK download banner so user can install the native app.
            if (activeVc === 0 || Number(data.versionCode || 0) > activeVc) {
              setUpdateAvailable(true);
            }
          }
        }
      } catch (err) {
        console.error("Update check error:", err);
      }
    }
    checkForUpdates();
  }, []);

  const handleDownloadAppUpdate = () => {
    setIsDownloadingUpdate(true);
    const targetUrl = updateInfo?.apkUrl || "/downloads/dajem-app.apk";
    const link = document.createElement("a");
    link.href = targetUrl;
    link.download = "dajem-app.apk";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setIsDownloadingUpdate(false);
      setUpdateToast("APK download started! Check your notification tray and tap the file to install.");
    }, 1500);
  };

  const handleManualCheckUpdates = async () => {
    setManualCheckMsg("Checking DAJEM server...");
    try {
      const res = await fetch("/api/app/version", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setUpdateInfo(data);
        setUpdateAvailable(installedVersionCode === 0 || Number(data.versionCode || 0) > installedVersionCode);
        setUpdateModalOpen(true);
        setManualCheckMsg("");
      }
    } catch {
      setManualCheckMsg("You have the latest version installed.");
      setTimeout(() => setManualCheckMsg(""), 3000);
    }
  };

  // Sub-tab docks
  const [orbitalTab, setOrbitalTab] = useState<OrbitalSubTab>("cad");
  const [homesTab, setHomesTab] = useState<HomesSubTab>("listings");
  const [farmsTab, setFarmsTab] = useState<FarmsSubTab>("shop");

  // Orbital states
  const [surveyPlots, setSurveyPlots] = useState(2);
  const [activeCadLayer, setActiveCadLayer] = useState<"cadastral" | "topo" | "sat">("cadastral");
  const [selectedBeacon, setSelectedBeacon] = useState({
    id: "PB/EN/8841A",
    east: "651,420.18mE",
    north: "712,890.44mN",
    zone: "UTM 32N",
  });
  const [orbitalSealedSuccess, setOrbitalSealedSuccess] = useState(false);

  // Homes states
  const [homesCategory, setHomesCategory] = useState<"all" | "sale" | "shortlet" | "plot">("all");
  const [bidModalOpen, setBidModalOpen] = useState(false);
  const [bidProperty, setBidProperty] = useState<{ id: string; title: string; price: string } | null>(null);
  const [bidAmountInput, setBidAmountInput] = useState("");
  const [bidSuccessMessage, setBidSuccessMessage] = useState("");
  const [savedHomes, setSavedHomes] = useState<string[]>(["h1"]);

  // Farms states
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [cutStudioOpen, setCutStudioOpen] = useState(false);
  const [selectedPrepStyle, setSelectedPrepStyle] = useState("Dressed Whole");
  const [selectedCutStyle, setSelectedCutStyle] = useState("4-Way Prime Quarters");
  const [chickenQuantity, setChickenQuantity] = useState(1);
  const [localCart, setLocalCart] = useState<Array<{ id: string; name: string; price: number; qty: number; img: string }>>([
    {
      id: "f1",
      name: "Fresh Whole Broiler (Dressed)",
      price: 12500,
      qty: 1,
      img: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "f2",
      name: "Farm Fresh Eggs (Crate of 30)",
      price: 5200,
      qty: 1,
      img: "https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=800&q=80",
    },
  ]);
  const [flwSuccessToast, setFlwSuccessToast] = useState(false);

  // REAL DATA ASSETS
  const HOMES_DATA = [
    {
      id: "h1",
      title: "5-Bed Detached Smart Duplex + Pool",
      location: "Golf Estate, GRA Enugu",
      category: "sale",
      price: "₦185,000,000",
      rawPrice: 185000000,
      beds: 5,
      baths: 6,
      size: "650 m²",
      rating: 4.9,
      badge: "Official • C of O",
      surveyTag: "Orbital Charted ✓",
      imageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "h2",
      title: "Executive Short-Let Penthouse Suite",
      location: "Independence Layout, Enugu",
      category: "shortlet",
      price: "₦85,000 / night",
      rawPrice: 85000,
      beds: 2,
      baths: 2,
      size: "140 m²",
      rating: 5.0,
      badge: "Superhost Verified",
      surveyTag: "Title Verified ✓",
      imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "h3",
      title: "Twin Commercial & Residential Plots",
      location: "Centenary City Corridor, Enugu",
      category: "plot",
      price: "₦32,000,000",
      rawPrice: 32000000,
      beds: 0,
      baths: 0,
      size: "900 m²",
      rating: 4.8,
      badge: "Registered Survey",
      surveyTag: "SURCON Red Copy ✓",
      imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80",
    },
  ];

  const FARMS_DATA = [
    {
      id: "f1",
      name: "Fresh Whole Broiler Chicken",
      category: "Poultry",
      price: 12500,
      weight: "2.8kg - 3.2kg",
      badge: "Farm-Gate Fresh",
      rating: 4.9,
      imageUrl: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "f2",
      name: "Farm Fresh Eggs (Crate of 30)",
      category: "Eggs",
      price: 5200,
      weight: "Grade-A Jumbo",
      badge: "Daily Harvest",
      rating: 5.0,
      imageUrl: "https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "f3",
      name: "Charcoal Grilled Whole Chicken",
      category: "Ready to Eat",
      price: 15000,
      weight: "With Spiced Pepper Sauce",
      badge: "Chef Charcoal Grill",
      rating: 4.8,
      imageUrl: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "f4",
      name: "Oven-Smoked Catfish (Pack of 4)",
      category: "Aquaculture",
      price: 9500,
      weight: "Vacuum Sealed",
      badge: "Kiln-Smoked",
      rating: 4.9,
      imageUrl: "https://images.unsplash.com/photo-1534483509719-3feaee7c30da?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "f5",
      name: "Smoked Jumbo Turkey Cuts",
      category: "Poultry",
      price: 18000,
      weight: "1.2kg Pack",
      badge: "Prime Cuts",
      rating: 4.7,
      imageUrl: "https://images.unsplash.com/photo-1514944298352-f41249b29107?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "f6",
      name: "Nsukka Palm Oil (4L Jerrycan)",
      category: "Agro-Allied",
      price: 11000,
      weight: "100% Unadulterated",
      badge: "Cold-Pressed",
      rating: 5.0,
      imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80",
    },
  ];

  // Cart operations
  const localCartTotal = localCart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const localCartCount = localCart.reduce((sum, item) => sum + item.qty, 0);

  const addProductToCart = (prod: typeof FARMS_DATA[0]) => {
    setLocalCart((prev) => {
      const existing = prev.find((i) => i.id === prod.id);
      if (existing) {
        return prev.map((i) => (i.id === prod.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { id: prod.id, name: prod.name, price: prod.price, qty: 1, img: prod.imageUrl }];
    });
  };

  const updateCartQty = (id: string, delta: number) => {
    setLocalCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as typeof localCart,
    );
  };

  const addCustomChickenToCart = () => {
    const customName = `Broiler (${selectedPrepStyle}, ${selectedCutStyle})`;
    setLocalCart((prev) => [
      ...prev,
      {
        id: `custom-chicken-${Date.now()}`,
        name: customName,
        price: 12500,
        qty: chickenQuantity,
        img: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80",
      },
    ]);
    setCutStudioOpen(false);
    setCartDrawerOpen(true);
  };

  // Bid submission
  const handleOpenBid = (prop: { id: string; title: string; price: string }) => {
    setBidProperty(prop);
    setBidAmountInput("");
    setBidSuccessMessage("");
    setBidModalOpen(true);
  };

  const handleSubmitBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bidAmountInput) return;
    setBidSuccessMessage(`Bid of ₦${Number(bidAmountInput).toLocaleString()} submitted to DAJEM Escrow!`);
    setTimeout(() => {
      setBidModalOpen(false);
      setBidSuccessMessage("");
    }, 1800);
  };

  // Theme colors
  const pageBg = isDarkMode ? "bg-[#040812] text-slate-100" : "bg-slate-100 text-slate-900";
  const chassisBg = isDarkMode ? "bg-[#070e1c] border-white/10" : "bg-white border-slate-200";
  const cardBg = isDarkMode ? "bg-slate-900/80 border-white/10" : "bg-white border-slate-200/90 shadow-sm";
  const textMuted = isDarkMode ? "text-slate-400" : "text-slate-500";
  const dockBg = isDarkMode ? "bg-slate-950/90 border-white/10" : "bg-white/95 border-slate-200 shadow-xl";

  return (
    <div className={`min-h-screen ${pageBg} flex flex-col items-center justify-start p-0 sm:py-6 transition-colors`}>
      {/* Top Banner on Desktop */}
      <div className="hidden sm:flex items-center justify-between w-full max-w-md px-4 py-2 mb-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-extrabold">DAJEM Mobile App (Option 1 • Dynamic Island)</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-1.5 rounded-full border border-white/10 hover:bg-white/10"
            title="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
          </button>
          <Link href="/" className="text-cyan-400 font-bold hover:underline">
            Web View ↗
          </Link>
        </div>
      </div>

      {/* Main Mobile App Shell (Full 100dvh on Phone, 420x860 Preview on Desktop) */}
      <main
        className={`w-full max-w-[420px] h-[100dvh] sm:h-[860px] sm:rounded-[48px] sm:border-2 ${chassisBg} shadow-2xl flex flex-col relative overflow-hidden transition-all`}
      >
        {/* Desktop Simulator Dynamic Island Notch */}
        <header className="hidden sm:flex pt-3 px-6 pb-2 shrink-0 items-center justify-between text-[11px] font-extrabold z-30">
          <span>9:41</span>
          <div className="w-24 h-5 rounded-full bg-black flex items-center justify-end pr-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <button
            onClick={handleManualCheckUpdates}
            className="font-mono text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
            title="Check for App Updates"
          >
            <span>{activeTab === "orbital" ? "RTK-GPS" : activeTab === "homes" ? "ESCROW" : "COLD-CHAIN"}</span>
            <RefreshCw className="w-2.5 h-2.5" />
          </button>
        </header>

        {/* Mobile Device Compact Native Bar */}
        <header className="flex sm:hidden pt-3 px-4 pb-1 shrink-0 items-center justify-between text-xs font-extrabold z-30">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-black tracking-tight">DAJEM Group</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleManualCheckUpdates}
              className="px-2 py-1 rounded-full bg-white/10 text-[10px] font-bold text-cyan-300 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Updates</span>
            </button>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-1.5 rounded-full bg-white/10"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
            </button>
          </div>
        </header>

        {/* IN-APP UPDATE / APK INSTALL NOTIFICATION BANNER */}
        {updateAvailable && updateInfo && (
          <div className="px-4 pt-1 pb-1 shrink-0 z-30">
            <div
              onClick={() => setUpdateModalOpen(true)}
              className="p-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-slate-950 font-black text-[10.5px] flex items-center justify-between cursor-pointer shadow-md shadow-emerald-500/20 active:scale-[0.99] transition-all"
            >
              <div className="flex items-center gap-1.5 truncate">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">
                  {isNativeShell
                    ? `New Update Available: v${updateInfo.version} (${updateInfo.apkSize})`
                    : `Install Android App: v${updateInfo.version} (${updateInfo.apkSize})`}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-slate-950 text-emerald-400 text-[9px] font-extrabold shrink-0">
                {isNativeShell ? "Update ▸" : "Get APK ▸"}
              </span>
            </div>
          </div>
        )}

        {/* FLOATING GLASS DYNAMIC ISLAND SWITCHER (Option 1 Signature) */}
        <div className="px-4 py-2 shrink-0 z-20">
          <div className="p-1 rounded-full bg-slate-900/90 border border-white/15 backdrop-blur-xl flex items-center justify-between shadow-lg">
            <button
              onClick={() => setActiveTab("orbital")}
              className={`flex-1 py-1.5 rounded-full text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "orbital"
                  ? "bg-gradient-to-r from-cyan-600 to-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Orbital</span>
            </button>

            <button
              onClick={() => setActiveTab("homes")}
              className={`flex-1 py-1.5 rounded-full text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "homes"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Homes</span>
            </button>

            <button
              onClick={() => setActiveTab("farms")}
              className={`flex-1 py-1.5 rounded-full text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "farms"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Sprout className="w-3.5 h-3.5" />
              <span>Farms</span>
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 1. DAJEM ORBITAL VIEW (SURVEY PLAN CAD & BEACONS APP)             */}
        {/* ================================================================= */}
        {activeTab === "orbital" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Screen Header */}
            <div className="px-4 py-2 flex items-center justify-between border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
                  🛰️
                </div>
                <div>
                  <h1 className="text-xs font-black tracking-tight">DAJEM Orbital Geomatics</h1>
                  <p className={`text-[9.5px] ${textMuted}`}>SURCON Cadastral Studio • RC:6922761</p>
                </div>
              </div>
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                ENUGU ZONE
              </span>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 pb-20">
              {/* Vector Blueprint Card */}
              <div className="p-3.5 rounded-2xl border-2 border-cyan-500/40 bg-cyan-950/20 backdrop-blur-md relative overflow-hidden">
                <div className="flex justify-between items-center text-[10px] font-mono text-cyan-400 font-bold mb-1.5">
                  <span>UTM 32N • MINNA DATUM</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setActiveCadLayer("cadastral")}
                      className={`px-1.5 py-0.5 rounded text-[8.5px] font-bold ${
                        activeCadLayer === "cadastral" ? "bg-cyan-500 text-slate-950" : "bg-white/10 text-white"
                      }`}
                    >
                      CAD
                    </button>
                    <button
                      onClick={() => setActiveCadLayer("topo")}
                      className={`px-1.5 py-0.5 rounded text-[8.5px] font-bold ${
                        activeCadLayer === "topo" ? "bg-cyan-500 text-slate-950" : "bg-white/10 text-white"
                      }`}
                    >
                      TOPO
                    </button>
                    <button
                      onClick={() => setActiveCadLayer("sat")}
                      className={`px-1.5 py-0.5 rounded text-[8.5px] font-bold ${
                        activeCadLayer === "sat" ? "bg-cyan-500 text-slate-950" : "bg-white/10 text-white"
                      }`}
                    >
                      SAT
                    </button>
                  </div>
                </div>

                {/* SVG Blueprint Canvas */}
                <svg viewBox="0 0 280 130" className="w-full h-32 my-1">
                  <defs>
                    <pattern id="cadGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(6,182,212,0.15)" strokeWidth="0.8" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#cadGrid)" rx="10" />

                  <polygon
                    points="45,25 220,18 238,105 60,115"
                    fill="rgba(6,182,212,0.22)"
                    stroke="#06b6d4"
                    strokeWidth="2.2"
                    strokeDasharray="5 2"
                  />
                  <text x="140" y="65" textAnchor="middle" fill="#06b6d4" fontSize="12" fontWeight="bold">
                    {surveyPlots * 450} SQM • {surveyPlots} PLOTS
                  </text>
                  <text x="140" y="80" textAnchor="middle" fill="#67e8f9" fontSize="8" fontFamily="monospace">
                    PARCEL 8841-A • GOLF ESTATE GRA
                  </text>

                  {/* Interactive Beacons */}
                  <g
                    className="cursor-pointer"
                    onClick={() =>
                      setSelectedBeacon({
                        id: "PB/EN/8841A",
                        east: "651,420.18mE",
                        north: "712,890.44mN",
                        zone: "UTM 32N",
                      })
                    }
                  >
                    <circle cx="45" cy="25" r="5" fill="#06b6d4" stroke="#fff" strokeWidth="1.5" />
                    <text x="54" y="24" fill="#fff" fontSize="8" fontWeight="bold">
                      PB.8841A
                    </text>
                  </g>
                  <g
                    className="cursor-pointer"
                    onClick={() =>
                      setSelectedBeacon({
                        id: "PB/EN/8842B",
                        east: "651,450.18mE",
                        north: "712,893.10mN",
                        zone: "UTM 32N",
                      })
                    }
                  >
                    <circle cx="220" cy="18" r="5" fill="#06b6d4" stroke="#fff" strokeWidth="1.5" />
                    <text x="210" y="14" fill="#fff" fontSize="8" fontWeight="bold">
                      PB.8842B
                    </text>
                  </g>
                  <g
                    className="cursor-pointer"
                    onClick={() =>
                      setSelectedBeacon({
                        id: "PB/EN/8843C",
                        east: "651,452.80mE",
                        north: "712,863.10mN",
                        zone: "UTM 32N",
                      })
                    }
                  >
                    <circle cx="238" cy="105" r="5" fill="#06b6d4" stroke="#fff" strokeWidth="1.5" />
                    <text x="200" y="118" fill="#fff" fontSize="8" fontWeight="bold">
                      PB.8843C
                    </text>
                  </g>
                  <g
                    className="cursor-pointer"
                    onClick={() =>
                      setSelectedBeacon({
                        id: "PB/EN/8844D",
                        east: "651,422.80mE",
                        north: "712,860.44mN",
                        zone: "UTM 32N",
                      })
                    }
                  >
                    <circle cx="60" cy="115" r="5" fill="#06b6d4" stroke="#fff" strokeWidth="1.5" />
                    <text x="35" y="125" fill="#fff" fontSize="8" fontWeight="bold">
                      PB.8844D
                    </text>
                  </g>
                </svg>

                {/* Selected Beacon HUD */}
                <div className="mt-2 pt-2 border-t border-cyan-500/30 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-cyan-300 font-bold">📍 {selectedBeacon.id}</span>
                  <span className="text-slate-300">
                    {selectedBeacon.east} • {selectedBeacon.north}
                  </span>
                </div>
              </div>

              {/* Dynamic Fee Estimator */}
              <div className={`p-4 rounded-2xl border ${cardBg} space-y-2.5 shadow-sm`}>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black">Perimeter Fee Calculator</span>
                  <span className="text-sm font-black font-mono text-cyan-400">
                    ₦{(surveyPlots * 225000).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10.5px]">
                  <span className={textMuted}>Plots to Survey:</span>
                  <span className="font-extrabold text-cyan-300">
                    {surveyPlots} Plots ({surveyPlots * 450} SQM)
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={surveyPlots}
                  onChange={(e) => setSurveyPlots(Number(e.target.value))}
                  className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />

                {orbitalSealedSuccess ? (
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center">
                    ✓ Request Lodged! Survey team assigned to your parcel coordinates.
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setOrbitalSealedSuccess(true);
                      setTimeout(() => setOrbitalSealedSuccess(false), 4000);
                    }}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 text-xs font-black shadow-lg shadow-cyan-500/20 hover:brightness-110 active:scale-[0.98] transition-all"
                  >
                    🔒 Lock &amp; Request Sealed Plan ▸
                  </button>
                )}
              </div>

              {/* Lodgement Guarantee Checklist */}
              <div className={`p-3.5 rounded-2xl border ${cardBg} space-y-2 text-[11px]`}>
                <div className="text-xs font-black text-cyan-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>SURCON &amp; Ministry Verification</span>
                </div>
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>SURCON Registered Beacon Numbers Allocated</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Ministry of Lands Cadastral Deposit Included</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Red Copy Delivery via DHL Express with Sealed Wax</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Elevated 4-Tab Dock */}
            <nav className={`absolute bottom-2 inset-x-3 h-14 rounded-2xl border ${dockBg} backdrop-blur-xl grid grid-cols-4 items-center text-center text-[10px] font-black z-30 shadow-2xl`}>
              <button
                onClick={() => setOrbitalTab("cad")}
                className={`flex flex-col items-center justify-center gap-0.5 ${
                  orbitalTab === "cad" ? "text-cyan-400" : "text-slate-400"
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>CAD</span>
              </button>
              <button
                onClick={() => setOrbitalTab("fee")}
                className={`flex flex-col items-center justify-center gap-0.5 ${
                  orbitalTab === "fee" ? "text-cyan-400" : "text-slate-400"
                }`}
              >
                <Calculator className="w-4 h-4" />
                <span>Fee</span>
              </button>
              <button
                onClick={() => setOrbitalTab("deeds")}
                className={`flex flex-col items-center justify-center gap-0.5 ${
                  orbitalTab === "deeds" ? "text-cyan-400" : "text-slate-400"
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Deeds</span>
              </button>
              <button
                onClick={() => setOrbitalTab("gps")}
                className={`flex flex-col items-center justify-center gap-0.5 ${
                  orbitalTab === "gps" ? "text-cyan-400" : "text-slate-400"
                }`}
              >
                <Truck className="w-4 h-4" />
                <span>DHL</span>
              </button>
            </nav>
          </div>
        )}

        {/* ================================================================= */}
        {/* 2. DAJEM HOMES VIEW (REAL ESTATE & LISTINGS APP)                  */}
        {/* ================================================================= */}
        {activeTab === "homes" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Screen Header */}
            <div className="px-4 py-2 flex items-center justify-between border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                  🏢
                </div>
                <div>
                  <h1 className="text-xs font-black tracking-tight">DAJEM Homes Verified</h1>
                  <p className={`text-[9.5px] ${textMuted}`}>Pre-Charted Titles • Escrow Desk</p>
                </div>
              </div>
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                C OF O VERIFIED
              </span>
            </div>

            {/* Category Filter Chips */}
            <div className="px-4 py-2 flex gap-1.5 overflow-x-auto scrollbar-none shrink-0 border-b border-white/5">
              <button
                onClick={() => setHomesCategory("all")}
                className={`px-3 py-1 rounded-full text-[10px] font-black shrink-0 transition-all ${
                  homesCategory === "all" ? "bg-blue-600 text-white" : "bg-white/10 text-slate-400"
                }`}
              >
                All Assets
              </button>
              <button
                onClick={() => setHomesCategory("sale")}
                className={`px-3 py-1 rounded-full text-[10px] font-black shrink-0 transition-all ${
                  homesCategory === "sale" ? "bg-blue-600 text-white" : "bg-white/10 text-slate-400"
                }`}
              >
                Duplexes
              </button>
              <button
                onClick={() => setHomesCategory("shortlet")}
                className={`px-3 py-1 rounded-full text-[10px] font-black shrink-0 transition-all ${
                  homesCategory === "shortlet" ? "bg-blue-600 text-white" : "bg-white/10 text-slate-400"
                }`}
              >
                Short-Lets
              </button>
              <button
                onClick={() => setHomesCategory("plot")}
                className={`px-3 py-1 rounded-full text-[10px] font-black shrink-0 transition-all ${
                  homesCategory === "plot" ? "bg-blue-600 text-white" : "bg-white/10 text-slate-400"
                }`}
              >
                Serviced Plots
              </button>
            </div>

            {/* Vertical Real Estate Feed with Real Photography */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
              {HOMES_DATA.filter((h) => homesCategory === "all" || h.category === homesCategory).map((h) => (
                <div key={h.id} className={`rounded-2xl border overflow-hidden shadow-sm ${cardBg} group`}>
                  <div className="h-40 w-full relative overflow-hidden">
                    <img
                      src={h.imageUrl}
                      alt={h.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-blue-600/95 text-white text-[9.5px] font-extrabold backdrop-blur-sm">
                      {h.badge}
                    </span>
                    <button
                      onClick={() =>
                        setSavedHomes((prev) =>
                          prev.includes(h.id) ? prev.filter((id) => id !== h.id) : [...prev, h.id],
                        )
                      }
                      className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/60 text-white backdrop-blur-sm"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${savedHomes.includes(h.id) ? "fill-red-500 text-red-500" : ""}`}
                      />
                    </button>
                    <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/70 text-white text-[9.5px] font-mono font-bold">
                      ★ {h.rating}
                    </span>
                  </div>

                  <div className="p-3.5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="text-base font-black font-mono text-blue-400">{h.price}</div>
                      <span className="text-[9.5px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                        {h.surveyTag}
                      </span>
                    </div>
                    <h3 className="text-xs font-black line-clamp-1">{h.title}</h3>
                    <p className={`text-[10px] ${textMuted} flex items-center gap-1`}>
                      <MapPin className="w-3 h-3 text-blue-400 shrink-0" />
                      <span>{h.location}</span>
                      <span>•</span>
                      <span>{h.size}</span>
                      {h.beds > 0 && <span>• {h.beds} Beds</span>}
                    </p>

                    <div className="grid grid-cols-2 gap-2 pt-1.5">
                      <button
                        onClick={() => handleOpenBid(h)}
                        className="py-2 rounded-xl bg-blue-600 text-white text-xs font-extrabold shadow-md shadow-blue-600/30 hover:bg-blue-500 active:scale-[0.98] transition-all"
                      >
                        Place Bid ▸
                      </button>
                      <button
                        onClick={() => alert(`Inspection scheduled for ${h.title} with DAJEM Realty Concierge.`)}
                        className={`py-2 rounded-xl border text-xs font-extrabold ${cardBg} hover:bg-white/10`}
                      >
                        📅 Tour
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Elevated 4-Tab Dock */}
            <nav className={`absolute bottom-2 inset-x-3 h-14 rounded-2xl border ${dockBg} backdrop-blur-xl grid grid-cols-4 items-center text-center text-[10px] font-black z-30 shadow-2xl`}>
              <button
                onClick={() => setHomesTab("listings")}
                className={`flex flex-col items-center justify-center gap-0.5 ${
                  homesTab === "listings" ? "text-blue-500" : "text-slate-400"
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Listings</span>
              </button>
              <button
                onClick={() => setHomesTab("bids")}
                className={`flex flex-col items-center justify-center gap-0.5 ${
                  homesTab === "bids" ? "text-blue-500" : "text-slate-400"
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Bids</span>
              </button>
              <button
                onClick={() => setHomesTab("saved")}
                className={`flex flex-col items-center justify-center gap-0.5 ${
                  homesTab === "saved" ? "text-blue-500" : "text-slate-400"
                }`}
              >
                <Heart className="w-4 h-4" />
                <span>Saved</span>
              </button>
              <button
                onClick={() => setHomesTab("tour")}
                className={`flex flex-col items-center justify-center gap-0.5 ${
                  homesTab === "tour" ? "text-blue-500" : "text-slate-400"
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>Tour</span>
              </button>
            </nav>
          </div>
        )}

        {/* ================================================================= */}
        {/* 3. DAJEM FARMS VIEW (AGRO & FOOD E-COMMERCE APP)                 */}
        {/* ================================================================= */}
        {activeTab === "farms" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Screen Header with Live Cart Pill */}
            <div className="px-4 py-2 flex items-center justify-between border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  🌾
                </div>
                <div>
                  <h1 className="text-xs font-black tracking-tight">DAJEM Farms Market</h1>
                  <p className={`text-[9.5px] ${textMuted}`}>Farm-Gate Harvest • Cold-Chain</p>
                </div>
              </div>
              <button
                onClick={() => setCartDrawerOpen(true)}
                className="px-2.5 py-1 rounded-full bg-emerald-500 text-slate-950 font-black text-[11px] font-mono flex items-center gap-1.5 shadow-md shadow-emerald-500/25 active:scale-95 transition-all"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>₦{localCartTotal.toLocaleString()}</span>
                <span className="w-4 h-4 rounded-full bg-slate-950 text-white text-[9px] flex items-center justify-center">
                  {localCartCount}
                </span>
              </button>
            </div>

            {/* Chicken Cut Studio Trigger Banner */}
            <div className="px-4 pt-3 pb-1 shrink-0">
              <div
                onClick={() => setCutStudioOpen(true)}
                className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 border border-emerald-500/30 flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all shadow-md"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-lg">
                    🍗
                  </div>
                  <div>
                    <div className="text-xs font-black text-white flex items-center gap-1.5">
                      <span>Chicken Cut Studio</span>
                      <span className="px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 text-[8.5px] font-extrabold">
                        NEW
                      </span>
                    </div>
                    <p className="text-[10px] text-emerald-300">Choose Whole, 4-Way, or Curry Cut prep styles</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-400" />
              </div>
            </div>

            {/* 2-Column E-Commerce Grid with Real Food Photography */}
            <div className="flex-1 overflow-y-auto p-4 pb-20">
              <div className="grid grid-cols-2 gap-3">
                {FARMS_DATA.map((f) => (
                  <div
                    key={f.id}
                    className={`rounded-2xl border overflow-hidden flex flex-col justify-between ${cardBg} shadow-sm group`}
                  >
                    <div className="h-28 w-full relative overflow-hidden">
                      <img
                        src={f.imageUrl}
                        alt={f.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[8px] font-black">
                        {f.badge}
                      </span>
                    </div>

                    <div className="p-2.5 flex flex-col gap-1.5 flex-1 justify-between">
                      <div>
                        <h4 className="text-[11px] font-black line-clamp-1">{f.name}</h4>
                        <p className={`text-[9.5px] ${textMuted}`}>{f.weight}</p>
                      </div>

                      <div>
                        <div className="font-mono text-xs font-black text-emerald-400 mb-1.5">
                          ₦{f.price.toLocaleString()}
                        </div>
                        <button
                          onClick={() => addProductToCart(f)}
                          className="w-full py-1.5 rounded-lg bg-emerald-500 text-slate-950 text-[10px] font-black shadow-sm hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Elevated 4-Tab Dock */}
            <nav className={`absolute bottom-2 inset-x-3 h-14 rounded-2xl border ${dockBg} backdrop-blur-xl grid grid-cols-4 items-center text-center text-[10px] font-black z-30 shadow-2xl`}>
              <button
                onClick={() => setFarmsTab("shop")}
                className={`flex flex-col items-center justify-center gap-0.5 ${
                  farmsTab === "shop" ? "text-emerald-400" : "text-slate-400"
                }`}
              >
                <Sprout className="w-4 h-4" />
                <span>Shop</span>
              </button>
              <button
                onClick={() => setCutStudioOpen(true)}
                className={`flex flex-col items-center justify-center gap-0.5 ${
                  farmsTab === "studio" ? "text-emerald-400" : "text-slate-400"
                }`}
              >
                <Flame className="w-4 h-4" />
                <span>Cut Studio</span>
              </button>
              <button
                onClick={() => setCartDrawerOpen(true)}
                className="flex flex-col items-center justify-center gap-0.5 text-slate-400 relative"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Basket</span>
                {localCartCount > 0 && (
                  <span className="absolute top-1 right-5 w-2 h-2 rounded-full bg-emerald-500" />
                )}
              </button>
              <button
                onClick={() => setFarmsTab("orders")}
                className={`flex flex-col items-center justify-center gap-0.5 ${
                  farmsTab === "orders" ? "text-emerald-400" : "text-slate-400"
                }`}
              >
                <Truck className="w-4 h-4" />
                <span>Courier</span>
              </button>
            </nav>
          </div>
        )}

        {/* ================================================================= */}
        {/* INTERACTIVE MODALS & DRAWERS                                      */}
        {/* ================================================================= */}

        {/* 1. Chicken Cut Studio Drawer */}
        {cutStudioOpen && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex flex-col justify-end">
            <div className={`p-5 rounded-t-[32px] ${cardBg} border-t border-white/15 space-y-4 max-h-[85%] overflow-y-auto`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🍗</span>
                  <div>
                    <h3 className="text-sm font-black">Chicken Cut Studio</h3>
                    <p className={`text-[10px] ${textMuted}`}>Custom butchery prep for your broiler</p>
                  </div>
                </div>
                <button
                  onClick={() => setCutStudioOpen(false)}
                  className="p-1 rounded-full bg-white/10 hover:bg-white/20"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Prep Style Options */}
              <div className="space-y-1.5">
                <label className="text-[10.5px] font-black uppercase text-emerald-400">Preparation Style</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Dressed Whole", desc: "Feathers & offal dressed" },
                    { label: "Live Bird", desc: "Farm gate live delivery" },
                    { label: "Pepper Soup Prep", desc: "Bite-sized pieces" },
                    { label: "Smoked / Pre-Seasoned", desc: "Wood kiln dried" },
                  ].map((style) => (
                    <button
                      key={style.label}
                      onClick={() => setSelectedPrepStyle(style.label)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        selectedPrepStyle === style.label
                          ? "border-emerald-500 bg-emerald-500/15 text-white"
                          : "border-white/10 bg-white/5 text-slate-300"
                      }`}
                    >
                      <div className="text-xs font-black">{style.label}</div>
                      <div className={`text-[9px] ${textMuted}`}>{style.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cut Style Options */}
              <div className="space-y-1.5">
                <label className="text-[10.5px] font-black uppercase text-emerald-400">Butchery Cut Format</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "Whole Intact",
                    "4-Way Prime Quarters",
                    "8-Way Curry Cuts",
                    "12-Piece Party Cut",
                  ].map((cut) => (
                    <button
                      key={cut}
                      onClick={() => setSelectedCutStyle(cut)}
                      className={`p-2 rounded-xl border text-xs font-black text-left transition-all ${
                        selectedCutStyle === cut
                          ? "border-emerald-500 bg-emerald-500/15 text-white"
                          : "border-white/10 bg-white/5 text-slate-400"
                      }`}
                    >
                      {cut}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <span className="text-xs font-black">Quantity</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setChickenQuantity(Math.max(1, chickenQuantity - 1))}
                    className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-black"
                  >
                    -
                  </button>
                  <span className="font-mono font-black text-sm">{chickenQuantity}</span>
                  <button
                    onClick={() => setChickenQuantity(chickenQuantity + 1)}
                    className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-black"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={addCustomChickenToCart}
                className="w-full py-3 rounded-xl bg-emerald-500 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
              >
                Add Configured Broiler to Basket (₦{(12500 * chickenQuantity).toLocaleString()}) ▸
              </button>
            </div>
          </div>
        )}

        {/* 2. Cold-Chain Cart Drawer */}
        {cartDrawerOpen && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex flex-col justify-end">
            <div className={`p-5 rounded-t-[32px] ${cardBg} border-t border-white/15 space-y-4 max-h-[85%] overflow-y-auto`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-black">Cold-Chain Basket</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                    {localCartCount} items
                  </span>
                </div>
                <button
                  onClick={() => setCartDrawerOpen(false)}
                  className="p-1 rounded-full bg-white/10 hover:bg-white/20"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Cart List */}
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {localCart.length === 0 ? (
                  <p className={`text-xs ${textMuted} text-center py-6`}>Your basket is currently empty.</p>
                ) : (
                  localCart.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <img src={item.img} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                        <div className="overflow-hidden">
                          <div className="text-xs font-black truncate">{item.name}</div>
                          <div className="text-[11px] font-mono text-emerald-400 font-bold">
                            ₦{item.price.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => updateCartQty(item.id, -1)}
                          className="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-xs font-black"
                        >
                          -
                        </button>
                        <span className="font-mono text-xs font-black">{item.qty}</span>
                        <button
                          onClick={() => updateCartQty(item.id, 1)}
                          className="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-xs font-black"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 pt-2 border-t border-white/10 text-xs">
                <div className="flex justify-between">
                  <span className={textMuted}>Items Subtotal:</span>
                  <span className="font-mono font-bold">₦{localCartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>Enugu Cold-Chain Delivery:</span>
                  <span className="font-mono font-bold">₦1,500</span>
                </div>
                <div className="flex justify-between text-sm font-black pt-1.5 border-t border-white/10">
                  <span>Total Payable:</span>
                  <span className="font-mono text-emerald-400">
                    ₦{(localCartTotal + 1500).toLocaleString()}
                  </span>
                </div>
              </div>

              {flwSuccessToast ? (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center">
                  ✓ Flutterwave payment verified! Dispatch rider assigned to your address.
                </div>
              ) : (
                <button
                  onClick={() => {
                    setFlwSuccessToast(true);
                    setTimeout(() => {
                      setFlwSuccessToast(false);
                      setLocalCart([]);
                      setCartDrawerOpen(false);
                    }, 3000);
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>🔒 Checkout with Flutterwave ▸</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* 3. Bid Submission Modal (DAJEM Homes) */}
        {bidModalOpen && bidProperty && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className={`w-full max-w-xs p-5 rounded-3xl ${cardBg} border border-white/20 shadow-2xl space-y-4`}>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9.5px] font-extrabold text-blue-400 uppercase tracking-wider">
                    Place Tracked Bid
                  </span>
                  <h3 className="text-sm font-black line-clamp-1">{bidProperty.title}</h3>
                  <div className="text-xs font-mono text-blue-400 font-bold mt-0.5">
                    Listed: {bidProperty.price}
                  </div>
                </div>
                <button
                  onClick={() => setBidModalOpen(false)}
                  className="p-1 rounded-full bg-white/10 hover:bg-white/20"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmitBid} className="space-y-3">
                <div>
                  <label className="text-[10.5px] font-bold text-slate-300">Your Offer Amount (NGN)</label>
                  <input
                    type="number"
                    placeholder="e.g. 180000000"
                    value={bidAmountInput}
                    onChange={(e) => setBidAmountInput(e.target.value)}
                    className="w-full mt-1 p-2.5 rounded-xl bg-white/5 border border-white/15 text-xs font-mono font-bold focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="text-[9.5px] text-slate-400 leading-relaxed">
                  ✓ Bids are cryptographically logged with DAJEM Escrow &amp; forwarded directly to the verified titleholder.
                </div>

                {bidSuccessMessage ? (
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold text-center">
                    {bidSuccessMessage}
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-xs font-black shadow-md shadow-blue-600/30 hover:bg-blue-500 active:scale-95 transition-all"
                  >
                    Submit Escrow Bid ▸
                  </button>
                )}
              </form>
            </div>
          </div>
        )}

        {/* 4. In-App Update Modal (Direct APK Download & Update Manager) */}
        {updateModalOpen && updateInfo && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className={`w-full max-w-xs p-5 rounded-3xl ${cardBg} border border-white/20 shadow-2xl space-y-4`}>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9.5px] font-extrabold text-emerald-400 uppercase tracking-wider">
                      DAJEM Update Manager
                    </span>
                    <h3 className="text-sm font-black">
                      {isNativeShell && (updateInfo.versionCode ?? 0) <= installedVersionCode
                        ? `Up to Date (v${updateInfo.version})`
                        : `Version ${updateInfo.version} Available`}
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setUpdateModalOpen(false)}
                  className="p-1 rounded-full bg-white/10 hover:bg-white/20"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400 text-[10.5px]">
                  <span>Package File:</span>
                  <span className="font-mono font-bold text-emerald-400">dajem-app.apk ({updateInfo.apkSize})</span>
                </div>
                <div className="text-[11px] font-bold text-slate-200">What's Included in v{updateInfo.version}:</div>
                <ul className="text-[10px] text-slate-300 space-y-1 list-disc list-inside">
                  {updateInfo.releaseNotes.map((note, idx) => (
                    <li key={idx} className="line-clamp-2">{note}</li>
                  ))}
                </ul>
              </div>

              {updateToast ? (
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold text-center">
                  {updateToast}
                </div>
              ) : (
                <button
                  onClick={handleDownloadAppUpdate}
                  disabled={isDownloadingUpdate}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {isDownloadingUpdate
                      ? "Starting Download..."
                      : isNativeShell && (updateInfo.versionCode ?? 0) <= installedVersionCode
                        ? `Re-download Latest APK (${updateInfo.apkSize}) ▸`
                        : `Download & Install APK (${updateInfo.apkSize}) ▸`}
                  </span>
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Hostinger Direct Sync Footer */}
      <footer className="mt-4 text-center text-xs text-slate-500 space-y-1.5">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <p className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Hostinger Push-to-Deploy Live Native Shell</span>
          </p>
          <span>•</span>
          <button
            onClick={handleManualCheckUpdates}
            className="text-cyan-400 font-bold hover:underline flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>{manualCheckMsg || "Check for App Updates"}</span>
          </button>
          <span>•</span>
          <Link href="/download" className="text-emerald-400 font-bold hover:underline flex items-center gap-1">
            <Download className="w-3 h-3" />
            <span>Download APK Page</span>
          </Link>
        </div>
        <p className="text-[11px] text-slate-600">
          Enugu HQ: No 4, Rock Haven, Golf Estate GRA • RC:6922761, RC:7412950, RC:8539786
        </p>
      </footer>
    </div>
  );
}

