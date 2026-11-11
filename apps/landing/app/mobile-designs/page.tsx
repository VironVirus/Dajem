"use client";

import React, { useState } from "react";
import {
  Header,
  Footer,
  Badge,
  Button,
} from "@repo/ui";
import {
  Compass,
  Building2,
  Sprout,
  Smartphone,
  Sun,
  Moon,
  Layers,
  CheckCircle2,
  MapPin,
  Calculator,
  ShieldCheck,
  Search,
  Heart,
  ShoppingCart,
  Truck,
  Sparkles,
  GitCommit,
  Globe,
  RefreshCw,
  Star,
  ShoppingBag,
  Wallet,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Eye,
  SlidersHorizontal,
  Flame,
  Check,
} from "lucide-react";

type DesignOptionId = 1 | 2 | 3 | 4;
type PhoneThemeMode = "dark" | "light";
type DeviceFrameOS = "ios" | "android";
type ActiveAppView = "orbital" | "homes" | "farms";

interface DesignOptionMeta {
  id: DesignOptionId;
  badge: string;
  title: string;
  subtitle: string;
  concept: string;
  layoutDescription: string;
  uiSignature: string;
}

const DESIGN_OPTIONS: DesignOptionMeta[] = [
  {
    id: 1,
    badge: "Option 01 • Glassmorphic",
    title: "Dynamic Island & Floating Glass",
    subtitle: "Apple iOS 18 & Revolut Super-App",
    concept: "Floating Translucent Feed",
    layoutDescription:
      "A floating pill navigation at the top, frosted glass cards with ambient glows, fluid card feeds, and an elevated floating 4-tab pill dock.",
    uiSignature: "Frosted Glass • Ambient Neon Glows • Floating Pill Dock",
  },
  {
    id: 2,
    badge: "Option 02 • Pro Viewport",
    title: "Split-Screen Map & Telemetry Deck",
    subtitle: "Zillow Pro, AutoCAD Mobile & Uber",
    concept: "Pinned Map (45%) + Data Sheet (55%)",
    layoutDescription:
      "Top half pinned to an interactive live visual map (SURCON Cadastral Grid, interactive Enugu property markers, or cold-chain courier radar) with a draggable high-density data sheet below.",
    uiSignature: "Pinned 45% Map • Interactive Price Pins • 5-Tab Pro Surveyor Dock",
  },
  {
    id: 3,
    badge: "Option 03 • Modular Bento",
    title: "Super-App Bento Hub & Wallet",
    subtitle: "Grab, Gojek & WeChat All-In-One",
    concept: "Unified Home Screen with Bento Tiles",
    layoutDescription:
      "All 3 businesses live on a unified super-app home screen featuring a live DAJEM Group Wallet (₦2,450,000 balance), 4 modular Bento feature tiles, and quick shortcuts.",
    uiSignature: "Unified Wallet Strip • 4 Modular Bento Tiles • 1-Tap Service Launch",
  },
  {
    id: 4,
    badge: "Option 04 • Full-Bleed Stories",
    title: "Full-Bleed Visual Stories & Social E-Com",
    subtitle: "Airbnb Rooms & TikTok/Instagram Shop",
    concept: "Edge-to-Edge Immersive Photography",
    layoutDescription:
      "Edge-to-edge full-bleed photographic cards covering the full screen height with floating glass action capsules, story carousels, and cinematic high-contrast typography.",
    uiSignature: "Edge-to-Edge Full-Screen Photos • Floating Action Capsules • Story Mode",
  },
];

// REAL DAJEM HOMES PROPERTIES
const HOMES_DATA = [
  {
    id: "h1",
    title: "5-Bed Detached Smart Duplex + Pool",
    location: "Golf Estate, GRA Enugu",
    price: "₦185,000,000",
    priceNum: 185000000,
    beds: 5,
    baths: 6,
    size: "650 m²",
    rating: 4.9,
    reviews: 14,
    badge: "Official • C of O",
    surveyTag: "Orbital Surveyed ✓",
    imageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
    mapCoords: { top: "35%", left: "40%" },
  },
  {
    id: "h2",
    title: "Executive Short-Let Penthouse Suite",
    location: "Independence Layout, Enugu",
    price: "₦85,000 / night",
    priceNum: 85000,
    beds: 2,
    baths: 2,
    size: "140 m²",
    rating: 5.0,
    reviews: 28,
    badge: "Verified Host",
    surveyTag: "Title Charted ✓",
    imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
    mapCoords: { top: "55%", left: "65%" },
  },
  {
    id: "h3",
    title: "Twin Commercial & Residential Plots",
    location: "Centenary City Corridor, Enugu",
    price: "₦32,000,000",
    priceNum: 32000000,
    beds: 0,
    baths: 0,
    size: "900 m²",
    rating: 4.8,
    reviews: 9,
    badge: "Registered Survey",
    surveyTag: "SURCON Red Copy ✓",
    imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80",
    mapCoords: { top: "70%", left: "30%" },
  },
];

// REAL DAJEM FARMS PRODUCTS
const FARMS_DATA = [
  {
    id: "f1",
    name: "Prime Farm Broiler Chicken",
    category: "Poultry",
    price: 13500,
    oldPrice: 15000,
    weight: "2.4kg avg",
    badge: "🔥 Best Seller",
    imageUrl: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "f2",
    name: "Jumbo Table Eggs (Crate of 30)",
    category: "Fresh Eggs",
    price: 5200,
    oldPrice: 5800,
    weight: "Crate of 30",
    badge: "Fresh Today",
    imageUrl: "https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "f3",
    name: "Spiced Fire-Grilled Chicken",
    category: "Grills",
    price: 15000,
    oldPrice: 17000,
    weight: "Whole Bird • Hot",
    badge: "Chef Specialty",
    imageUrl: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "f4",
    name: "Fresh Table-Size Catfish (1.5kg)",
    category: "Fish",
    price: 8500,
    oldPrice: 9500,
    weight: "Pond Fresh",
    badge: "Live Catch",
    imageUrl: "https://images.unsplash.com/photo-1534043464124-3be32fe00099?auto=format&fit=crop&w=800&q=80",
  },
];

export default function MobileDesignsPage() {
  const [designOption, setDesignOption] = useState<DesignOptionId>(1);
  const [phoneTheme, setPhoneTheme] = useState<PhoneThemeMode>("dark");
  const [deviceOS, setDeviceOS] = useState<DeviceFrameOS>("ios");

  // Phone states
  const [selectedHomeIdx, setSelectedHomeIdx] = useState(0);
  const [selectedFarmIdx, setSelectedFarmIdx] = useState(0);
  const [cartCount, setCartCount] = useState(2);
  const [cartTotal, setCartTotal] = useState(18700);
  const [surveyPlots, setSurveyPlots] = useState(2);
  const [activeCadLayer, setActiveCadLayer] = useState("Cadastral");
  const [activeStoryIdx, setActiveStoryIdx] = useState(0);
  const [splitMapPinnedHome, setSplitMapPinnedHome] = useState(0);
  const [option3ActiveTab, setOption3ActiveTab] = useState<"hub" | "orbital" | "homes" | "farms">("hub");

  const isLight = phoneTheme === "light";
  const screenBg = isLight ? "bg-[#f8fafc] text-slate-900" : "bg-[#060d1a] text-slate-100";
  const cardBg = isLight ? "bg-white border-slate-200/90 text-slate-900 shadow-sm" : "bg-[#0c1629] border-white/10 text-slate-100 shadow-md";
  const pillMuted = isLight ? "bg-slate-100 text-slate-700 border-slate-200" : "bg-white/5 text-slate-300 border-white/10";
  const textMuted = isLight ? "text-slate-500" : "text-slate-400";

  const activeOption = DESIGN_OPTIONS.find((o) => o.id === designOption)!;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header activeApp="landing" />

      <main className="flex-1 py-8 sm:py-12">
        <div className="container mx-auto px-4 max-w-7xl space-y-8">

          {/* STUDIO COMMAND BANNER */}
          <div className="rounded-3xl border border-border/80 bg-card/95 p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-500 text-xs font-extrabold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  4 Distinct App Architectures • Real E-Commerce Visuals
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                  Pick Your Mobile App Architecture
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Each of the 4 options below represents an <strong>entirely different user experience and layout</strong>:
                  Option 1 is a <strong>Glassmorphic Floating Island Super-App</strong>, Option 2 is a <strong>Split-Screen Pinned Map &amp; Telemetry Deck</strong>, Option 3 is a <strong>Unified Super-App Bento Hub with Group Wallet</strong>, and Option 4 is an <strong>Edge-to-Edge Full-Bleed Social Commerce Experience</strong>.
                </p>
              </div>

              {/* CONTROLS */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <div className="inline-flex rounded-xl bg-muted p-1 border border-border">
                  <button
                    type="button"
                    onClick={() => setPhoneTheme("dark")}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      phoneTheme === "dark" ? "bg-slate-900 text-white shadow" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5 text-cyan-400" />
                    Dark Mode
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhoneTheme("light")}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      phoneTheme === "light" ? "bg-white text-slate-950 shadow" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    Light Mode
                  </button>
                </div>

                <div className="inline-flex rounded-xl bg-muted p-1 border border-border">
                  <button
                    type="button"
                    onClick={() => setDeviceOS("ios")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      deviceOS === "ios" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                     iPhone 16 Pro
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeviceOS("android")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      deviceOS === "android" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    🤖 Android Pixel 9
                  </button>
                </div>
              </div>
            </div>

            {/* 4 CARDS SWITCHER */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-border/70">
              {DESIGN_OPTIONS.map((opt) => {
                const isSelected = designOption === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setDesignOption(opt.id)}
                    className={`text-left p-4 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                      isSelected
                        ? "border-cyan-500 bg-cyan-500/10 shadow-lg scale-[1.02]"
                        : "border-border/80 bg-background/60 hover:border-cyan-500/40"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span
                          className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            isSelected ? "bg-cyan-500 text-slate-950" : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {isSelected ? `Active • Option 0${opt.id}` : `Option 0${opt.id}`}
                        </span>
                      </div>
                      <h2 className="text-sm font-extrabold">{opt.title}</h2>
                      <div className="text-[11px] font-bold text-cyan-500 mb-1">{opt.concept}</div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{opt.layoutDescription}</p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-border/60 text-[10px] font-bold text-muted-foreground">
                      UI: {opt.uiSignature}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ACTIVE OPTION HIGHLIGHT BANNER */}
          <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500 text-slate-950 font-black text-lg flex items-center justify-center shrink-0">
                0{designOption}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold">{activeOption.title} — {activeOption.subtitle}</h3>
                  {designOption === 1 && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase">
                      ✓ Chosen Production Blueprint
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{activeOption.layoutDescription}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold hidden sm:inline-block">
                {activeOption.concept}
              </span>
              <a
                href="/app"
                className="px-3.5 py-1.5 rounded-full bg-cyan-500 text-slate-950 text-xs font-black shadow-md shadow-cyan-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <span>Launch App</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* 3 PHONES DISPLAY STAGE */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

            {/* =============================================================== */}
            {/* PHONE 1: DAJEM ORBITAL                                          */}
            {/* =============================================================== */}
            <div className="flex flex-col items-center">
              <div className="mb-3 flex items-center justify-between w-full max-w-[385px] px-1">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-cyan-500" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-500">
                    1. DAJEM Orbital • Survey CAD
                  </span>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono border-cyan-500/30 text-cyan-400">
                  RC:6922761
                </Badge>
              </div>

              <div
                className={`w-full max-w-[385px] p-[10px] bg-gradient-to-b from-slate-700 via-slate-900 to-slate-950 shadow-2xl border border-white/15 transition-all ${
                  deviceOS === "ios" ? "rounded-[48px]" : "rounded-[32px]"
                }`}
              >
                <div
                  className={`h-[790px] flex flex-col overflow-hidden relative border border-white/10 transition-colors ${
                    deviceOS === "ios" ? "rounded-[38px]" : "rounded-[24px]"
                  } ${screenBg}`}
                >
                  {/* Status Bar */}
                  <div className="px-5 pt-2.5 pb-1 flex items-center justify-between text-[11px] font-extrabold shrink-0 z-20">
                    <span>9:41</span>
                    {deviceOS === "ios" ? (
                      <div className="w-20 h-4 rounded-full bg-black flex items-center justify-end pr-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      </div>
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full bg-black border border-white/20" />
                    )}
                    <span className="font-mono text-[10px] text-cyan-500">RTK-GPS • 5G</span>
                  </div>

                  {/* DYNAMIC RENDERING BY DESIGN OPTION */}
                  {designOption === 1 && (
                    /* OPTION 1: FLOATING GLASS DYNAMIC ISLAND */
                    <div className="flex-1 flex flex-col overflow-hidden">
                      <div className="p-3 border-b flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-900 to-cyan-500 flex items-center justify-center text-white">
                            <Compass className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-black">DAJEM Orbital</div>
                            <div className={`text-[9.5px] ${textMuted}`}>SURCON CAD Studio</div>
                          </div>
                        </div>
                        <div className={`inline-flex rounded-full p-0.5 text-[9px] font-extrabold border ${pillMuted}`}>
                          <span className="px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950">Orbital</span>
                          <span className="px-2 py-0.5 opacity-60">Homes</span>
                          <span className="px-2 py-0.5 opacity-60">Farms</span>
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto p-3 space-y-3">
                        <div className="p-3 rounded-2xl border-2 border-cyan-500/40 bg-cyan-950/20 relative">
                          <div className="text-[10px] font-mono text-cyan-400 font-bold mb-1">UTM 32N • WGS84</div>
                          <svg viewBox="0 0 260 110" className="w-full h-28">
                            <polygon points="40,20 200,16 220,95 55,100" fill="rgba(6,182,212,0.2)" stroke="#06b6d4" strokeWidth="2" strokeDasharray="4 2" />
                            <text x="130" y="60" textAnchor="middle" fill="#06b6d4" fontSize="12" fontWeight="bold">900 SQM • 2 PLOTS</text>
                          </svg>
                        </div>
                        <div className={`p-3 rounded-2xl border space-y-2 ${cardBg}`}>
                          <div className="flex justify-between items-center text-xs font-bold">
                            <span>Perimeter Fee Calculator</span>
                            <span className="text-cyan-400 font-mono">₦450,000</span>
                          </div>
                          <input type="range" min={1} max={10} value={surveyPlots} onChange={(e) => setSurveyPlots(Number(e.target.value))} className="w-full accent-cyan-500" />
                          <button className="w-full py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-black">Lock &amp; Request Sealed Plan</button>
                        </div>
                      </div>

                      <div className="p-3 border-t grid grid-cols-4 text-center text-[9px] font-bold">
                        <span className="text-cyan-400">🗺️ CAD</span>
                        <span className={textMuted}>🧮 Fee</span>
                        <span className={textMuted}>📦 Deeds</span>
                        <span className={textMuted}>🛰️ GPS</span>
                      </div>
                    </div>
                  )}

                  {designOption === 2 && (
                    /* OPTION 2: PINNED MAP (45%) + PRO DATA SHEET (55%) */
                    <div className="flex-1 flex flex-col overflow-hidden">
                      {/* Pinned 45% Top Vector Map */}
                      <div className="h-[45%] bg-[#031122] border-b-2 border-cyan-500/40 relative p-2.5 flex flex-col justify-between">
                        <div className="flex justify-between text-[9px] font-mono text-cyan-400 font-bold">
                          <span className="px-1.5 py-0.5 rounded bg-cyan-500/20">SPLIT-CAD VIEWPORT • 1:500</span>
                          <span>LAT: 6.4520° N • LON: 7.5103° E</span>
                        </div>
                        <svg viewBox="0 0 280 130" className="w-full h-28 my-auto">
                          <polygon points="40,25 210,18 226,105 60,115" fill="rgba(6,182,212,0.25)" stroke="#06b6d4" strokeWidth="2.5" />
                          <circle cx="40" cy="25" r="4" fill="#f59e0b" />
                          <circle cx="210" cy="18" r="4" fill="#06b6d4" />
                          <circle cx="226" cy="105" r="4" fill="#06b6d4" />
                          <circle cx="60" cy="115" r="4" fill="#06b6d4" />
                          <text x="135" y="68" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">SURCON PARCEL #8841</text>
                        </svg>
                        <div className="text-[9px] font-mono text-slate-400 flex justify-between bg-black/60 px-2 py-1 rounded">
                          <span>BEACON: PB/EN/8841A</span>
                          <span className="text-cyan-400">651,420.18mE • 712,890.44mN</span>
                        </div>
                      </div>

                      {/* Bottom 55% Pro Action Sheet */}
                      <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        <div className="text-[10px] uppercase tracking-wider font-extrabold text-cyan-400">High-Density Surveyor Telemetry</div>
                        <div className={`p-2 rounded-xl border grid grid-cols-2 gap-2 text-[10px] ${cardBg}`}>
                          <div><span className={textMuted}>Cadastral Zone:</span> <strong>GRA Enugu Prime A</strong></div>
                          <div><span className={textMuted}>Scale:</span> <strong className="font-mono">1:500 Metric</strong></div>
                          <div><span className={textMuted}>Pillars Planted:</span> <strong className="text-emerald-400">4 Planted ✓</strong></div>
                          <div><span className={textMuted}>Red Copy Lodged:</span> <strong className="text-emerald-400">Verified ✓</strong></div>
                        </div>
                        <div className={`p-2.5 rounded-xl border flex items-center justify-between ${cardBg}`}>
                          <div>
                            <div className="text-xs font-black">DHL Plan Dispatch</div>
                            <div className={`text-[10px] ${textMuted}`}>Physical sealed boundary plan</div>
                          </div>
                          <span className="text-xs font-mono font-black text-cyan-400">₦8,500</span>
                        </div>
                        <button className="w-full py-2.5 rounded-xl bg-cyan-500 text-slate-950 text-xs font-black">
                          Export SURCON DWG &amp; Lodgement Receipt ▸
                        </button>
                      </div>

                      <div className="p-2 border-t grid grid-cols-5 text-center text-[9px] font-bold bg-slate-950 text-slate-400">
                        <span className="text-cyan-400">HUD</span>
                        <span>CAD</span>
                        <span>TOPO</span>
                        <span>DEEDS</span>
                        <span>DHL</span>
                      </div>
                    </div>
                  )}

                  {designOption === 3 && (
                    /* OPTION 3: BENTO SERVICE HUB VIEW */
                    <div className="flex-1 flex flex-col overflow-hidden">
                      <div className="p-3 border-b flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Compass className="w-5 h-5 text-cyan-400" />
                          <span className="text-xs font-black">DAJEM Group Super-Hub</span>
                        </div>
                        <span className="text-[9px] font-mono text-cyan-400">BENTO HUB</span>
                      </div>

                      <div className="flex-1 overflow-y-auto p-3 space-y-3">
                        {/* DAJEM Wallet Header */}
                        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-900/60 to-blue-900/60 border border-cyan-500/30">
                          <div className="text-[9.5px] uppercase tracking-wider text-cyan-300 font-bold">DAJEM Unified Escrow Wallet</div>
                          <div className="text-xl font-black font-mono text-white mt-0.5">₦2,450,000</div>
                          <div className="flex gap-2 mt-2">
                            <span className="px-2 py-0.5 rounded bg-white text-slate-950 text-[9px] font-bold">+ Add Funds</span>
                            <span className="px-2 py-0.5 rounded bg-white/20 text-white text-[9px] font-bold">Pay Survey Deposit</span>
                          </div>
                        </div>

                        {/* Bento Grid */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="col-span-2 p-3 rounded-2xl border border-cyan-500/40 bg-cyan-500/10">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-black text-cyan-400">🛰️ DAJEM Orbital CAD</span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-400 text-slate-950 font-bold">2 Active</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground">Plot 4, Golf Estate GRA • Plan lodged</p>
                            <button className="mt-2 text-[10px] font-bold text-cyan-300 underline">Track Boundary Survey &gt;</button>
                          </div>
                          <div className={`p-2.5 rounded-2xl border ${cardBg}`}>
                            <div className="text-xs font-black">🧮 Estimator</div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">Instant Enugu zoning</div>
                          </div>
                          <div className={`p-2.5 rounded-2xl border ${cardBg}`}>
                            <div className="text-xs font-black">📦 DHL Sealed</div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">Enugu, Nationwide</div>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 border-t text-center text-[10px] font-bold text-cyan-400">
                        Bento Workspace Launcher
                      </div>
                    </div>
                  )}

                  {designOption === 4 && (
                    /* OPTION 4: FULL-BLEED CAD BLUEPRINT STORY */
                    <div className="flex-1 flex flex-col relative overflow-hidden bg-[#030d1a]">
                      <div className="absolute inset-0 cad-grid p-4 flex flex-col justify-between z-0">
                        <div className="text-xs font-mono text-cyan-400 font-bold">FULL-BLEED CADASTRAL CANVASES</div>
                        <svg viewBox="0 0 280 200" className="w-full h-44 my-auto">
                          <polygon points="30,30 230,20 250,150 45,170" fill="rgba(6,182,212,0.18)" stroke="#06b6d4" strokeWidth="3" />
                          <text x="140" y="100" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold">900 SQM • PARCEL 8841</text>
                        </svg>
                        <div className="text-[10px] font-mono text-slate-400">BEACON PB/EN/8841A: 651,420mE • 712,890mN</div>
                      </div>

                      {/* Floating Bottom Action Capsule */}
                      <div className="mt-auto p-4 relative z-10 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent space-y-2">
                        <div className="p-3 rounded-2xl bg-slate-900/90 backdrop-blur border border-cyan-500/40 flex justify-between items-center">
                          <div>
                            <div className="text-xs font-black text-white">Full Boundary &amp; C of O Lodgement</div>
                            <div className="text-[10px] text-cyan-400 font-mono">₦450,000 • 5-7 Days Delivery</div>
                          </div>
                          <span className="px-2 py-1 rounded bg-cyan-400 text-slate-950 text-[10px] font-black">Proceed</span>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>

            {/* =============================================================== */}
            {/* PHONE 2: DAJEM HOMES                                            */}
            {/* =============================================================== */}
            <div className="flex flex-col items-center">
              <div className="mb-3 flex items-center justify-between w-full max-w-[385px] px-1">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-blue-500">
                    2. DAJEM Homes • Real Estate
                  </span>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono border-blue-500/30 text-blue-400">
                  RC:8805120
                </Badge>
              </div>

              <div
                className={`w-full max-w-[385px] p-[10px] bg-gradient-to-b from-slate-700 via-slate-900 to-slate-950 shadow-2xl border border-white/15 transition-all ${
                  deviceOS === "ios" ? "rounded-[48px]" : "rounded-[32px]"
                }`}
              >
                <div
                  className={`h-[790px] flex flex-col overflow-hidden relative border border-white/10 transition-colors ${
                    deviceOS === "ios" ? "rounded-[38px]" : "rounded-[24px]"
                  } ${screenBg}`}
                >
                  {/* Status Bar */}
                  <div className="px-5 pt-2.5 pb-1 flex items-center justify-between text-[11px] font-extrabold shrink-0 z-20">
                    <span>9:41</span>
                    {deviceOS === "ios" ? (
                      <div className="w-20 h-4 rounded-full bg-black flex items-center justify-end pr-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      </div>
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full bg-black border border-white/20" />
                    )}
                    <span className="font-mono text-[10px] text-blue-500">VERIFIED • 5G</span>
                  </div>

                  {/* DYNAMIC HOMES RENDERING BY DESIGN OPTION */}
                  {designOption === 1 && (
                    /* OPTION 1: FLOATING GLASS CAROUSEL & SEARCH */
                    <div className="flex-1 flex flex-col overflow-hidden">
                      <div className="p-3 border-b flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-5 h-5 text-blue-500" />
                          <span className="text-xs font-black">DAJEM Homes</span>
                        </div>
                        <div className={`inline-flex rounded-full p-0.5 text-[9px] font-extrabold border ${pillMuted}`}>
                          <span className="px-2 py-0.5 opacity-60">Orbital</span>
                          <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white">Homes</span>
                          <span className="px-2 py-0.5 opacity-60">Farms</span>
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto p-3 space-y-3">
                        {HOMES_DATA.map((h, i) => (
                          <div key={h.id} className={`rounded-2xl border overflow-hidden shadow-sm ${cardBg}`}>
                            <div className="h-36 w-full relative">
                              <img src={h.imageUrl} alt={h.title} className="w-full h-full object-cover" />
                              <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-blue-600 text-white text-[9px] font-bold">{h.badge}</span>
                              <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 text-white text-[9px] font-mono">★ {h.rating}</span>
                            </div>
                            <div className="p-3 space-y-1">
                              <div className="text-base font-black font-mono text-blue-500">{h.price}</div>
                              <h4 className="text-xs font-black">{h.title}</h4>
                              <div className={`text-[10px] ${textMuted}`}>📍 {h.location} • {h.size}</div>
                              <button className="w-full mt-2 py-2 rounded-xl bg-blue-600 text-white text-xs font-extrabold">Place Tracked Bid ▸</button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="p-3 border-t grid grid-cols-4 text-center text-[9px] font-bold">
                        <span className="text-blue-500">Listings</span>
                        <span className={textMuted}>Bids</span>
                        <span className={textMuted}>Saved</span>
                        <span className={textMuted}>Tour</span>
                      </div>
                    </div>
                  )}

                  {designOption === 2 && (
                    /* OPTION 2: PINNED MAP (45%) WITH INTERACTIVE PRICE PINS + BOTTOM DATA SHEET (55%) */
                    <div className="flex-1 flex flex-col overflow-hidden">
                      {/* Pinned 45% Top Enugu Map Viewport with Real Pins */}
                      <div className="h-[45%] bg-[#0f172a] border-b-2 border-blue-500/40 relative overflow-hidden">
                        <img
                          src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80"
                          alt="Enugu Map"
                          className="w-full h-full object-cover opacity-50"
                        />
                        <div className="absolute inset-0 bg-blue-950/40 backdrop-blur-[1px]" />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-blue-600 text-white text-[9px] font-bold">
                          PINNED ENUGU REALTY RADAR
                        </div>

                        {/* Interactive Price Pins on Map */}
                        {HOMES_DATA.map((h, idx) => (
                          <div
                            key={h.id}
                            onClick={() => setSplitMapPinnedHome(idx)}
                            style={{ top: h.mapCoords.top, left: h.mapCoords.left }}
                            className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all ${
                              splitMapPinnedHome === idx ? "scale-110 z-20" : "scale-95 z-10"
                            }`}
                          >
                            <div className={`px-2 py-1 rounded-full font-mono text-[9px] font-black shadow-lg border ${
                              splitMapPinnedHome === idx
                                ? "bg-blue-500 text-white border-white ring-2 ring-blue-400"
                                : "bg-slate-900 text-blue-300 border-blue-500/50"
                            }`}>
                              {h.price.split(" / ")[0]}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Bottom 55% Draggable Data Sheet */}
                      <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        <div className="text-[10px] uppercase font-bold text-blue-400">Selected Map Asset</div>
                        <div className={`p-2.5 rounded-2xl border flex gap-2.5 ${cardBg}`}>
                          <img
                            src={HOMES_DATA[splitMapPinnedHome].imageUrl}
                            alt=""
                            className="w-20 h-20 rounded-xl object-cover shrink-0"
                          />
                          <div className="min-w-0 flex-1 flex flex-col justify-between">
                            <div>
                              <div className="text-sm font-black font-mono text-blue-500">{HOMES_DATA[splitMapPinnedHome].price}</div>
                              <div className="text-xs font-bold truncate">{HOMES_DATA[splitMapPinnedHome].title}</div>
                              <div className={`text-[10px] ${textMuted} truncate`}>📍 {HOMES_DATA[splitMapPinnedHome].location}</div>
                            </div>
                            <span className="text-[9px] text-emerald-400 font-bold">{HOMES_DATA[splitMapPinnedHome].surveyTag}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <button className="py-2.5 rounded-xl bg-blue-600 text-white text-xs font-extrabold shadow">
                            Make Tracked Offer ▸
                          </button>
                          <button className={`py-2.5 rounded-xl border text-xs font-extrabold ${pillMuted}`}>
                            📅 Schedule Tour
                          </button>
                        </div>
                      </div>

                      <div className="p-2 border-t grid grid-cols-5 text-center text-[9px] font-bold bg-slate-950 text-slate-400">
                        <span className="text-blue-500">Radar</span>
                        <span>List</span>
                        <span>Offers</span>
                        <span>Tours</span>
                        <span>Escrow</span>
                      </div>
                    </div>
                  )}

                  {designOption === 3 && (
                    /* OPTION 3: BENTO SERVICE HUB VIEW */
                    <div className="flex-1 flex flex-col overflow-hidden">
                      <div className="p-3 border-b flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-5 h-5 text-blue-500" />
                          <span className="text-xs font-black">DAJEM Homes Portfolio</span>
                        </div>
                        <span className="text-[9px] font-mono text-blue-400">BENTO HUB</span>
                      </div>

                      <div className="flex-1 overflow-y-auto p-3 space-y-3">
                        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-900/60 to-indigo-900/60 border border-blue-500/30">
                          <div className="text-[9.5px] uppercase tracking-wider text-blue-300 font-bold">Verified Escrow Desk</div>
                          <div className="text-base font-extrabold text-white mt-1">Direct Developer &amp; Owner Mandates</div>
                          <div className="text-[10px] text-blue-200 mt-1">All titles pre-charted by DAJEM Orbital</div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="col-span-2 rounded-2xl border border-blue-500/40 overflow-hidden relative h-36">
                            <img src={HOMES_DATA[0].imageUrl} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-2.5 flex flex-col justify-end text-white">
                              <span className="text-[9px] font-bold text-amber-300">FEATURED BENTO PROPERTY</span>
                              <div className="text-sm font-black">{HOMES_DATA[0].title}</div>
                              <div className="text-xs font-mono font-bold text-blue-300">{HOMES_DATA[0].price}</div>
                            </div>
                          </div>
                          <div className={`p-2.5 rounded-2xl border ${cardBg}`}>
                            <div className="text-xs font-black">Short-Lets</div>
                            <div className="text-[10px] text-muted-foreground">From ₦85,000/night</div>
                          </div>
                          <div className={`p-2.5 rounded-2xl border ${cardBg}`}>
                            <div className="text-xs font-black">Serviced Plots</div>
                            <div className="text-[10px] text-muted-foreground">Centenary City ₦32M</div>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 border-t text-center text-[10px] font-bold text-blue-400">
                        Bento Real Estate Desk
                      </div>
                    </div>
                  )}

                  {designOption === 4 && (
                    /* OPTION 4: FULL-BLEED REAL ESTATE STORIES (AIRBNB ROOMS / INSTAGRAM E-COMMERCE) */
                    <div className="flex-1 flex flex-col relative overflow-hidden bg-black text-white">
                      <div className="absolute inset-0">
                        <img
                          src={HOMES_DATA[activeStoryIdx].imageUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/90" />
                      </div>

                      {/* Top Story Bar */}
                      <div className="relative z-10 p-3 flex justify-between items-center">
                        <div className="flex gap-1.5 flex-1 pr-4">
                          {HOMES_DATA.map((_, i) => (
                            <div
                              key={i}
                              onClick={() => setActiveStoryIdx(i)}
                              className={`h-1 flex-1 rounded-full cursor-pointer ${
                                activeStoryIdx === i ? "bg-white" : "bg-white/30"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/60">STORY 0{activeStoryIdx + 1}</span>
                      </div>

                      {/* Floating Bottom Social Commerce Capsule */}
                      <div className="relative z-10 mt-auto p-4 space-y-2">
                        <span className="px-2.5 py-1 rounded-full bg-blue-600 text-white text-[9.5px] font-bold">
                          {HOMES_DATA[activeStoryIdx].badge}
                        </span>
                        <h2 className="text-lg font-black text-white leading-tight">
                          {HOMES_DATA[activeStoryIdx].title}
                        </h2>
                        <div className="text-sm font-black font-mono text-blue-300">
                          {HOMES_DATA[activeStoryIdx].price}
                        </div>
                        <div className="text-xs text-slate-300">
                          📍 {HOMES_DATA[activeStoryIdx].location} • {HOMES_DATA[activeStoryIdx].size}
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2">
                          <button
                            onClick={() => setActiveStoryIdx((s) => (s + 1) % HOMES_DATA.length)}
                            className="py-2.5 rounded-xl bg-white/20 backdrop-blur text-white text-xs font-bold"
                          >
                            Next Asset ❯
                          </button>
                          <button className="py-2.5 rounded-xl bg-blue-600 text-white text-xs font-black shadow-lg">
                            Place Bid Now ▸
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>

            {/* =============================================================== */}
            {/* PHONE 3: DAJEM FARMS                                            */}
            {/* =============================================================== */}
            <div className="flex flex-col items-center">
              <div className="mb-3 flex items-center justify-between w-full max-w-[385px] px-1">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-500">
                    3. DAJEM Farms • Agro Market
                  </span>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono border-emerald-500/30 text-emerald-400">
                  RC:8539786
                </Badge>
              </div>

              <div
                className={`w-full max-w-[385px] p-[10px] bg-gradient-to-b from-slate-700 via-slate-900 to-slate-950 shadow-2xl border border-white/15 transition-all ${
                  deviceOS === "ios" ? "rounded-[48px]" : "rounded-[32px]"
                }`}
              >
                <div
                  className={`h-[790px] flex flex-col overflow-hidden relative border border-white/10 transition-colors ${
                    deviceOS === "ios" ? "rounded-[38px]" : "rounded-[24px]"
                  } ${screenBg}`}
                >
                  {/* Status Bar */}
                  <div className="px-5 pt-2.5 pb-1 flex items-center justify-between text-[11px] font-extrabold shrink-0 z-20">
                    <span>9:41</span>
                    {deviceOS === "ios" ? (
                      <div className="w-20 h-4 rounded-full bg-black flex items-center justify-end pr-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      </div>
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full bg-black border border-white/20" />
                    )}
                    <span className="font-mono text-[10px] text-emerald-500">COLD-CHAIN • 5G</span>
                  </div>

                  {/* DYNAMIC FARMS RENDERING BY DESIGN OPTION */}
                  {designOption === 1 && (
                    /* OPTION 1: FLOATING GLASS 2-COLUMN FOOD STORE */
                    <div className="flex-1 flex flex-col overflow-hidden">
                      <div className="p-3 border-b flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                          <Sprout className="w-5 h-5 text-emerald-500" />
                          <span className="text-xs font-black">DAJEM Farms</span>
                        </div>
                        <div className="px-2.5 py-1 rounded-xl bg-emerald-500 text-slate-950 text-xs font-black">
                          🛒 ₦{cartTotal.toLocaleString()} ({cartCount})
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto p-3 space-y-3">
                        <div className="grid grid-cols-2 gap-2.5">
                          {FARMS_DATA.map((f) => (
                            <div key={f.id} className={`rounded-2xl border overflow-hidden shadow-sm flex flex-col justify-between ${cardBg}`}>
                              <div className="h-24 w-full relative">
                                <img src={f.imageUrl} alt={f.name} className="w-full h-full object-cover" />
                                <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950 text-[8px] font-black">{f.badge}</span>
                              </div>
                              <div className="p-2 space-y-1">
                                <div className="text-[11px] font-black truncate">{f.name}</div>
                                <div className="font-mono text-xs font-black text-emerald-500">₦{f.price.toLocaleString()}</div>
                                <button className="w-full py-1.5 rounded-lg bg-emerald-500 text-slate-950 text-[10px] font-black">+ Add</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-3 border-t grid grid-cols-4 text-center text-[9px] font-bold">
                        <span className="text-emerald-500">Shop</span>
                        <span className={textMuted}>Cut Studio</span>
                        <span className={textMuted}>Cart</span>
                        <span className={textMuted}>Orders</span>
                      </div>
                    </div>
                  )}

                  {designOption === 2 && (
                    /* OPTION 2: PINNED RADAR DISPATCH (45%) + BOTTOM HIGH-DENSITY FOOD LIST (55%) */
                    <div className="flex-1 flex flex-col overflow-hidden">
                      <div className="h-[45%] bg-[#031c11] border-b-2 border-emerald-500/40 relative p-3 flex flex-col justify-between overflow-hidden">
                        <div className="flex justify-between text-[9px] font-mono text-emerald-400 font-bold z-10">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20">COLD-CHAIN DISPATCH RADAR</span>
                          <span>ETA: 24 MINS</span>
                        </div>

                        {/* Radar Simulation Animation */}
                        <div className="my-auto text-center z-10">
                          <div className="w-20 h-20 rounded-full border-2 border-emerald-400/30 mx-auto flex items-center justify-center relative">
                            <div className="w-12 h-12 rounded-full border border-emerald-400/50 flex items-center justify-center">
                              <Truck className="w-6 h-6 text-emerald-400 animate-bounce" />
                            </div>
                          </div>
                          <div className="text-xs font-black text-white mt-1">Uwani Farm Hub ➔ Independence Layout</div>
                          <div className="text-[10px] text-emerald-300">Refrigerated Poultry &amp; Egg Van En Route</div>
                        </div>

                        <div className="text-[9px] font-mono text-slate-400 flex justify-between bg-black/60 px-2 py-1 rounded z-10">
                          <span>TEMPERATURE: +2.4°C</span>
                          <span className="text-emerald-400">STATUS: ON TIME</span>
                        </div>
                      </div>

                      {/* Bottom 55% Food Data Sheet */}
                      <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        <div className="text-[10px] uppercase font-bold text-emerald-400">Active Harvest Items</div>
                        {FARMS_DATA.slice(0, 3).map((f) => (
                          <div key={f.id} className={`p-2 rounded-xl border flex items-center justify-between ${cardBg}`}>
                            <div className="flex items-center gap-2">
                              <img src={f.imageUrl} className="w-10 h-10 rounded-lg object-cover" />
                              <div>
                                <div className="text-[11px] font-black">{f.name}</div>
                                <div className="text-[9.5px] font-mono text-emerald-400">₦{f.price.toLocaleString()}</div>
                              </div>
                            </div>
                            <button className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 text-[10px] font-black">+ Add</button>
                          </div>
                        ))}
                        <button className="w-full py-2.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-black">
                          Instant Flutterwave Checkout (₦{cartTotal.toLocaleString()}) ▸
                        </button>
                      </div>

                      <div className="p-2 border-t grid grid-cols-5 text-center text-[9px] font-bold bg-slate-950 text-slate-400">
                        <span className="text-emerald-500">Radar</span>
                        <span>Shop</span>
                        <span>Cuts</span>
                        <span>Cart</span>
                        <span>Track</span>
                      </div>
                    </div>
                  )}

                  {designOption === 3 && (
                    /* OPTION 3: BENTO SERVICE HUB VIEW */
                    <div className="flex-1 flex flex-col overflow-hidden">
                      <div className="p-3 border-b flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sprout className="w-5 h-5 text-emerald-500" />
                          <span className="text-xs font-black">DAJEM Farms Market</span>
                        </div>
                        <span className="text-[9px] font-mono text-emerald-400">BENTO HUB</span>
                      </div>

                      <div className="flex-1 overflow-y-auto p-3 space-y-3">
                        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-900/60 to-teal-900/60 border border-emerald-500/30">
                          <div className="text-[9.5px] uppercase tracking-wider text-emerald-300 font-bold">Cold-Chain Delivery Pass</div>
                          <div className="text-base font-extrabold text-white mt-1">Free Same-Day Delivery in Enugu</div>
                          <div className="text-[10px] text-emerald-200 mt-1">On orders over ₦30,000</div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="col-span-2 rounded-2xl border border-emerald-500/40 overflow-hidden relative h-36">
                            <img src={FARMS_DATA[0].imageUrl} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-2.5 flex flex-col justify-end text-white">
                              <span className="text-[9px] font-bold text-amber-300">CHICKEN CUT STUDIO</span>
                              <div className="text-sm font-black">{FARMS_DATA[0].name}</div>
                              <div className="text-xs font-mono font-bold text-emerald-300">₦{FARMS_DATA[0].price.toLocaleString()}</div>
                            </div>
                          </div>
                          <div className={`p-2.5 rounded-2xl border ${cardBg}`}>
                            <div className="text-xs font-black">Crate Eggs</div>
                            <div className="text-[10px] text-muted-foreground">₦5,200 (30 pcs)</div>
                          </div>
                          <div className={`p-2.5 rounded-2xl border ${cardBg}`}>
                            <div className="text-xs font-black">Spiced Grill</div>
                            <div className="text-[10px] text-muted-foreground">₦15,000 Hot</div>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 border-t text-center text-[10px] font-bold text-emerald-400">
                        Bento Agro-Food Market
                      </div>
                    </div>
                  )}

                  {designOption === 4 && (
                    /* OPTION 4: FULL-BLEED FOOD COMMERCE STORY (CHOWDECK / TIKTOK SHOP) */
                    <div className="flex-1 flex flex-col relative overflow-hidden bg-black text-white">
                      <div className="absolute inset-0">
                        <img
                          src={FARMS_DATA[selectedFarmIdx].imageUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/90" />
                      </div>

                      <div className="relative z-10 p-3 flex justify-between items-center">
                        <div className="flex gap-1.5 flex-1 pr-4">
                          {FARMS_DATA.map((_, i) => (
                            <div
                              key={i}
                              onClick={() => setSelectedFarmIdx(i)}
                              className={`h-1 flex-1 rounded-full cursor-pointer ${
                                selectedFarmIdx === i ? "bg-white" : "bg-white/30"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/60">PRODUCT 0{selectedFarmIdx + 1}</span>
                      </div>

                      <div className="relative z-10 mt-auto p-4 space-y-2">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[9.5px] font-bold">
                          {FARMS_DATA[selectedFarmIdx].badge}
                        </span>
                        <h2 className="text-lg font-black text-white leading-tight">
                          {FARMS_DATA[selectedFarmIdx].name}
                        </h2>
                        <div className="text-base font-black font-mono text-emerald-300">
                          ₦{FARMS_DATA[selectedFarmIdx].price.toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-300">
                          {FARMS_DATA[selectedFarmIdx].weight} • Direct farm-gate harvest
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2">
                          <button
                            onClick={() => setSelectedFarmIdx((s) => (s + 1) % FARMS_DATA.length)}
                            className="py-2.5 rounded-xl bg-white/20 backdrop-blur text-white text-xs font-bold"
                          >
                            Next Item ❯
                          </button>
                          <button
                            onClick={() => {
                              setCartCount((c) => c + 1);
                              setCartTotal((t) => t + FARMS_DATA[selectedFarmIdx].price);
                            }}
                            className="py-2.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-black shadow-lg"
                          >
                            + Add to Basket ▸
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>

          </div>

          {/* HOSTINGER ZERO-WAIT DEPLOY PIPELINE */}
          <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-lg">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="max-w-xl space-y-1.5">
                <div className="text-xs font-extrabold uppercase tracking-wider text-cyan-500">
                  Hostinger Live Deploy Pipeline
                </div>
                <h3 className="text-xl font-extrabold">
                  Instant Sync: Webapp Code Pushes Live to Android &amp; iPhone Apps
                </h3>
                <p className="text-sm text-muted-foreground">
                  Our mobile architecture uses a hybrid native Capacitor shell (`capacitor.config.json`) pointed to our Hostinger domain (`https://dajemgroup.com`). Whenever you update property photos, add new farm cuts, or adjust survey rates, they deploy live to Android &amp; iPhone devices without waiting for App Store or Play Store approval.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
                <div className="p-3.5 rounded-2xl border border-border bg-background/70">
                  <GitCommit className="w-5 h-5 text-cyan-500 mb-1.5" />
                  <div className="text-xs font-extrabold">1. Git Commit</div>
                  <div className="text-[11px] text-muted-foreground">Code &amp; image edit</div>
                </div>
                <div className="p-3.5 rounded-2xl border border-border bg-background/70">
                  <Globe className="w-5 h-5 text-blue-500 mb-1.5" />
                  <div className="text-xs font-extrabold">2. Hostinger Build</div>
                  <div className="text-[11px] text-muted-foreground">Next.js auto-deploy</div>
                </div>
                <div className="p-3.5 rounded-2xl border border-border bg-background/70">
                  <Smartphone className="w-5 h-5 text-emerald-500 mb-1.5" />
                  <div className="text-xs font-extrabold">3. Capacitor Shell</div>
                  <div className="text-[11px] text-muted-foreground">Streams live server</div>
                </div>
                <div className="p-3.5 rounded-2xl border border-border bg-background/70">
                  <RefreshCw className="w-5 h-5 text-amber-500 mb-1.5" />
                  <div className="text-xs font-extrabold">4. Instant Sync</div>
                  <div className="text-[11px] text-muted-foreground">0-minute wait</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
