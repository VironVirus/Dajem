export type DajemApp = "landing" | "poultry" | "real-estate" | "survey";
export type UserRole = "user" | "admin";
export type InventoryCategory = "livestock" | "feeds" | "produce" | "equipment";
export type InventoryStockStatus = "In Stock" | "Low Stock" | "Out of Stock";
export type BidStatus = "Pending Approval" | "Connected" | "Rejected";
export type SurveyStatus = "Pending Approval" | "In Progress" | "Completed & Sent" | "Rejected";
export type ApprovalStatus = "Pending Approval" | "Approved" | "Rejected";
export type PropertyType = "sale" | "short-let" | "hotel" | "management";
export type PropertyCategory = "apartment" | "suite" | "hotel" | "land" | "commercial" | "short-let";

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
  imageUrl?: string;
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
  imageUrl?: string;
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

export interface PropertyListing {
  id: string;
  title: string;
  location: string;
  price: number;
  type: PropertyType;
  category: PropertyCategory;
  beds?: number;
  baths?: number;
  size: number;
  featured: boolean;
  imageBg: string;
  imageUrl?: string;
  summary: string;
  highlights: string[];
  status: ApprovalStatus;
  submittedByName?: string;
  submittedByEmail?: string;
  submittedByPhone?: string;
  createdAt: string;
  date: string;
}

export interface SurveyService {
  id: string;
  title: string;
  description: string;
  priceFrom: number;
  timeline: string;
  imageUrl?: string;
  color: string;
  status: ApprovalStatus;
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
  backend: "filesystem" | "supabase" | "unconfigured";
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
  propertyListings: PropertyListing[];
  surveyServices: SurveyService[];
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
  propertyListings: PropertyListing[];
  surveyServices: SurveyService[];
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

export interface DajemCompanyProfile {
  id: DajemApp;
  legalName: string;
  displayName: string;
  shortName: string;
  startDate: string;
  registrationNumber: string;
  email: string;
  address: string;
  summary: string;
  services: string[];
}

export interface DajemCompanyLink {
  id: DajemApp;
  name: string;
  envKey: string;
  localUrl: string;
  productionUrl: string;
}

const sharedImageBase = "https://dajem-landing.netlify.app/images";

export const dajemCompanyProfiles: Record<DajemApp, DajemCompanyProfile> = {
  landing: {
    id: "landing",
    legalName: "Dajem Group Limited",
    displayName: "Dajem Group Limited",
    shortName: "Dajem Group",
    startDate: "May 31, 2025",
    registrationNumber: "RC:9581197",
    email: "dajemgrouplimited@gmail.com",
    address: "12 Abakiliki Crescent Street, GRA, Enugu, Enugu State, Nigeria",
    summary:
      "Dajem Group Limited owns and controls the subsidiary companies of Dajem Group and facilitates strategic management across the group.",
    services: [
      "Ownership and control of subsidiary companies",
      "Strategic management",
      "Corporate governance",
      "Shared operations coordination",
    ],
  },
  poultry: {
    id: "poultry",
    legalName: "Dajem Farms Limited",
    displayName: "Dajem Farms Limited",
    shortName: "Dajem Farms",
    startDate: "June 5, 2025",
    registrationNumber: "RC:8539786",
    email: "cyrilprecious28@gmail.com",
    address: "12 Abakiliki Crescent Street, GRA, Enugu, Enugu State, Nigeria",
    summary:
      "Dajem Farms Limited handles farming generally, with the poultry storefront serving as the first digital commerce arm for farm products.",
    services: [
      "General farming",
      "Poultry and livestock operations",
      "Farm produce supply",
      "Agricultural equipment and feed coordination",
    ],
  },
  "real-estate": {
    id: "real-estate",
    legalName: "Dajem Homes Limited",
    displayName: "Dajem Homes Limited",
    shortName: "Dajem Homes",
    startDate: "September 8, 2025",
    registrationNumber: "RC:8805120",
    email: "cyrilprecious28@gmail.com",
    address: "12 Abakiliki Crescent Street, GRA, Enugu, Enugu State, Nigeria",
    summary:
      "Dajem Homes Limited handles short-let apartments and suites, hotel management, hospitality management, real estate development, sales, marketing, consultancy, and property management.",
    services: [
      "Short-let apartments and suites",
      "Hotel and hospitality management",
      "Real estate development",
      "Real estate sales, marketing, and management",
      "Real estate consultancy",
      "Property management",
    ],
  },
  survey: {
    id: "survey",
    legalName: "Dajem Orbital Resources Limited",
    displayName: "Dajem Orbital Resources Limited",
    shortName: "Dajem Orbital",
    startDate: "April 3, 2023",
    registrationNumber: "RC:6922761",
    email: "dajemorbitalresourceslimited@gmail.com",
    address: "Suite 1, First Floor, Squaremeters House, 15 Carter Street, Ogui, Enugu, Enugu State",
    summary:
      "Dajem Orbital Resources Limited provides land surveying, digital mapping, geoinformatics, development management, consultancy, architectural designs, civil engineering, construction, logistics, haulage, and general contracts.",
    services: [
      "Land surveying",
      "Digital mapping",
      "Geoinformatics",
      "Real estate development management and marketing",
      "Consultancy",
      "Architectural designs and supervision",
      "Civil engineering and constructions",
      "Logistics and haulage",
      "General contracts",
    ],
  },
};

export const dajemCompanyLinks: DajemCompanyLink[] = [
  {
    id: "landing",
    name: dajemCompanyProfiles.landing.displayName,
    envKey: "NEXT_PUBLIC_DAJEM_LANDING_URL",
    localUrl: "http://localhost:3000",
    productionUrl: "https://dajem-landing.netlify.app",
  },
  {
    id: "poultry",
    name: dajemCompanyProfiles.poultry.displayName,
    envKey: "NEXT_PUBLIC_DAJEM_POULTRY_URL",
    localUrl: "http://localhost:3001",
    productionUrl: "https://dajem-poultry.netlify.app",
  },
  {
    id: "real-estate",
    name: dajemCompanyProfiles["real-estate"].displayName,
    envKey: "NEXT_PUBLIC_DAJEM_REAL_ESTATE_URL",
    localUrl: "http://localhost:3002",
    productionUrl: "https://dajem-properties.netlify.app",
  },
  {
    id: "survey",
    name: dajemCompanyProfiles.survey.displayName,
    envKey: "NEXT_PUBLIC_DAJEM_SURVEY_URL",
    localUrl: "http://localhost:3003",
    productionUrl: "https://dajem-survey.netlify.app",
  },
];

export const seedInventory: InventoryItem[] = [
  {
    productId: "farm-01",
    name: "Day-Old Broiler Chicks",
    category: "livestock",
    price: 850,
    description: "Healthy day-old broiler chicks for commercial and small-scale poultry farming.",
    stockStatus: "In Stock",
    availableUnits: 340,
    imageBg: "bg-amber-500/10 text-amber-700",
    imageUrl: `${sharedImageBase}/farms-hero.svg`,
  },
  {
    productId: "farm-02",
    name: "Layer Chicks",
    category: "livestock",
    price: 900,
    description: "Layer chicks selected for egg production and resilient farm performance.",
    stockStatus: "Low Stock",
    availableUnits: 48,
    imageBg: "bg-yellow-500/10 text-yellow-700",
    imageUrl: `${sharedImageBase}/farms-hero.svg`,
  },
  {
    productId: "feed-01",
    name: "Dajem Broiler Starter Feed",
    category: "feeds",
    price: 18500,
    description: "Balanced starter feed for early-stage poultry growth and better feed conversion.",
    stockStatus: "In Stock",
    availableUnits: 120,
    imageBg: "bg-emerald-500/10 text-emerald-700",
    imageUrl: `${sharedImageBase}/farms-hero.svg`,
  },
  {
    productId: "produce-01",
    name: "Fresh Farm Eggs",
    category: "produce",
    price: 5200,
    description: "Freshly packed eggs supplied from controlled farm operations.",
    stockStatus: "In Stock",
    availableUnits: 180,
    imageBg: "bg-blue-500/10 text-blue-700",
    imageUrl: `${sharedImageBase}/farms-hero.svg`,
  },
  {
    productId: "equip-01",
    name: "Automatic Bell Drinkers",
    category: "equipment",
    price: 9800,
    description: "Durable waterers for poultry houses and controlled farming setups.",
    stockStatus: "In Stock",
    availableUnits: 65,
    imageBg: "bg-cyan-500/10 text-cyan-700",
    imageUrl: `${sharedImageBase}/farms-hero.svg`,
  },
];

export const seedPropertyListings: PropertyListing[] = [
  {
    id: "prop-01",
    title: "Executive Short-Let Apartment",
    location: "GRA, Enugu",
    price: 85000,
    type: "short-let",
    category: "short-let",
    beds: 2,
    baths: 2,
    size: 140,
    featured: true,
    imageBg: "from-emerald-700/25 to-slate-900/10",
    imageUrl: `${sharedImageBase}/homes-hero.svg`,
    summary: "A serviced short-let apartment positioned for business travellers and family stays in Enugu.",
    highlights: ["Managed hospitality support", "Flexible stay options", "Secure residential setting"],
    status: "Approved",
    createdAt: "2025-09-08T00:00:00.000Z",
    date: "08 Sep 2025",
  },
  {
    id: "prop-02",
    title: "Hospitality Management Suite",
    location: "Enugu, Enugu State",
    price: 180000,
    type: "hotel",
    category: "suite",
    beds: 1,
    baths: 1,
    size: 75,
    featured: true,
    imageBg: "from-blue-700/25 to-emerald-700/10",
    imageUrl: `${sharedImageBase}/homes-hero.svg`,
    summary: "A premium suite concept for hospitality management, hotel operations, and managed stays.",
    highlights: ["Hotel operations ready", "Managed guest services", "Corporate stay friendly"],
    status: "Approved",
    createdAt: "2025-09-08T00:00:00.000Z",
    date: "08 Sep 2025",
  },
  {
    id: "prop-03",
    title: "Real Estate Development Plot",
    location: "Enugu Growth Corridor",
    price: 45000000,
    type: "sale",
    category: "land",
    size: 1200,
    featured: false,
    imageBg: "from-amber-700/25 to-emerald-700/10",
    imageUrl: `${sharedImageBase}/homes-hero.svg`,
    summary: "Development land for investors seeking real estate development, marketing, and management support.",
    highlights: ["Development advisory", "Sales and marketing support", "Property management pathway"],
    status: "Approved",
    createdAt: "2025-09-08T00:00:00.000Z",
    date: "08 Sep 2025",
  },
];

export const seedSurveyServices: SurveyService[] = [
  {
    id: "survey-01",
    title: "Land Surveying",
    description: "Boundary surveys, beacon setting, title support, and field documentation for land owners and developers.",
    priceFrom: 150000,
    timeline: "5-10 working days",
    imageUrl: `${sharedImageBase}/orbital-hero.svg`,
    color: "text-cyan-600 bg-cyan-500/10",
    status: "Approved",
  },
  {
    id: "survey-02",
    title: "Digital Mapping & Geoinformatics",
    description: "Digital maps, GIS layouts, spatial intelligence, and geoinformatics support for planning and development.",
    priceFrom: 300000,
    timeline: "7-14 working days",
    imageUrl: `${sharedImageBase}/orbital-hero.svg`,
    color: "text-indigo-600 bg-indigo-500/10",
    status: "Approved",
  },
  {
    id: "survey-03",
    title: "Architectural Design & Supervision",
    description: "Architectural designs, supervision, real estate development management, and construction coordination.",
    priceFrom: 450000,
    timeline: "Project dependent",
    imageUrl: `${sharedImageBase}/orbital-hero.svg`,
    color: "text-emerald-600 bg-emerald-500/10",
    status: "Approved",
  },
  {
    id: "survey-04",
    title: "Civil Engineering, Logistics & Contracts",
    description: "Civil engineering, constructions, logistics, haulage, consultancy, and general contracts.",
    priceFrom: 500000,
    timeline: "By scope",
    imageUrl: `${sharedImageBase}/orbital-hero.svg`,
    color: "text-amber-600 bg-amber-500/10",
    status: "Approved",
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
  propertyListings: seedPropertyListings,
  surveyServices: seedSurveyServices,
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

  return company.productionUrl;
}

export function getCompanyLinks(activeApp?: DajemApp, currentOrigin?: string) {
  return dajemCompanyLinks.map((company) => ({
    id: company.id,
    name: company.name,
    url: company.id === activeApp ? getAppBaseUrl(company.id, currentOrigin) : getAppBaseUrl(company.id),
  }));
}
