export type DajemApp = "landing" | "poultry" | "real-estate" | "survey";
export type UserRole = "user" | "admin";
export type InventoryCategory = "chicks" | "feeds" | "equipment" | "processed";
export type InventoryStockStatus = "In Stock" | "Low Stock" | "Out of Stock";
export type BidStatus = "Pending" | "Connected" | "Rejected";
export type SurveyStatus = "Pending" | "In Progress" | "Completed & Sent";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt: string;
}

export interface ServerUser extends User {
  passwordHash: string;
  passwordSalt: string;
}

export interface InventoryItem {
  productId: string;
  name: string;
  category: InventoryCategory;
  price: number;
  description: string;
  stockStatus: InventoryStockStatus;
  availableUnits: number;
  imageBg: string;
}

export interface CartItem {
  productId: string;
  name: string;
  category: InventoryCategory;
  price: number;
  quantity: number;
  description: string;
  stockStatus: InventoryStockStatus;
  imageBg: string;
}

export interface Order {
  id: string;
  userEmail: string;
  items: CartItem[];
  total: number;
  date: string;
  reference: string;
  provider: "Flutterwave" | "Simulation";
  paymentStatus: "Paid" | "Pending" | "Failed";
  status: "Processing" | "Completed";
}

export interface Bid {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyLocation: string;
  propertyPrice: number;
  userName: string;
  userEmail: string;
  userPhone: string;
  bidAmount: number;
  notes?: string;
  status: BidStatus;
  date: string;
}

export interface SurveyRequest {
  id: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  location: string;
  serviceType: string;
  description: string;
  fileName?: string;
  fileSizeKb?: number;
  completedFileName?: string;
  status: SurveyStatus;
  date: string;
}

export interface CommunicationLog {
  id: string;
  userEmail: string;
  channel: "sms" | "email";
  subject: string;
  message: string;
  createdAt: string;
}

export interface CommunicationPreview {
  sms: {
    to: string;
    message: string;
  };
  email: {
    to: string;
    subject: string;
    message: string;
  };
}

export interface PaymentIntent {
  txRef: string;
  userEmail: string;
  amount: number;
  currency: string;
  items: CartItem[];
  provider: "flutterwave" | "mock";
  status: "pending" | "paid" | "failed";
  checkoutUrl?: string;
  transactionId?: string;
  createdAt: string;
}

export interface IntegrationStatus {
  backend: "filesystem" | "supabase";
  supabaseConfigured: boolean;
  flutterwaveConfigured: boolean;
  netlifyConfigured: boolean;
}

export interface DashboardSnapshot {
  currentUser: User | null;
  users: User[];
  cart: CartItem[];
  orders: Order[];
  bids: Bid[];
  surveys: SurveyRequest[];
  inventory: InventoryItem[];
  communicationLogs: CommunicationLog[];
  integrations: IntegrationStatus;
}

export interface PlatformState {
  users: ServerUser[];
  carts: Record<string, CartItem[]>;
  orders: Order[];
  bids: Bid[];
  surveys: SurveyRequest[];
  inventory: InventoryItem[];
  paymentIntents: PaymentIntent[];
  communicationLogs: CommunicationLog[];
}

export interface DajemActionResponse {
  snapshot: DashboardSnapshot;
  message?: string;
  preview?: CommunicationPreview;
  order?: Order;
  payment?: {
    mode: "redirect" | "mock";
    txRef: string;
    checkoutUrl?: string;
  };
}

export interface DajemCompanyLink {
  id: DajemApp;
  name: string;
  envKey: string;
  localUrl: string;
}

export const dajemCompanyLinks: DajemCompanyLink[] = [
  { id: "landing", name: "Dajem Group", envKey: "NEXT_PUBLIC_DAJEM_LANDING_URL", localUrl: "http://localhost:3000" },
  { id: "poultry", name: "Dajem Poultry", envKey: "NEXT_PUBLIC_DAJEM_POULTRY_URL", localUrl: "http://localhost:3001" },
  { id: "real-estate", name: "Dajem Real Estate", envKey: "NEXT_PUBLIC_DAJEM_REAL_ESTATE_URL", localUrl: "http://localhost:3002" },
  { id: "survey", name: "Dajem Survey & Plans", envKey: "NEXT_PUBLIC_DAJEM_SURVEY_URL", localUrl: "http://localhost:3003" },
];

export const seedInventory: InventoryItem[] = [
  {
    productId: "doc-01",
    name: "Day-Old Broiler Chicks (Cobb 500)",
    category: "chicks",
    price: 850,
    description: "Vaccinated, high-yield day-old broiler chicks with excellent feed conversion rates.",
    stockStatus: "In Stock",
    availableUnits: 340,
    imageBg: "bg-amber-500/10 text-amber-600",
  },
  {
    productId: "doc-02",
    name: "Day-Old Layer Chicks (Black Nera)",
    category: "chicks",
    price: 900,
    description: "Highly productive layer breeds optimized for high egg production and robustness.",
    stockStatus: "Low Stock",
    availableUnits: 48,
    imageBg: "bg-yellow-500/10 text-yellow-600",
  },
  {
    productId: "feed-01",
    name: "Dajem Organic Broiler Starter",
    category: "feeds",
    price: 18500,
    description: "Premium feed formulation for maximum early-stage skeletal and muscular development (25kg).",
    stockStatus: "In Stock",
    availableUnits: 120,
    imageBg: "bg-emerald-500/10 text-emerald-600",
  },
  {
    productId: "feed-02",
    name: "Dajem High-Yield Layer Mash",
    category: "feeds",
    price: 16200,
    description: "Formulated with balanced calcium and amino acids for sustained laying performance (25kg).",
    stockStatus: "In Stock",
    availableUnits: 92,
    imageBg: "bg-teal-500/10 text-teal-600",
  },
  {
    productId: "equip-01",
    name: "Automatic Hanging Bell Drinkers",
    category: "equipment",
    price: 9800,
    description: "High-grade plastic waterers with automatic shut-off valves to reduce water wastage.",
    stockStatus: "In Stock",
    availableUnits: 65,
    imageBg: "bg-cyan-500/10 text-cyan-600",
  },
  {
    productId: "equip-02",
    name: "Smart Incubation Unit (120 Eggs)",
    category: "equipment",
    price: 145000,
    description: "Digitally controlled temperature, automatic turning gears, and humidity controllers for home or farm breeding.",
    stockStatus: "Low Stock",
    availableUnits: 9,
    imageBg: "bg-indigo-500/10 text-indigo-600",
  },
  {
    productId: "proc-01",
    name: "Fresh Whole Frozen Broiler Chicken",
    category: "processed",
    price: 4500,
    description: "Organically raised, hygienically processed, and instantly frozen to preserve freshness (1.5kg average).",
    stockStatus: "In Stock",
    availableUnits: 180,
    imageBg: "bg-blue-500/10 text-blue-600",
  },
];

export const emptySnapshot: DashboardSnapshot = {
  currentUser: null,
  users: [],
  cart: [],
  orders: [],
  bids: [],
  surveys: [],
  inventory: seedInventory,
  communicationLogs: [],
  integrations: {
    backend: "filesystem",
    supabaseConfigured: false,
    flutterwaveConfigured: false,
    netlifyConfigured: false,
  },
};

function getConfiguredUrl(envKey: string) {
  const value = process.env[envKey];
  return value && value.trim().length > 0 ? value.trim().replace(/\/$/, "") : null;
}

export function getAppBaseUrl(app: DajemApp, currentOrigin?: string) {
  const company = dajemCompanyLinks.find((entry) => entry.id === app);
  if (!company) return currentOrigin ?? "/";

  if (currentOrigin) {
    return currentOrigin.replace(/\/$/, "");
  }

  const configuredUrl = getConfiguredUrl(company.envKey);
  if (configuredUrl) return configuredUrl;

  if (process.env.NODE_ENV === "development") {
    return company.localUrl;
  }

  return "/";
}

export function getCompanyLinks(activeApp?: DajemApp, currentOrigin?: string) {
  return dajemCompanyLinks.map((company) => ({
    id: company.id,
    name: company.name,
    url: company.id === activeApp ? getAppBaseUrl(company.id, currentOrigin) : getAppBaseUrl(company.id),
  }));
}
