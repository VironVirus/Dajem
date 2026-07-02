import { randomUUID } from "node:crypto";
import type {
  ApprovalStatus,
  Bid,
  BidStatus,
  CartItem,
  CommunicationLog,
  CommunicationPreview,
  DashboardSnapshot,
  InventoryItem,
  InventoryCategory,
  InventoryStockStatus,
  Order,
  PaymentIntent,
  PlatformState,
  PropertyCategory,
  PropertyListing,
  PropertyType,
  ServerUser,
  SurveyService,
  SurveyRequest,
  SurveyStatus,
  User,
} from "../store";
import { getIntegrationStatus, hashPassword, publicUser, readPlatformState, updatePlatformState } from "./platform-backend";

function nowIso() {
  return new Date().toISOString();
}

function formatDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function makeId(prefix: string) {
  return `${prefix}-${randomUUID().slice(0, 8).toUpperCase()}`;
}

function flutterwaveIsConfigured() {
  return Boolean(process.env.FLUTTERWAVE_SECRET_KEY && process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY);
}

function allowMockPayments() {
  return process.env.NODE_ENV !== "production" || process.env.DAJEM_ALLOW_MOCK_PAYMENTS === "true";
}

const farmsImageUrl = "https://dajem-poultry.netlify.app/images/farms-hero-farm-v2.png";
const homesImageUrl = "https://dajem-properties.netlify.app/images/homes-hero-suite-v2.png";
const orbitalImageUrl = "https://dajem-survey.netlify.app/images/orbital-hero-field-v2.png";

function getCurrentUser(state: PlatformState, sessionEmail: string | null) {
  if (!sessionEmail) return null;
  return state.users.find((user) => normalizeEmail(user.email) === normalizeEmail(sessionEmail)) ?? null;
}

function requireUser(state: PlatformState, sessionEmail: string | null) {
  const currentUser = getCurrentUser(state, sessionEmail);
  if (!currentUser) {
    throw new Error("Please log in to continue.");
  }
  return currentUser;
}

function requireAdmin(state: PlatformState, sessionEmail: string | null) {
  const currentUser = requireUser(state, sessionEmail);
  if (currentUser.role !== "admin") {
    throw new Error("Admin access is required for this action.");
  }
  return currentUser;
}

function buildRegistrationPreview(user: User): CommunicationPreview {
  return {
    sms: {
      to: user.phone,
      message: `Hi ${user.name}, your Dajem Group Limited account is active. Visit your dashboard to track Dajem Farms orders, Dajem Homes bids, and Dajem Orbital requests.`,
    },
    email: {
      to: user.email,
      subject: "Welcome to Dajem Group Limited",
      message: `Hello ${user.name}, your unified Dajem portal is now ready. You can move between Dajem Orbital Resources Limited, Dajem Farms Limited, Dajem Homes Limited, and the shared dashboard with one login.`,
    },
  };
}

function previewToLogs(user: User, preview: CommunicationPreview): CommunicationLog[] {
  const createdAt = nowIso();

  return [
    {
      id: randomUUID(),
      userEmail: user.email,
      channel: "sms",
      subject: "SMS Dispatch",
      message: preview.sms.message,
      createdAt,
    },
    {
      id: randomUUID(),
      userEmail: user.email,
      channel: "email",
      subject: preview.email.subject,
      message: preview.email.message,
      createdAt,
    },
  ];
}

function buildEmailLog(userEmail: string, subject: string, message: string): CommunicationLog {
  return {
    id: randomUUID(),
    userEmail,
    channel: "email",
    subject,
    message,
    createdAt: nowIso(),
  };
}

function deriveStockStatus(availableUnits: number): InventoryStockStatus {
  if (availableUnits <= 0) return "Out of Stock";
  if (availableUnits <= 12) return "Low Stock";
  return "In Stock";
}

function cartLineMatches(item: CartItem, productId: string, variantKey?: string) {
  return item.productId === productId && (item.variantKey ?? "") === (variantKey ?? "");
}

function cleanVariant(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function cloneCartItem(
  item: InventoryItem,
  quantity: number,
  variant?: { variantKey?: string; variantLabel?: string },
): CartItem {
  return {
    productId: item.productId,
    variantKey: variant?.variantKey,
    variantLabel: variant?.variantLabel,
    name: item.name,
    category: item.category,
    price: item.promoPrice ?? item.price,
    quantity,
    description: item.description,
    stockStatus: item.stockStatus,
    imageBg: item.imageBg,
    imageUrl: item.imageUrl,
    age: item.age,
    weight: item.weight,
    originalPrice: item.originalPrice,
    promoPrice: item.promoPrice,
    promoEndsAt: item.promoEndsAt,
    promoLabel: item.promoLabel,
  };
}

function snapshotFor(state: PlatformState, sessionEmail: string | null): DashboardSnapshot {
  const currentUser = getCurrentUser(state, sessionEmail);
  const isAdmin = currentUser?.role === "admin";
  const email = currentUser?.email ?? "";

  return {
    currentUser: currentUser ? publicUser(currentUser) : null,
    users: isAdmin ? state.users.map(publicUser) : [],
    cart: email ? state.carts[email] ?? [] : [],
    orders: isAdmin ? state.orders : state.orders.filter((order) => normalizeEmail(order.userEmail) === normalizeEmail(email)),
    bids: isAdmin ? state.bids : state.bids.filter((bid) => normalizeEmail(bid.userEmail) === normalizeEmail(email)),
    surveys: isAdmin ? state.surveys : state.surveys.filter((survey) => normalizeEmail(survey.userEmail) === normalizeEmail(email)),
    inventory: state.inventory,
    propertyListings: isAdmin
      ? state.propertyListings
      : state.propertyListings.filter((listing) => (
        listing.status === "Approved"
        || normalizeEmail(listing.submittedByEmail ?? "") === normalizeEmail(email)
      )),
    surveyServices: isAdmin
      ? state.surveyServices
      : state.surveyServices.filter((service) => service.status === "Approved"),
    communicationLogs: isAdmin
      ? state.communicationLogs
      : state.communicationLogs.filter((log) => normalizeEmail(log.userEmail) === normalizeEmail(email)),
    integrations: getIntegrationStatus(),
  };
}

export async function getSnapshot(sessionEmail: string | null) {
  const state = await readPlatformState();
  return snapshotFor(state, sessionEmail);
}

export async function registerUser(
  sessionEmail: string | null,
  payload: {
    name: string;
    email: string;
    phone: string;
    password: string;
    officialTitle?: string;
    identificationType?: string;
    identificationNumber?: string;
    identificationImageUrl?: string;
  },
) {
  const email = normalizeEmail(String(payload.email ?? ""));
  const name = String(payload.name ?? "").trim();
  const phone = String(payload.phone ?? "").trim();
  const password = String(payload.password ?? "").trim();
  const officialTitle = String(payload.officialTitle ?? "").trim();
  const identificationType = String(payload.identificationType ?? "").trim();
  const identificationNumber = String(payload.identificationNumber ?? "").trim();
  const identificationImageUrl = String(payload.identificationImageUrl ?? "").trim();

  if (!name || !email || !phone || !password) {
    throw new Error("Please complete all signup fields.");
  }

  if (password.length < 8) {
    throw new Error("Please use a password with at least 8 characters.");
  }

  const { result, state } = await updatePlatformState((draft) => {
    const exists = draft.users.some((user) => normalizeEmail(user.email) === email);
    if (exists) {
      throw new Error("An account already exists for that email.");
    }

    const passwordSalt = randomUUID();
    const user: ServerUser = {
      id: `user-${randomUUID()}`,
      name,
      email,
      phone,
      role: "user",
      createdAt: nowIso(),
      passwordSalt,
      passwordHash: hashPassword(password, passwordSalt),
      officialTitle: officialTitle || undefined,
      identificationType: (identificationType as ServerUser["identificationType"]) || undefined,
      identificationNumber: identificationNumber || undefined,
      identificationImageUrl: identificationImageUrl || undefined,
    };

    draft.users.unshift(user);
    draft.carts[user.email] = draft.carts[user.email] ?? [];

    const preview = buildRegistrationPreview(publicUser(user));
    draft.communicationLogs.unshift(...previewToLogs(publicUser(user), preview));

    return { user, preview };
  });

  return {
    sessionEmail: result.user.email,
    preview: result.preview,
    snapshot: snapshotFor(state, result.user.email),
    message: `Welcome aboard, ${result.user.name}.`,
  };
}

export async function loginUser(
  sessionEmail: string | null,
  payload: { email: string; password: string },
) {
  const email = normalizeEmail(String(payload.email ?? ""));
  const password = String(payload.password ?? "").trim();

  if (!email || !password) {
    throw new Error("Please provide both email and password.");
  }

  const state = await readPlatformState();
  const user = state.users.find((entry) => normalizeEmail(entry.email) === email);
  if (!user) {
    throw new Error("Invalid email or password.");
  }

  const hash = hashPassword(password, user.passwordSalt);
  if (hash !== user.passwordHash) {
    throw new Error("Invalid email or password.");
  }

  return {
    sessionEmail: user.email,
    snapshot: snapshotFor(state, user.email),
    message: `Welcome back, ${user.name}.`,
  };
}

export async function addToCart(
  sessionEmail: string | null,
  payload: { productId: string; quantity?: number; variantKey?: string; variantLabel?: string },
) {
  const quantity = Math.max(1, payload.quantity ?? 1);
  const variantKey = cleanVariant(payload.variantKey) || undefined;
  const variantLabel = cleanVariant(payload.variantLabel) || undefined;

  const { state } = await updatePlatformState((draft) => {
    const user = requireUser(draft, sessionEmail);
    const inventoryItem = draft.inventory.find((item) => item.productId === payload.productId);
    if (!inventoryItem) {
      throw new Error("That product is no longer available.");
    }
    if (inventoryItem.availableUnits <= 0) {
      throw new Error("This item is currently out of stock.");
    }

    const cart = draft.carts[user.email] ?? [];
    const existing = cart.find((item) => cartLineMatches(item, payload.productId, variantKey));
    const nextQuantity = Math.min(
      inventoryItem.availableUnits,
      (existing?.quantity ?? 0) + quantity,
    );

    if (existing) {
      existing.quantity = nextQuantity;
      existing.price = inventoryItem.promoPrice ?? inventoryItem.price;
      existing.stockStatus = inventoryItem.stockStatus;
      existing.variantLabel = variantLabel;
    } else {
      cart.push(cloneCartItem(inventoryItem, nextQuantity, { variantKey, variantLabel }));
    }

    draft.carts[user.email] = cart;
  });

  return {
    snapshot: snapshotFor(state, sessionEmail),
    message: "Item added to your shared cart.",
  };
}

export async function updateCartItem(
  sessionEmail: string | null,
  payload: { productId: string; quantity: number; variantKey?: string },
) {
  const variantKey = cleanVariant(payload.variantKey) || undefined;

  const { state } = await updatePlatformState((draft) => {
    const user = requireUser(draft, sessionEmail);
    const cart = draft.carts[user.email] ?? [];
    const existing = cart.find((item) => cartLineMatches(item, payload.productId, variantKey));
    if (!existing) return;

    if (payload.quantity <= 0) {
      draft.carts[user.email] = cart.filter((item) => !cartLineMatches(item, payload.productId, variantKey));
      return;
    }

    const inventoryItem = draft.inventory.find((item) => item.productId === payload.productId);
    if (!inventoryItem) {
      draft.carts[user.email] = cart.filter((item) => !cartLineMatches(item, payload.productId, variantKey));
      return;
    }

    existing.quantity = Math.min(payload.quantity, inventoryItem.availableUnits);
    existing.price = inventoryItem.promoPrice ?? inventoryItem.price;
    existing.stockStatus = inventoryItem.stockStatus;
  });

  return {
    snapshot: snapshotFor(state, sessionEmail),
    message: "Cart updated.",
  };
}

export async function removeCartItem(
  sessionEmail: string | null,
  payload: { productId: string; variantKey?: string },
) {
  const variantKey = cleanVariant(payload.variantKey) || undefined;

  const { state } = await updatePlatformState((draft) => {
    const user = requireUser(draft, sessionEmail);
    draft.carts[user.email] = (draft.carts[user.email] ?? []).filter(
      (item) => !cartLineMatches(item, payload.productId, variantKey),
    );
  });

  return {
    snapshot: snapshotFor(state, sessionEmail),
    message: "Item removed from cart.",
  };
}

export async function clearCart(sessionEmail: string | null) {
  const { state } = await updatePlatformState((draft) => {
    const user = requireUser(draft, sessionEmail);
    draft.carts[user.email] = [];
  });

  return {
    snapshot: snapshotFor(state, sessionEmail),
    message: "Cart cleared.",
  };
}

export async function submitBid(
  sessionEmail: string | null,
  payload: {
    propertyId: string;
    propertyTitle: string;
    propertyLocation: string;
    propertyPrice: number;
    bidAmount: number;
    notes?: string;
  },
) {
  const { state } = await updatePlatformState((draft) => {
    const user = requireUser(draft, sessionEmail);
    const propertyTitle = String(payload.propertyTitle ?? "").trim();
    const propertyLocation = String(payload.propertyLocation ?? "").trim();
    const bidAmount = Number(payload.bidAmount);
    const propertyPrice = Number(payload.propertyPrice);

    if (!propertyTitle || !propertyLocation || !Number.isFinite(bidAmount) || bidAmount <= 0) {
      throw new Error("Please enter a valid bid.");
    }

    const bid: Bid = {
      id: makeId("BID"),
      propertyId: payload.propertyId,
      propertyTitle,
      propertyLocation,
      propertyPrice: Number.isFinite(propertyPrice) ? propertyPrice : 0,
      userName: user.name,
      userEmail: user.email,
      userPhone: user.phone,
      bidAmount,
      notes: payload.notes?.trim() || undefined,
      status: "Pending Approval",
      date: formatDate(),
    };

    draft.bids.unshift(bid);
    draft.communicationLogs.unshift(buildEmailLog(
      user.email,
      "Property bid pending approval",
      `Your bid for ${propertyTitle} has been received by Dajem Homes Limited and is pending approval.`,
    ));
  });

  return {
    snapshot: snapshotFor(state, sessionEmail),
    message: "Bid submitted and marked as pending approval.",
  };
}

export async function submitPropertyListing(
  sessionEmail: string | null,
  payload: {
    title: string;
    location: string;
    price: number;
    type: PropertyType;
    category: PropertyCategory;
    beds?: number;
    baths?: number;
    size: number;
    summary: string;
    highlights?: string[];
    imageUrl?: string;
  },
) {
  const { state } = await updatePlatformState((draft) => {
    const user = requireUser(draft, sessionEmail);
    const title = String(payload.title ?? "").trim();
    const location = String(payload.location ?? "").trim();
    const price = Number(payload.price);
    const size = Number(payload.size);
    const summary = String(payload.summary ?? "").trim();

    if (!title || !location || !summary || !Number.isFinite(price) || price <= 0 || !Number.isFinite(size) || size <= 0) {
      throw new Error("Please complete the property submission details.");
    }

    const listing: PropertyListing = {
      id: makeId("PROP"),
      title,
      location,
      price,
      type: payload.type ?? "sale",
      category: payload.category ?? "apartment",
      beds: payload.beds ? Math.max(0, Number(payload.beds)) : undefined,
      baths: payload.baths ? Math.max(0, Number(payload.baths)) : undefined,
      size,
      featured: false,
      imageBg: "from-emerald-700/25 to-slate-900/10",
      imageUrl: payload.imageUrl?.trim() || homesImageUrl,
      summary,
      highlights: (payload.highlights ?? []).map((item) => String(item).trim()).filter(Boolean).slice(0, 6),
      status: "Pending Approval",
      submittedByName: user.name,
      submittedByEmail: user.email,
      submittedByPhone: user.phone,
      createdAt: nowIso(),
      date: formatDate(),
    };

    draft.propertyListings.unshift(listing);
    draft.communicationLogs.unshift(buildEmailLog(
      user.email,
      "Property listing pending approval",
      `Your property submission, ${title}, has been received by Dajem Homes Limited and is pending approval.`,
    ));
  });

  return {
    snapshot: snapshotFor(state, sessionEmail),
    message: "Property submitted and marked as pending approval.",
  };
}

export async function submitSurvey(
  sessionEmail: string | null,
  payload: {
    location: string;
    serviceType: string;
    description: string;
    fileName?: string;
    fileSizeKb?: number;
    applicationNumber?: string;
    acquisitionSource?: string;
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
  },
) {
  const { state } = await updatePlatformState((draft) => {
    const user = requireUser(draft, sessionEmail);
    const location = String(payload.location ?? "").trim();
    const serviceType = String(payload.serviceType ?? "").trim();
    const description = String(payload.description ?? "").trim();

    if (!location || !serviceType || !description) {
      throw new Error("Please complete the survey request details.");
    }

    const acquisitionSource = payload.acquisitionSource?.trim();
    const request: SurveyRequest = {
      id: makeId("SURV"),
      applicationNumber: payload.applicationNumber?.trim() || makeId("APP"),
      userName: user.name,
      userEmail: user.email,
      userPhone: user.phone,
      location,
      serviceType,
      description,
      fileName: payload.fileName?.slice(0, 140),
      fileSizeKb: Math.max(0, Number(payload.fileSizeKb ?? 0)) || undefined,
      acquisitionSource: acquisitionSource === "community" || acquisitionSource === "estate-developer" || acquisitionSource === "dajem" || acquisitionSource === "other"
        ? acquisitionSource
        : undefined,
      acquisitionCompany: payload.acquisitionCompany?.trim() || undefined,
      hasExistingSurveyPlan: payload.hasExistingSurveyPlan,
      planNumber: payload.planNumber?.trim() || undefined,
      planYear: payload.planYear?.trim() || undefined,
      billingType: payload.billingType ?? "Service Request",
      uploadedDocuments: payload.uploadedDocuments ?? [],
      documentAttachments: (payload.documentAttachments ?? [])
        .map((attachment) => ({
          documentName: String(attachment.documentName ?? "").trim(),
          fileName: String(attachment.fileName ?? "").trim().slice(0, 140),
          fileSizeKb: Math.max(0, Number(attachment.fileSizeKb ?? 0)) || 0,
        }))
        .filter((attachment) => attachment.documentName && attachment.fileName),
      missingDocuments: payload.missingDocuments ?? [],
      attested: Boolean(payload.attested),
      paymentStatus: "Awaiting Review",
      processingNote: "Submitted for document verification. Processing update expected within 24 hours.",
      status: "Pending Approval",
      date: formatDate(),
    };

    draft.surveys.unshift(request);
    draft.communicationLogs.unshift(buildEmailLog(
      user.email,
      "Survey request pending approval",
      `Your ${serviceType} request for ${location} has been received by DAJEM Orbital Resources Limited and is pending approval. Application number: ${request.applicationNumber}.`,
    ));
  });

  return {
    snapshot: snapshotFor(state, sessionEmail),
    message: "Survey request logged and marked as pending approval.",
  };
}

export async function updateBidStatus(
  sessionEmail: string | null,
  payload: { bidId: string; status: BidStatus },
) {
  const { state } = await updatePlatformState((draft) => {
    requireAdmin(draft, sessionEmail);
    const bid = draft.bids.find((entry) => entry.id === payload.bidId);
    if (!bid) throw new Error("Bid not found.");
    bid.status = payload.status;
  });

  return {
    snapshot: snapshotFor(state, sessionEmail),
    message: "Bid status updated.",
  };
}

export async function updateSurveyStatus(
  sessionEmail: string | null,
  payload: { surveyId: string; status: SurveyStatus },
) {
  const { state } = await updatePlatformState((draft) => {
    requireAdmin(draft, sessionEmail);
    const survey = draft.surveys.find((entry) => entry.id === payload.surveyId);
    if (!survey) throw new Error("Survey request not found.");

    survey.status = payload.status;
    if (payload.status === "Completed & Sent" && !survey.completedFileName) {
      survey.completedFileName = `${survey.location.replace(/\s+/g, "-").toLowerCase()}-${survey.id}.pdf`;
    }
  });

  return {
    snapshot: snapshotFor(state, sessionEmail),
    message: "Survey status updated.",
  };
}

export async function updateInventoryItem(
  sessionEmail: string | null,
  payload: {
    productId?: string;
    name?: string;
    category?: InventoryCategory;
    price: number;
    description?: string;
    availableUnits: number;
    stockStatus?: InventoryStockStatus;
    imageUrl?: string;
    imageBg?: string;
    age?: string;
    weight?: string;
    originalPrice?: number;
    promoPrice?: number;
    promoEndsAt?: string;
    promoLabel?: string;
  },
) {
  const { state } = await updatePlatformState((draft) => {
    requireAdmin(draft, sessionEmail);
    const productId = payload.productId?.trim();
    const item = productId ? draft.inventory.find((entry) => entry.productId === productId) : null;
    const price = Math.max(0, Number(payload.price));
    const availableUnits = Math.max(0, Number(payload.availableUnits));

    if (item) {
      item.name = payload.name?.trim() || item.name;
      item.category = payload.category ?? item.category;
      item.price = price;
      item.description = payload.description?.trim() || item.description;
      item.availableUnits = availableUnits;
      item.stockStatus = payload.stockStatus ?? deriveStockStatus(item.availableUnits);
      item.imageUrl = payload.imageUrl?.trim() || item.imageUrl;
      item.imageBg = payload.imageBg?.trim() || item.imageBg;
      item.age = payload.age?.trim() || undefined;
      item.weight = payload.weight?.trim() || undefined;
      item.originalPrice = Number.isFinite(Number(payload.originalPrice)) && Number(payload.originalPrice) > 0 ? Number(payload.originalPrice) : undefined;
      item.promoPrice = Number.isFinite(Number(payload.promoPrice)) && Number(payload.promoPrice) > 0 ? Number(payload.promoPrice) : undefined;
      item.promoEndsAt = payload.promoEndsAt?.trim() || undefined;
      item.promoLabel = payload.promoLabel?.trim() || undefined;
      return;
    }

    const name = payload.name?.trim();
    const description = payload.description?.trim();
    if (!name || !description) {
      throw new Error("Please provide a product name and description.");
    }

    draft.inventory.unshift({
      productId: productId || makeId("FARM"),
      name,
      category: payload.category ?? "produce",
      price,
      description,
      stockStatus: payload.stockStatus ?? deriveStockStatus(availableUnits),
      availableUnits,
      imageBg: payload.imageBg?.trim() || "bg-emerald-500/10 text-emerald-700",
      imageUrl: payload.imageUrl?.trim() || farmsImageUrl,
      age: payload.age?.trim() || undefined,
      weight: payload.weight?.trim() || undefined,
      originalPrice: Number.isFinite(Number(payload.originalPrice)) && Number(payload.originalPrice) > 0 ? Number(payload.originalPrice) : undefined,
      promoPrice: Number.isFinite(Number(payload.promoPrice)) && Number(payload.promoPrice) > 0 ? Number(payload.promoPrice) : undefined,
      promoEndsAt: payload.promoEndsAt?.trim() || undefined,
      promoLabel: payload.promoLabel?.trim() || undefined,
    });
  });

  return {
    snapshot: snapshotFor(state, sessionEmail),
    message: "Inventory saved.",
  };
}

export async function updatePropertyListingStatus(
  sessionEmail: string | null,
  payload: { propertyId: string; status: ApprovalStatus },
) {
  const { state } = await updatePlatformState((draft) => {
    requireAdmin(draft, sessionEmail);
    const listing = draft.propertyListings.find((entry) => entry.id === payload.propertyId);
    if (!listing) throw new Error("Property listing not found.");

    listing.status = payload.status;
    if (listing.submittedByEmail) {
      draft.communicationLogs.unshift(buildEmailLog(
        listing.submittedByEmail,
        `Property listing ${payload.status.toLowerCase()}`,
        `${listing.title} is now marked as ${payload.status} by Dajem Homes Limited.`,
      ));
    }
  });

  return {
    snapshot: snapshotFor(state, sessionEmail),
    message: "Property listing status updated.",
  };
}

export async function upsertPropertyListing(
  sessionEmail: string | null,
  payload: {
    id?: string;
    title: string;
    location: string;
    price: number;
    type: PropertyType;
    category: PropertyCategory;
    beds?: number;
    baths?: number;
    size: number;
    featured?: boolean;
    imageUrl?: string;
    imageBg?: string;
    summary: string;
    highlights?: string[];
    status?: ApprovalStatus;
  },
) {
  const { state } = await updatePlatformState((draft) => {
    requireAdmin(draft, sessionEmail);
    const title = String(payload.title ?? "").trim();
    const location = String(payload.location ?? "").trim();
    const summary = String(payload.summary ?? "").trim();
    const price = Number(payload.price);
    const size = Number(payload.size);

    if (!title || !location || !summary || !Number.isFinite(price) || price <= 0 || !Number.isFinite(size) || size <= 0) {
      throw new Error("Please complete the property listing details.");
    }

    const existing = payload.id ? draft.propertyListings.find((entry) => entry.id === payload.id) : null;
    const next: PropertyListing = {
      id: existing?.id ?? makeId("PROP"),
      title,
      location,
      price,
      type: payload.type ?? existing?.type ?? "sale",
      category: payload.category ?? existing?.category ?? "apartment",
      beds: payload.beds ? Math.max(0, Number(payload.beds)) : undefined,
      baths: payload.baths ? Math.max(0, Number(payload.baths)) : undefined,
      size,
      featured: Boolean(payload.featured),
      imageBg: payload.imageBg?.trim() || existing?.imageBg || "from-emerald-700/25 to-slate-900/10",
      imageUrl: payload.imageUrl?.trim() || existing?.imageUrl || homesImageUrl,
      summary,
      highlights: (payload.highlights ?? existing?.highlights ?? []).map((item) => String(item).trim()).filter(Boolean).slice(0, 6),
      status: payload.status ?? existing?.status ?? "Approved",
      submittedByName: existing?.submittedByName,
      submittedByEmail: existing?.submittedByEmail,
      submittedByPhone: existing?.submittedByPhone,
      createdAt: existing?.createdAt ?? nowIso(),
      date: existing?.date ?? formatDate(),
    };

    if (existing) {
      Object.assign(existing, next);
    } else {
      draft.propertyListings.unshift(next);
    }
  });

  return {
    snapshot: snapshotFor(state, sessionEmail),
    message: "Property listing saved.",
  };
}

export async function upsertSurveyService(
  sessionEmail: string | null,
  payload: {
    id?: string;
    title: string;
    description: string;
    priceFrom: number;
    timeline: string;
    imageUrl?: string;
    color?: string;
    status?: ApprovalStatus;
  },
) {
  const { state } = await updatePlatformState((draft) => {
    requireAdmin(draft, sessionEmail);
    const title = String(payload.title ?? "").trim();
    const description = String(payload.description ?? "").trim();
    const timeline = String(payload.timeline ?? "").trim();
    const priceFrom = Math.max(0, Number(payload.priceFrom));

    if (!title || !description || !timeline) {
      throw new Error("Please complete the survey service details.");
    }

    const existing = payload.id ? draft.surveyServices.find((entry) => entry.id === payload.id) : null;
    const next: SurveyService = {
      id: existing?.id ?? makeId("SERV"),
      title,
      description,
      priceFrom,
      timeline,
      imageUrl: payload.imageUrl?.trim() || existing?.imageUrl || orbitalImageUrl,
      color: payload.color?.trim() || existing?.color || "text-cyan-600 bg-cyan-500/10",
      status: payload.status ?? existing?.status ?? "Approved",
    };

    if (existing) {
      Object.assign(existing, next);
    } else {
      draft.surveyServices.unshift(next);
    }
  });

  return {
    snapshot: snapshotFor(state, sessionEmail),
    message: "Survey service saved.",
  };
}

export async function createPaymentIntent(sessionEmail: string | null) {
  const { result, state } = await updatePlatformState((draft) => {
    const user = requireUser(draft, sessionEmail);
    const cart = draft.carts[user.email] ?? [];

    if (cart.length === 0) {
      throw new Error("Your cart is empty.");
    }

    const amount = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    const intent: PaymentIntent = {
      txRef: `DJM-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`,
      userEmail: user.email,
      amount,
      currency: "NGN",
      items: cart.map((item) => ({ ...item })),
      provider: flutterwaveIsConfigured() ? "flutterwave" : "mock",
      status: "pending",
      createdAt: nowIso(),
    };

    draft.paymentIntents.unshift(intent);
    return intent;
  });

  return {
    intent: result,
    snapshot: snapshotFor(state, sessionEmail),
  };
}

export async function getPaymentIntent(txRef: string) {
  const state = await readPlatformState();
  return state.paymentIntents.find((intent) => intent.txRef === txRef) ?? null;
}

export async function completePaymentIntent(
  sessionEmail: string | null,
  payload: {
    txRef: string;
    provider: Order["provider"];
    transactionId?: string;
  },
) {
  const { result, state } = await updatePlatformState((draft) => {
    const intent = draft.paymentIntents.find((entry) => entry.txRef === payload.txRef);
    if (!intent) throw new Error("Payment session not found.");

    if (payload.provider === "Simulation" && !allowMockPayments()) {
      throw new Error("Mock payments are disabled in production.");
    }

    if (intent.status === "paid") {
      const existing = draft.orders.find((order) => order.reference === intent.txRef);
      if (!existing) throw new Error("Order lookup failed.");
      return existing;
    }

    intent.status = "paid";
    intent.transactionId = payload.transactionId;

    const order: Order = {
      id: makeId("ORD"),
      userEmail: intent.userEmail,
      items: intent.items,
      total: intent.amount,
      date: formatDate(),
      reference: intent.txRef,
      provider: payload.provider,
      paymentStatus: "Paid",
      status: "Processing",
    };

    draft.orders.unshift(order);
    draft.carts[intent.userEmail] = [];

    for (const item of intent.items) {
      const inventoryItem = draft.inventory.find((entry) => entry.productId === item.productId);
      if (!inventoryItem) continue;
      inventoryItem.availableUnits = Math.max(0, inventoryItem.availableUnits - item.quantity);
      inventoryItem.stockStatus = deriveStockStatus(inventoryItem.availableUnits);
    }

    return order;
  });

  return {
    order: result,
    snapshot: snapshotFor(state, sessionEmail),
    message: "Order paid and added to your dashboard.",
  };
}
