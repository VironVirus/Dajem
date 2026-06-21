import { randomUUID } from "node:crypto";
import type {
  Bid,
  BidStatus,
  CartItem,
  CommunicationLog,
  CommunicationPreview,
  DashboardSnapshot,
  InventoryItem,
  InventoryStockStatus,
  Order,
  PaymentIntent,
  PlatformState,
  ServerUser,
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
      message: `Hi ${user.name}, your Dajem Group account is active. Visit your dashboard to track poultry orders, bids, and surveys.`,
    },
    email: {
      to: user.email,
      subject: "Welcome to Dajem Group",
      message: `Hello ${user.name}, your unified Dajem portal is now ready. You can move between Poultry, Real Estate, Survey, and the shared dashboard with one login.`,
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

function deriveStockStatus(availableUnits: number): InventoryStockStatus {
  if (availableUnits <= 0) return "Out of Stock";
  if (availableUnits <= 12) return "Low Stock";
  return "In Stock";
}

function cloneCartItem(item: InventoryItem, quantity: number): CartItem {
  return {
    productId: item.productId,
    name: item.name,
    category: item.category,
    price: item.price,
    quantity,
    description: item.description,
    stockStatus: item.stockStatus,
    imageBg: item.imageBg,
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
  payload: { name: string; email: string; phone: string; password: string },
) {
  const email = normalizeEmail(String(payload.email ?? ""));
  const name = String(payload.name ?? "").trim();
  const phone = String(payload.phone ?? "").trim();
  const password = String(payload.password ?? "").trim();

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
  payload: { productId: string; quantity?: number },
) {
  const quantity = Math.max(1, payload.quantity ?? 1);

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
    const existing = cart.find((item) => item.productId === payload.productId);
    const nextQuantity = Math.min(
      inventoryItem.availableUnits,
      (existing?.quantity ?? 0) + quantity,
    );

    if (existing) {
      existing.quantity = nextQuantity;
      existing.price = inventoryItem.price;
      existing.stockStatus = inventoryItem.stockStatus;
    } else {
      cart.push(cloneCartItem(inventoryItem, nextQuantity));
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
  payload: { productId: string; quantity: number },
) {
  const { state } = await updatePlatformState((draft) => {
    const user = requireUser(draft, sessionEmail);
    const cart = draft.carts[user.email] ?? [];
    const existing = cart.find((item) => item.productId === payload.productId);
    if (!existing) return;

    if (payload.quantity <= 0) {
      draft.carts[user.email] = cart.filter((item) => item.productId !== payload.productId);
      return;
    }

    const inventoryItem = draft.inventory.find((item) => item.productId === payload.productId);
    if (!inventoryItem) {
      draft.carts[user.email] = cart.filter((item) => item.productId !== payload.productId);
      return;
    }

    existing.quantity = Math.min(payload.quantity, inventoryItem.availableUnits);
    existing.price = inventoryItem.price;
    existing.stockStatus = inventoryItem.stockStatus;
  });

  return {
    snapshot: snapshotFor(state, sessionEmail),
    message: "Cart updated.",
  };
}

export async function removeCartItem(
  sessionEmail: string | null,
  payload: { productId: string },
) {
  const { state } = await updatePlatformState((draft) => {
    const user = requireUser(draft, sessionEmail);
    draft.carts[user.email] = (draft.carts[user.email] ?? []).filter(
      (item) => item.productId !== payload.productId,
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
      status: "Pending",
      date: formatDate(),
    };

    draft.bids.unshift(bid);
  });

  return {
    snapshot: snapshotFor(state, sessionEmail),
    message: "Bid submitted. An agent will review it shortly.",
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

    const request: SurveyRequest = {
      id: makeId("SURV"),
      userName: user.name,
      userEmail: user.email,
      userPhone: user.phone,
      location,
      serviceType,
      description,
      fileName: payload.fileName?.slice(0, 140),
      fileSizeKb: Math.max(0, Number(payload.fileSizeKb ?? 0)) || undefined,
      status: "Pending",
      date: formatDate(),
    };

    draft.surveys.unshift(request);
  });

  return {
    snapshot: snapshotFor(state, sessionEmail),
    message: "Survey request logged and added to your dashboard.",
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
  payload: { productId: string; price: number; availableUnits: number; stockStatus?: InventoryStockStatus },
) {
  const { state } = await updatePlatformState((draft) => {
    requireAdmin(draft, sessionEmail);
    const item = draft.inventory.find((entry) => entry.productId === payload.productId);
    if (!item) throw new Error("Inventory item not found.");

    item.price = Math.max(0, Number(payload.price));
    item.availableUnits = Math.max(0, Number(payload.availableUnits));
    item.stockStatus = payload.stockStatus ?? deriveStockStatus(item.availableUnits);
  });

  return {
    snapshot: snapshotFor(state, sessionEmail),
    message: "Inventory saved.",
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
