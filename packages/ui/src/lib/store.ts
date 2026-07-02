export type DajemApp = "landing" | "poultry" | "real-estate" | "survey";
export type UserRole = "user" | "admin";
export type InventoryCategory = "livestock" | "grills" | "eggs" | "consultancy" | "produce" | "equipment" | "agro-allied";
export type InventoryStockStatus = "In Stock" | "Low Stock" | "Out of Stock";
export type BidStatus = "Pending Approval" | "Connected" | "Rejected";
export type SurveyStatus = "Pending Approval" | "In Progress" | "Completed & Sent" | "Rejected";
export type ApprovalStatus = "Pending Approval" | "Approved" | "Rejected";
export type PropertyType = "sale" | "short-let" | "hotel" | "management";
export type PropertyCategory = "apartment" | "suite" | "hotel" | "land" | "commercial" | "short-let";
export type IdentificationType = "Drivers License" | "NIN" | "International Passport" | "Voters Card";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt: string;
  officialTitle?: string;
  identificationType?: IdentificationType;
  identificationNumber?: string;
  identificationImageUrl?: string;
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
  age?: string;
  weight?: string;
  originalPrice?: number;
  promoPrice?: number;
  promoEndsAt?: string;
  promoLabel?: string;
}

export interface CartItem {
  productId: string;
  variantKey?: string;
  variantLabel?: string;
  name: string;
  category: InventoryCategory;
  price: number;
  quantity: number;
  description: string;
  stockStatus: InventoryStockStatus;
  imageBg: string;
  imageUrl?: string;
  age?: string;
  weight?: string;
  originalPrice?: number;
  promoPrice?: number;
  promoEndsAt?: string;
  promoLabel?: string;
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
  applicationNumber?: string;
  acquisitionSource?: "community" | "estate-developer" | "dajem" | "other";
  acquisitionCompany?: string;
  hasExistingSurveyPlan?: boolean;
  planNumber?: string;
  planYear?: string;
  billingType?: "Change of Title" | "New Survey" | "Full Survey" | "Service Request";
  uploadedDocuments?: string[];
  documentAttachments?: {
    documentName: string;
    fileName: string;
    fileSizeKb: number;
  }[];
  missingDocuments?: string[];
  attested?: boolean;
  processingNote?: string;
  paymentStatus?: "Awaiting Review" | "Payment Link Sent" | "Paid";
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

const farmsImageUrl = "https://dajem-poultry.netlify.app/images/farms-hero-farm-v2.png";
const homesImageUrl = "https://dajem-properties.netlify.app/images/homes-hero-suite-v2.png";
const orbitalImageUrl = "https://dajem-survey.netlify.app/images/orbital-hero-field-v2.png";

export const dajemCompanyProfiles: Record<DajemApp, DajemCompanyProfile> = {
  landing: {
    id: "landing",
    legalName: "DAJEM Group Limited",
    displayName: "DAJEM Group Limited",
    shortName: "DAJEM Group",
    startDate: "May, 2026",
    registrationNumber: "RC:9581197",
    email: "group@dajemgroup.com",
    address: "First Floor, 1B Niger Close, Uwani Enugu, Enugu South Local Government Area, Enugu state",
    summary:
      "DAJEM Group Limited owns and coordinates the subsidiary companies within the DAJEM group structure through shared strategy, governance, and oversight.",
    services: [
      "Ownership and control of subsidiary companies",
      "Strategic management",
      "Corporate governance",
      "Shared operations coordination",
    ],
  },
  poultry: {
    id: "poultry",
    legalName: "DAJEM Farms Limited",
    displayName: "DAJEM Farms Limited",
    shortName: "DAJEM Farms",
    startDate: "June 7, 2025",
    registrationNumber: "RC:8539786",
    email: "group@dajemgroup.com",
    address: "First Floor, 1B, Niger Close, Uwani, Enugu, Enugu State, Nigeria",
    summary:
      "DAJEM Farms Limited supplies livestock, grills, eggs, farm produce, farm equipment, agro-allied products, and farm consultancy services.",
    services: [
      "Livestock supply",
      "Chicken and fish grills",
      "Egg supply",
      "Farm consultancy",
      "Farm produce",
      "Farm equipment",
      "Agro-allied products",
    ],
  },
  "real-estate": {
    id: "real-estate",
    legalName: "DAJEM Homes Limited",
    displayName: "DAJEM Homes Limited",
    shortName: "DAJEM Homes",
    startDate: "September 8, 2025",
    registrationNumber: "RC:8805120",
    email: "group@dajemgroup.com",
    address: "First Floor, 1B, Niger Close, Uwani, Enugu, Enugu State, Nigeria",
    summary:
      "DAJEM Homes Limited handles short-let apartments and suites, hotel management, hospitality management, real estate development, sales, marketing, consultancy, and property management.",
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
    legalName: "DAJEM Orbital Resources Limited",
    displayName: "DAJEM Orbital Resources Limited",
    shortName: "DAJEM Orbital",
    startDate: "April 3, 2023",
    registrationNumber: "RC:6922761",
    email: "dajemorbitalresourceslimited@gmail.com",
    address: "First Floor, 1B Niger Close, Uwani Enugu, Enugu South Local Government Area, Enugu state",
    summary:
      "DAJEM Orbital Resources Limited provides land surveying, digital mapping, geoinformatics, development management, consultancy, architectural designs, civil engineering, construction, logistics, haulage, and general contracts.",
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
    id: "survey",
    name: dajemCompanyProfiles.survey.displayName,
    envKey: "NEXT_PUBLIC_DAJEM_SURVEY_URL",
    localUrl: "http://localhost:3003",
    productionUrl: "https://dajem-survey.netlify.app",
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
];

export const seedInventory: InventoryItem[] = [
  {
    productId: "livestock-poultry-01",
    name: "Poultry",
    category: "livestock",
    price: 12500,
    description: "Healthy poultry supplied for household, farm, and bulk purchase needs.",
    stockStatus: "In Stock",
    availableUnits: 340,
    age: "Mature",
    weight: "2.2kg average",
    originalPrice: 14500,
    promoPrice: 12500,
    promoEndsAt: "2026-07-31T23:59:59.000Z",
    promoLabel: "Farm promo",
    imageBg: "bg-emerald-500/10 text-emerald-700",
    imageUrl: farmsImageUrl,
  },
  {
    productId: "livestock-fish-01",
    name: "Catfish",
    category: "livestock",
    price: 8500,
    description: "Fresh farm-raised fish available for retail and bulk supply.",
    stockStatus: "Low Stock",
    availableUnits: 48,
    age: "Table size",
    weight: "1.5kg average",
    imageBg: "bg-cyan-500/10 text-cyan-700",
    imageUrl: farmsImageUrl,
  },
  {
    productId: "livestock-goat-01",
    name: "Goat",
    category: "livestock",
    price: 95000,
    description: "Healthy goat stock available for homes, events, and farm buyers.",
    stockStatus: "In Stock",
    availableUnits: 32,
    age: "Adult",
    weight: "18kg average",
    imageBg: "bg-emerald-500/10 text-emerald-700",
    imageUrl: farmsImageUrl,
  },
  {
    productId: "livestock-sheep-01",
    name: "Sheep",
    category: "livestock",
    price: 110000,
    description: "Farm-managed sheep supplied for livestock buyers and special orders.",
    stockStatus: "In Stock",
    availableUnits: 22,
    age: "Adult",
    weight: "22kg average",
    imageBg: "bg-green-500/10 text-green-700",
    imageUrl: farmsImageUrl,
  },
  {
    productId: "livestock-turkey-01",
    name: "Turkey",
    category: "livestock",
    price: 65000,
    description: "Well-fed turkey stock for festive, retail, and bulk supply.",
    stockStatus: "In Stock",
    availableUnits: 40,
    age: "Mature",
    weight: "5kg average",
    imageBg: "bg-lime-500/10 text-lime-700",
    imageUrl: farmsImageUrl,
  },
  {
    productId: "grill-chicken-01",
    name: "Chicken Grill",
    category: "grills",
    price: 15000,
    description: "Prepared chicken grill for quick orders and event supply.",
    stockStatus: "In Stock",
    availableUnits: 65,
    imageBg: "bg-orange-500/10 text-orange-700",
    imageUrl: farmsImageUrl,
  },
  {
    productId: "grill-fish-01",
    name: "Fish Grill",
    category: "grills",
    price: 18000,
    description: "Prepared fish grill for direct purchase, events, and hospitality orders.",
    stockStatus: "In Stock",
    availableUnits: 55,
    imageBg: "bg-sky-500/10 text-sky-700",
    imageUrl: farmsImageUrl,
  },
  {
    productId: "eggs-crate-01",
    name: "Fresh Farm Eggs",
    category: "eggs",
    price: 5200,
    description: "Freshly packed eggs supplied from controlled farm operations.",
    stockStatus: "In Stock",
    availableUnits: 180,
    imageBg: "bg-yellow-500/10 text-yellow-700",
    imageUrl: farmsImageUrl,
  },
  {
    productId: "consultancy-01",
    name: "Farm Consultancy Session",
    category: "consultancy",
    price: 50000,
    description: "Advisory session for farm setup, livestock planning, sourcing, and operations.",
    stockStatus: "In Stock",
    availableUnits: 20,
    imageBg: "bg-teal-500/10 text-teal-700",
    imageUrl: farmsImageUrl,
  },
  {
    productId: "produce-vegetables-01",
    name: "Seasonal Farm Produce",
    category: "produce",
    price: 12000,
    description: "Seasonal produce packs available for homes, kitchens, and bulk buyers.",
    stockStatus: "In Stock",
    availableUnits: 80,
    imageBg: "bg-green-500/10 text-green-700",
    imageUrl: farmsImageUrl,
  },
  {
    productId: "equip-drinker-01",
    name: "Automatic Bell Drinkers",
    category: "equipment",
    price: 9800,
    description: "Durable waterers for poultry houses and controlled farming setups.",
    stockStatus: "In Stock",
    availableUnits: 65,
    imageBg: "bg-cyan-500/10 text-cyan-700",
    imageUrl: farmsImageUrl,
  },
  {
    productId: "agro-allied-01",
    name: "Agro-Allied Starter Pack",
    category: "agro-allied",
    price: 28000,
    description: "A starter pack of agro-allied supplies for farm support and small operations.",
    stockStatus: "In Stock",
    availableUnits: 45,
    imageBg: "bg-lime-500/10 text-lime-700",
    imageUrl: farmsImageUrl,
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
    imageUrl: homesImageUrl,
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
    imageUrl: homesImageUrl,
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
    imageUrl: homesImageUrl,
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
    title: "Property Search",
    description: "Property search lodgement for land owners, buyers, agents, and development teams.",
    priceFrom: 20000,
    timeline: "Maximum of 3 plots per search",
    imageUrl: orbitalImageUrl,
    color: "text-cyan-600 bg-cyan-500/10",
    status: "Approved",
  },
  {
    id: "survey-02",
    title: "Property Site Inspection",
    description: "Site inspection support for land purchases, development checks, and property verification.",
    priceFrom: 50000,
    timeline: "Per plot",
    imageUrl: orbitalImageUrl,
    color: "text-indigo-600 bg-indigo-500/10",
    status: "Approved",
  },
  {
    id: "survey-03",
    title: "Survey Beacon Reestablishment & Capping",
    description: "Reestablishment of survey beacons and capping for beacons requiring boundary confirmation.",
    priceFrom: 20000,
    timeline: "Per beacon",
    imageUrl: orbitalImageUrl,
    color: "text-emerald-600 bg-emerald-500/10",
    status: "Approved",
  },
  {
    id: "survey-04",
    title: "Boundary, Topography, Layout & Design Services",
    description: "Perimeter survey, boundary survey, topography, detail survey, estate survey, digital mapping, architectural designs, dispute surveys, and related services.",
    priceFrom: 0,
    timeline: "Scale of fees or official meeting",
    imageUrl: orbitalImageUrl,
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
