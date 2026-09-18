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
  PaymentApp,
  PaymentProvider,
  PaymentPurpose,
  PlatformState,
  PropertyCategory,
  PropertyListing,
  PropertyType,
  HomesListingGroup,
  ResidenceType,
  AgentListingPaymentStatus,
  ServerUser,
  SurveyService,
  SurveyRequest,
  SurveyDeliveryStatus,
  SurveyStatus,
  User,
} from "../store";
import { shippingWeightKg } from "../store";
import { normalizeCheckoutDelivery, quoteDhlDelivery, type CheckoutDeliveryInput } from "../dhl-delivery";
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

function invoicePrefix(app: PaymentApp) {
  return app === "farms" ? "DF" : app === "homes" ? "DH" : "DS";
}

function makeInvoiceNumber(state: PlatformState, app: PaymentApp) {
  const dateKey = nowIso().slice(0, 10).replace(/-/g, "");
  const prefix = `${invoicePrefix(app)}${dateKey}`;
  const serial = state.orders.filter((order) => order.invoiceNumber?.startsWith(prefix)).length + 1;
  return `${prefix}${String(serial).padStart(6, "0")}`;
}

function listingGroupFor(type: PropertyType, category: PropertyCategory, group?: HomesListingGroup) {
  if (group) return group;
  if (category === "land") return type === "sale" ? "land-sale" : "land-lease";
  if (type === "short-let" || category === "short-let" || category === "suite") return "short-let";
  return type === "sale" ? "house-sale" : "house-rent";
}

function allowMockPayments() {
  return process.env.NODE_ENV !== "production" || process.env.DAJEM_ALLOW_MOCK_PAYMENTS === "true";
}

const farmsImageUrl = "/images/farms-hero-farm-v2.png";
const homesImageUrl = "/images/homes-hero-suite-v2.png";
const orbitalImageUrl = "/images/orbital-hero-field-v2.png";
const PROPERTY_LISTING_FEE = 20000;

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

function positiveWholeNumber(value: unknown, field: string) {
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number <= 0) {
    throw new Error(`${field} must be a whole number greater than zero.`);
  }
  return number;
}

function optionalNonNegativeWholeNumber(value: unknown) {
  if (value === undefined || value === null || value === "") return undefined;
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < 0) {
    throw new Error("Bedrooms and bathrooms must be whole numbers.");
  }
  return number;
}

function documentStoragePrefix(email: string) {
  const safeEmail = normalizeEmail(email)
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "file";
  return `survey-documents/${safeEmail}/`;
}

function isOwnedDocumentStoragePath(email: string, storagePath: string) {
  const prefix = documentStoragePrefix(email);
  return storagePath.startsWith(prefix) || storagePath.startsWith(`local-preview/${prefix}`);
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
    shippingWeightKg: item.shippingWeightKg,
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
    country: string;
    address: string;
    state: string;
    localGovernment: string;
    password: string;
  },
) {
  const email = normalizeEmail(String(payload.email ?? ""));
  const name = String(payload.name ?? "").trim();
  const phone = String(payload.phone ?? "").trim();
  const country = String(payload.country ?? "").trim();
  const address = String(payload.address ?? "").trim();
  const stateName = String(payload.state ?? "").trim();
  const localGovernment = String(payload.localGovernment ?? "").trim();
  const password = String(payload.password ?? "").trim();

  if (!name || !email || !phone || !country || !address || !stateName || !localGovernment || !password) {
    throw new Error("Please complete all signup fields.");
  }

  if (!/^\+[1-9]\d{6,14}$/.test(phone)) {
    throw new Error("Please enter a valid phone number.");
  }

  if (password.length < 8) {
    throw new Error("Please use a password with at least 8 characters.");
  }

  const { result, state } = await updatePlatformState(async (draft) => {
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
      country,
      address,
      state: stateName,
      localGovernment,
      role: "user",
      createdAt: nowIso(),
      passwordSalt,
      passwordHash: hashPassword(password, passwordSalt),
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
  const quantity = positiveWholeNumber(payload.quantity ?? 1, "Quantity");
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
  const quantity = Number(payload.quantity);
  if (!Number.isSafeInteger(quantity)) {
    throw new Error("Quantity must be a whole number.");
  }

  const { state } = await updatePlatformState((draft) => {
    const user = requireUser(draft, sessionEmail);
    const cart = draft.carts[user.email] ?? [];
    const existing = cart.find((item) => cartLineMatches(item, payload.productId, variantKey));
    if (!existing) return;

    if (quantity <= 0) {
      draft.carts[user.email] = cart.filter((item) => !cartLineMatches(item, payload.productId, variantKey));
      return;
    }

    const inventoryItem = draft.inventory.find((item) => item.productId === payload.productId);
    if (!inventoryItem) {
      draft.carts[user.email] = cart.filter((item) => !cartLineMatches(item, payload.productId, variantKey));
      return;
    }

    existing.quantity = Math.min(quantity, inventoryItem.availableUnits);
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
    const bidAmount = Number(payload.bidAmount);
    const property = draft.propertyListings.find((listing) => (
      listing.id === String(payload.propertyId ?? "").trim() && listing.status === "Approved"
    ));

    if (!property || !Number.isFinite(bidAmount) || bidAmount <= 0) {
      throw new Error("Please enter a valid bid.");
    }

    const bid: Bid = {
      id: makeId("BID"),
      propertyId: property.id,
      propertyTitle: property.title,
      propertyLocation: property.location,
      propertyPrice: property.price,
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
      `Your bid for ${property.title} has been received by Dajem Homes Limited and is pending approval.`,
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
    listingGroup?: HomesListingGroup;
    residenceType?: ResidenceType;
    beds?: number;
    baths?: number;
    size: number;
    summary: string;
    highlights?: string[];
    imageUrl?: string;
    agentCompany?: string;
    requestContactPublication?: boolean;
  },
) {
  const { result, state } = await updatePlatformState((draft) => {
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
      listingGroup: listingGroupFor(payload.type ?? "sale", payload.category ?? "apartment", payload.listingGroup),
      residenceType: payload.residenceType,
      beds: optionalNonNegativeWholeNumber(payload.beds),
      baths: optionalNonNegativeWholeNumber(payload.baths),
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
      agentName: user.name,
      agentEmail: user.email,
      agentPhone: user.phone,
      agentCompany: String(payload.agentCompany ?? "").trim().slice(0, 120) || undefined,
      agentListingPaymentStatus: payload.requestContactPublication ? "Awaiting Payment" : "Not Requested",
      createdAt: nowIso(),
      date: formatDate(),
    };

    draft.propertyListings.unshift(listing);
    draft.communicationLogs.unshift(buildEmailLog(
      user.email,
      "Property listing pending approval",
      `Your property submission, ${title}, has been received by Dajem Homes Limited and is pending approval.`,
    ));
    return listing;
  });

  return {
    snapshot: snapshotFor(state, sessionEmail),
    message: "Property submitted and marked as pending approval.",
    listing: result,
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
      storagePath?: string;
    }[];
    missingDocuments?: string[];
    attested?: boolean;
    delivery?: NonNullable<SurveyRequest["delivery"]>;
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

    if (payload.delivery && Number(payload.delivery.fee) > 0) {
      const requiredDeliveryFields = [
        payload.delivery.recipientName,
        payload.delivery.phone,
        payload.delivery.address,
        payload.delivery.city,
        payload.delivery.state,
      ];
      if (requiredDeliveryFields.some((value) => !String(value ?? "").trim())) {
        throw new Error("Complete the DHL recipient and delivery address before submitting the survey request.");
      }
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
      uploadedDocuments: (payload.uploadedDocuments ?? [])
        .map((document) => String(document).trim().slice(0, 100))
        .filter(Boolean)
        .slice(0, 7),
      documentAttachments: (payload.documentAttachments ?? [])
        .map((attachment) => {
          const storagePath = String(attachment.storagePath ?? "").trim().slice(0, 240);
          return {
            documentName: String(attachment.documentName ?? "").trim().slice(0, 100),
            fileName: String(attachment.fileName ?? "").trim().slice(0, 140),
            fileSizeKb: Math.max(0, Number(attachment.fileSizeKb ?? 0)) || 0,
            storagePath: storagePath && isOwnedDocumentStoragePath(user.email, storagePath) ? storagePath : undefined,
          };
        })
        .filter((attachment) => attachment.documentName && attachment.fileName)
        .slice(0, 7),
      missingDocuments: payload.missingDocuments ?? [],
      attested: Boolean(payload.attested),
      delivery: payload.delivery && Number(payload.delivery.fee) > 0
        ? {
            provider: "DHL Express",
            serviceName: String(payload.delivery.serviceName ?? "DHL Express Document Delivery").trim().slice(0, 120),
            fee: Math.round(Math.max(0, Number(payload.delivery.fee))),
            currency: "NGN",
            rateSource: payload.delivery.rateSource === "dhl-live" ? "dhl-live" : "dajem-estimate",
            estimatedDelivery: String(payload.delivery.estimatedDelivery ?? "").trim().slice(0, 120),
            recipientName: String(payload.delivery.recipientName ?? "").trim().slice(0, 120),
            phone: String(payload.delivery.phone ?? "").trim().slice(0, 40),
            email: String(payload.delivery.email ?? "").trim().toLowerCase().slice(0, 180) || undefined,
            address: String(payload.delivery.address ?? "").trim().slice(0, 240),
            city: String(payload.delivery.city ?? "").trim().slice(0, 100),
            state: String(payload.delivery.state ?? "").trim().slice(0, 100),
            postalCode: String(payload.delivery.postalCode ?? "").trim().slice(0, 20) || undefined,
            countryCode: "NG",
            status: "Rate Added",
          }
        : undefined,
      paymentStatus: "Awaiting Review",
      processingNote: "Submitted for document verification. Processing update expected within 24 hours.",
      status: "Pending Approval",
      date: formatDate(),
    };

    draft.surveys.unshift(request);
    draft.communicationLogs.unshift(buildEmailLog(
      user.email,
      "Survey request pending approval",
      `Your ${serviceType} request for ${location} has been received by DAJEM Orbital Resources Limited and is pending approval. Application number: ${request.applicationNumber}.${request.delivery ? ` DHL delivery to ${request.delivery.city}, ${request.delivery.state} has been added at ${new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(request.delivery.fee)}.` : ""}`,
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

export async function updateSurveyDelivery(
  sessionEmail: string | null,
  payload: { surveyId: string; status: SurveyDeliveryStatus; trackingNumber?: string },
) {
  const allowedStatuses: SurveyDeliveryStatus[] = ["Rate Added", "Awaiting Dispatch", "Dispatched", "Delivered", "Cancelled"];
  const { state } = await updatePlatformState((draft) => {
    requireAdmin(draft, sessionEmail);
    const survey = draft.surveys.find((entry) => entry.id === payload.surveyId);
    if (!survey) throw new Error("Survey request not found.");
    if (!survey.delivery) throw new Error("This survey request does not include delivery.");
    if (!allowedStatuses.includes(payload.status)) throw new Error("Select a valid delivery status.");

    const trackingNumber = String(payload.trackingNumber ?? "").trim().slice(0, 80);
    if ((payload.status === "Dispatched" || payload.status === "Delivered") && !trackingNumber) {
      throw new Error("Add the DHL tracking number before marking this delivery as dispatched or delivered.");
    }

    survey.delivery.status = payload.status;
    survey.delivery.trackingNumber = trackingNumber || undefined;
    if (payload.status === "Dispatched" && !survey.delivery.dispatchedAt) {
      survey.delivery.dispatchedAt = nowIso();
    }
    if (payload.status === "Delivered") {
      survey.delivery.deliveredAt = nowIso();
    }

    draft.communicationLogs.unshift(buildEmailLog(
      survey.userEmail,
      `DHL delivery update: ${payload.status}`,
      `Your survey plan delivery for ${survey.applicationNumber ?? survey.id} is now ${payload.status.toLowerCase()}.${trackingNumber ? ` DHL tracking number: ${trackingNumber}.` : ""}`,
    ));
  });

  return {
    snapshot: snapshotFor(state, sessionEmail),
    message: "Survey delivery updated.",
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
    shippingWeightKg?: number;
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
    const price = Number(payload.price);
    const availableUnits = Number(payload.availableUnits);

    if (!Number.isFinite(price) || price < 0 || !Number.isSafeInteger(availableUnits) || availableUnits < 0) {
      throw new Error("Price and available units must be valid non-negative values.");
    }

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
      item.shippingWeightKg = Number.isFinite(Number(payload.shippingWeightKg)) && Number(payload.shippingWeightKg) >= 0
        ? Number(payload.shippingWeightKg)
        : undefined;
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
      shippingWeightKg: Number.isFinite(Number(payload.shippingWeightKg)) && Number(payload.shippingWeightKg) >= 0
        ? Number(payload.shippingWeightKg)
        : undefined,
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

export async function updatePropertyListingAgentPayment(
  sessionEmail: string | null,
  payload: { propertyId: string; status: AgentListingPaymentStatus; paymentProofPath?: string },
) {
  const allowedStatuses: AgentListingPaymentStatus[] = ["Not Requested", "Awaiting Payment", "Payment Submitted", "Paid"];
  const { state } = await updatePlatformState((draft) => {
    requireAdmin(draft, sessionEmail);
    if (!allowedStatuses.includes(payload.status)) throw new Error("Select a valid agent payment status.");
    const listing = draft.propertyListings.find((entry) => entry.id === payload.propertyId);
    if (!listing) throw new Error("Property listing not found.");

    listing.agentListingPaymentStatus = payload.status;
    listing.agentPaymentProofPath = String(payload.paymentProofPath ?? "").trim().slice(0, 240) || undefined;
    if (listing.submittedByEmail) {
      draft.communicationLogs.unshift(buildEmailLog(
        listing.submittedByEmail,
        "Listing fee status updated",
        `The listing-fee status for ${listing.title} is now ${payload.status}.`,
      ));
    }
  });

  return {
    snapshot: snapshotFor(state, sessionEmail),
    message: "Agent listing payment status updated.",
  };
}

export async function submitPropertyListingPaymentProof(
  sessionEmail: string | null,
  payload: { propertyId: string; paymentProofPath: string },
) {
  const { state } = await updatePlatformState((draft) => {
    const user = requireUser(draft, sessionEmail);
    const listing = draft.propertyListings.find((entry) => entry.id === payload.propertyId);
    if (!listing || normalizeEmail(listing.submittedByEmail ?? "") !== normalizeEmail(user.email)) {
      throw new Error("Only the submitting agent can upload listing-payment proof.");
    }
    if (listing.agentListingPaymentStatus === "Paid") throw new Error("This listing fee has already been confirmed.");
    const paymentProofPath = String(payload.paymentProofPath ?? "").trim().slice(0, 240);
    if (!paymentProofPath) throw new Error("Upload a valid payment proof first.");
    listing.agentPaymentProofPath = paymentProofPath;
    listing.agentListingPaymentStatus = "Payment Submitted";
    draft.communicationLogs.unshift(buildEmailLog(
      user.email,
      "Listing payment proof submitted",
      `Your payment proof for ${listing.title} has been sent to DAJEM Homes for review.`,
    ));
  });

  return {
    snapshot: snapshotFor(state, sessionEmail),
    message: "Payment proof submitted for admin confirmation.",
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
    listingGroup?: HomesListingGroup;
    residenceType?: ResidenceType;
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
      listingGroup: listingGroupFor(
        payload.type ?? existing?.type ?? "sale",
        payload.category ?? existing?.category ?? "apartment",
        payload.listingGroup ?? existing?.listingGroup,
      ),
      residenceType: payload.residenceType ?? existing?.residenceType,
      beds: optionalNonNegativeWholeNumber(payload.beds),
      baths: optionalNonNegativeWholeNumber(payload.baths),
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
      agentName: existing?.agentName,
      agentEmail: existing?.agentEmail,
      agentPhone: existing?.agentPhone,
      agentCompany: existing?.agentCompany,
      agentListingPaymentStatus: existing?.agentListingPaymentStatus,
      agentPaymentProofPath: existing?.agentPaymentProofPath,
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
    const priceFrom = Number(payload.priceFrom);

    if (!title || !description || !timeline || !Number.isFinite(priceFrom) || priceFrom < 0) {
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

export async function createPaymentIntent(
  sessionEmail: string | null,
  options: { provider?: PaymentProvider; purpose?: PaymentPurpose; propertyListingId?: string; delivery?: CheckoutDeliveryInput } = {},
) {
  const { result, state } = await updatePlatformState(async (draft) => {
    const user = requireUser(draft, sessionEmail);
    const provider = options.provider ?? "flutterwave";
    const purpose = options.purpose ?? "farm-order";

    if (purpose === "property-listing-fee") {
      const propertyListingId = String(options.propertyListingId ?? "").trim();
      const listing = draft.propertyListings.find((entry) => entry.id === propertyListingId);
      if (!listing || normalizeEmail(listing.submittedByEmail ?? "") !== normalizeEmail(user.email)) {
        throw new Error("Only the submitting agent can pay this listing fee.");
      }
      if (listing.agentListingPaymentStatus === "Paid") {
        throw new Error("This listing fee has already been paid.");
      }

      const intent: PaymentIntent = {
        txRef: `DJM-${randomUUID()}`,
        userEmail: user.email,
        amount: PROPERTY_LISTING_FEE,
        currency: "NGN",
        items: [cloneCartItem({
          productId: `listing-fee-${listing.id}`,
          name: "DAJEM Homes agent listing fee",
          category: "consultancy",
          price: PROPERTY_LISTING_FEE,
          description: `Contact-publication fee for ${listing.title}.`,
          stockStatus: "In Stock",
          availableUnits: 1,
          imageBg: "bg-blue-500/10 text-blue-700",
          imageUrl: homesImageUrl,
        }, 1)],
        provider,
        app: "homes",
        purpose,
        invoiceNumber: makeInvoiceNumber(draft, "homes"),
        propertyListingId: listing.id,
        status: "pending",
        createdAt: nowIso(),
      };

      listing.agentListingPaymentStatus = "Awaiting Payment";
      draft.paymentIntents.unshift(intent);
      return intent;
    }

    const cart = draft.carts[user.email] ?? [];

    if (cart.length === 0) {
      throw new Error("Your cart is empty.");
    }

    const items = cart.map((cartItem) => {
      const quantity = positiveWholeNumber(cartItem.quantity, "Cart quantity");
      const inventoryItem = draft.inventory.find((item) => item.productId === cartItem.productId);
      if (!inventoryItem || inventoryItem.availableUnits < quantity) {
        throw new Error(`${cartItem.name} no longer has enough stock for checkout.`);
      }
      return cloneCartItem(inventoryItem, quantity, {
        variantKey: cartItem.variantKey,
        variantLabel: cartItem.variantLabel,
      });
    });
    // Rebuild the delivery weight from inventory so the browser cannot alter it.
    const shipmentWeightKg = items.reduce((total, item) => total + (shippingWeightKg(item) * item.quantity), 0);
    const deliveryInput = options.delivery
      ? normalizeCheckoutDelivery({ ...options.delivery, weightKg: shipmentWeightKg })
      : undefined;
    const deliveryRate = deliveryInput ? await quoteDhlDelivery(deliveryInput) : undefined;
    const delivery = deliveryInput && deliveryRate ? {
      provider: deliveryRate.provider,
      serviceName: deliveryRate.serviceName,
      fee: deliveryRate.amount,
      currency: deliveryRate.currency,
      rateSource: deliveryRate.source,
      estimatedDelivery: deliveryRate.estimatedDelivery,
      recipientName: deliveryInput.recipientName,
      phone: deliveryInput.phone,
      email: deliveryInput.email,
      address: deliveryInput.address,
      state: deliveryInput.state,
      localGovernment: deliveryInput.localGovernment,
      postalCode: deliveryInput.postalCode,
      weightKg: deliveryInput.weightKg,
    } : undefined;
    const amount = items.reduce((total, item) => total + item.price * item.quantity, 0) + (delivery?.fee ?? 0);
    const intent: PaymentIntent = {
      txRef: `DJM-${randomUUID()}`,
      userEmail: user.email,
      amount,
      currency: "NGN",
      items,
      provider,
      app: "farms",
      purpose,
      invoiceNumber: makeInvoiceNumber(draft, "farms"),
      delivery,
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

export async function getPaymentIntent(sessionEmail: string | null, txRef: string) {
  const state = await readPlatformState();
  const user = requireUser(state, sessionEmail);
  return state.paymentIntents.find((intent) => (
    intent.txRef === txRef && normalizeEmail(intent.userEmail) === normalizeEmail(user.email)
  )) ?? null;
}

// Used only after Flutterwave has signed the webhook and the transaction is re-verified server-side.
export async function getPaymentIntentForGateway(txRef: string) {
  const state = await readPlatformState();
  return state.paymentIntents.find((intent) => intent.txRef === txRef) ?? null;
}

export async function completePaymentIntentFromGateway(txRef: string, transactionId: string) {
  const intent = await getPaymentIntentForGateway(txRef);
  if (!intent) throw new Error("Payment session not found.");
  return completePaymentIntent(intent.userEmail, {
    txRef,
    provider: "Flutterwave",
    transactionId,
  });
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
    const user = requireUser(draft, sessionEmail);
    const intent = draft.paymentIntents.find((entry) => entry.txRef === payload.txRef);
    if (!intent) throw new Error("Payment session not found.");
    if (normalizeEmail(intent.userEmail) !== normalizeEmail(user.email)) {
      throw new Error("This payment session belongs to another account.");
    }

    if ((payload.provider === "Flutterwave Mock" || payload.provider === "OPay Mock") && !allowMockPayments()) {
      throw new Error("Mock payments are disabled in production.");
    }

    if (intent.status === "paid") {
      const existing = draft.orders.find((order) => order.reference === intent.txRef);
      if (!existing) throw new Error("Order lookup failed.");
      return existing;
    }

    if (intent.purpose === "farm-order") {
      for (const item of intent.items) {
        const inventoryItem = draft.inventory.find((entry) => entry.productId === item.productId);
        if (!inventoryItem || inventoryItem.availableUnits < item.quantity) {
          throw new Error(`${item.name} is no longer available in the requested quantity.`);
        }
      }
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
      invoiceNumber: intent.invoiceNumber,
      app: intent.app,
      purpose: intent.purpose,
      propertyListingId: intent.propertyListingId,
      delivery: intent.delivery,
    };

    draft.orders.unshift(order);
    if (intent.purpose === "farm-order") {
      draft.carts[intent.userEmail] = [];

      for (const item of intent.items) {
        const inventoryItem = draft.inventory.find((entry) => entry.productId === item.productId);
        if (!inventoryItem) continue;
        inventoryItem.availableUnits = Math.max(0, inventoryItem.availableUnits - item.quantity);
        inventoryItem.stockStatus = deriveStockStatus(inventoryItem.availableUnits);
      }
    }

    if (intent.purpose === "property-listing-fee" && intent.propertyListingId) {
      const listing = draft.propertyListings.find((entry) => entry.id === intent.propertyListingId);
      if (!listing) throw new Error("Property listing no longer exists.");
      listing.agentListingPaymentStatus = "Paid";
      draft.communicationLogs.unshift(buildEmailLog(
        listing.submittedByEmail ?? user.email,
        "Agent contact details activated",
        `Your listing fee for ${listing.title} was confirmed. Your contact details can appear once the listing is approved.`,
      ));
    }

    return order;
  });

  return {
    order: result,
    snapshot: snapshotFor(state, sessionEmail),
    message: result.purpose === "property-listing-fee"
      ? "Listing fee paid. Your contact details will appear after admin approval."
      : "Order paid and added to your dashboard.",
  };
}
