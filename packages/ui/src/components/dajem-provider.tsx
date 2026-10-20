"use client";

import * as React from "react";
import { AuthModal } from "./auth-modal";
import type {
  BidStatus,
  DashboardSnapshot,
  DajemActionResponse,
  ApprovalStatus,
  InventoryCategory,
  InventoryStockStatus,
  Order,
  PaymentProvider,
  PaymentPurpose,
  PropertyCategory,
  PropertyListing,
  PropertyType,
  SurveyDeliveryStatus,
  SurveyStatus,
  FarmDeliverySettings,
  SupportTicketCategory,
  SupportTicketStatus,
} from "../lib/store";
import type { FarmDeliveryInput, FarmDeliveryQuote } from "../lib/farm-delivery";
import { emptySnapshot } from "../lib/store";
import { getSupabaseBrowserClient } from "../lib/supabase-browser";

type AuthMode = "login" | "signup";

interface DajemContextValue {
  snapshot: DashboardSnapshot;
  currentUser: DashboardSnapshot["currentUser"];
  cartCount: number;
  isBootstrapping: boolean;
  isBusy: boolean;
  authMode: AuthMode;
  authError: string | null;
  authNotice: string | null;
  mfaRequired: boolean;
  openAuthModal: (mode?: AuthMode) => void;
  closeAuthModal: () => void;
  refresh: () => Promise<void>;
  requireAuth: (mode?: AuthMode) => boolean;
  register: (payload: {
    name: string;
    email: string;
    phone: string;
    country: string;
    address: string;
    state: string;
    localGovernment: string;
    password: string;
  }) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  login: (payload: { email: string; password: string }) => Promise<void>;
  verifyMfa: (code: string) => Promise<void>;
  logout: () => Promise<void>;
  navigateToUrl: (targetUrl: string) => Promise<void>;
  addToCart: (productId: string, quantity?: number, variant?: { variantKey?: string; variantLabel?: string }) => Promise<void>;
  updateCartItem: (productId: string, quantity: number, variant?: { variantKey?: string }) => Promise<void>;
  removeCartItem: (productId: string, variant?: { variantKey?: string }) => Promise<void>;
  clearCart: () => Promise<void>;
  quoteFarmDelivery: (payload: FarmDeliveryInput) => Promise<FarmDeliveryQuote>;
  createSupportTicket: (payload: { category: SupportTicketCategory; subject: string; message: string; orderId?: string }) => Promise<void>;
  updateSupportTicket: (payload: { ticketId: string; status: SupportTicketStatus; adminNote?: string }) => Promise<void>;
  submitBid: (payload: {
    propertyId: string;
    propertyTitle: string;
    propertyLocation: string;
    propertyPrice: number;
    bidAmount: number;
    notes?: string;
  }) => Promise<void>;
  submitPropertyListing: (payload: {
    title: string;
    location: string;
    price: number;
    type: PropertyType;
    category: PropertyCategory;
    listingGroup?: PropertyListing["listingGroup"];
    residenceType?: PropertyListing["residenceType"];
    beds?: number;
    baths?: number;
    size: number;
    summary: string;
    highlights?: string[];
    imageUrl?: string;
    agentCompany?: string;
    requestContactPublication?: boolean;
  }) => Promise<{ listing?: PropertyListing }>;
  submitPropertyListingPaymentProof: (propertyId: string, paymentProofPath: string) => Promise<void>;
  submitSurvey: (payload: {
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
    delivery?: {
      provider: "DHL Express";
      serviceName: string;
      fee: number;
      currency: "NGN";
      rateSource: "dajem-estimate" | "dhl-live";
      estimatedDelivery: string;
      recipientName: string;
      phone: string;
      email?: string;
      address: string;
      city: string;
      state: string;
      postalCode?: string;
      countryCode: string;
      status: SurveyDeliveryStatus;
    };
  }) => Promise<void>;
  updateBidStatus: (bidId: string, status: BidStatus) => Promise<void>;
  updatePropertyListingStatus: (propertyId: string, status: ApprovalStatus) => Promise<void>;
  upsertPropertyListing: (payload: {
    id?: string;
    title: string;
    location: string;
    price: number;
    type: PropertyType;
    category: PropertyCategory;
    listingGroup?: PropertyListing["listingGroup"];
    residenceType?: PropertyListing["residenceType"];
    beds?: number;
    baths?: number;
    size: number;
    featured?: boolean;
    imageUrl?: string;
    imageBg?: string;
    summary: string;
    highlights?: string[];
    status?: ApprovalStatus;
  }) => Promise<void>;
  upsertSurveyService: (payload: {
    id?: string;
    title: string;
    description: string;
    priceFrom: number;
    timeline: string;
    imageUrl?: string;
    color?: string;
    status?: ApprovalStatus;
  }) => Promise<void>;
  updateSurveyStatus: (surveyId: string, status: SurveyStatus) => Promise<void>;
  updateSurveyDelivery: (surveyId: string, status: SurveyDeliveryStatus, trackingNumber?: string) => Promise<void>;
  updateInventoryItem: (payload: {
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
  }) => Promise<void>;
  updateFarmDeliverySettings: (payload: FarmDeliverySettings) => Promise<void>;
  updateProfile: (payload: {
    name: string;
    phone: string;
    country: string;
    address: string;
    state: string;
    localGovernment: string;
  }) => Promise<void>;
  updateBrandLogo: (imageUrl: string) => Promise<void>;
  updatePropertyListingAgentPayment: (propertyId: string, status: NonNullable<PropertyListing["agentListingPaymentStatus"]>, paymentProofPath?: string) => Promise<void>;
  startPaymentCheckout: (provider: PaymentProvider, options?: { purpose?: PaymentPurpose; propertyListingId?: string; delivery?: FarmDeliveryInput }) => Promise<{ order?: Order; payment?: DajemActionResponse["payment"] }>;
  startFlutterwaveCheckout: () => Promise<{ order?: Order; payment?: DajemActionResponse["payment"] }>;
  verifyFlutterwaveCheckout: (params: { txRef: string; transactionId?: string }) => Promise<{ order?: Order }>;
}

const DajemContext = React.createContext<DajemContextValue | null>(null);
const DEFAULT_REFRESH_INTERVAL_MS = 60000;

function getRefreshIntervalMs() {
  const configuredInterval = Number(process.env.NEXT_PUBLIC_DAJEM_REFRESH_INTERVAL_MS ?? DEFAULT_REFRESH_INTERVAL_MS);
  if (!Number.isFinite(configuredInterval)) return DEFAULT_REFRESH_INTERVAL_MS;
  if (configuredInterval === 0) return 0;
  return Math.max(configuredInterval, 30000);
}

async function fetchSnapshot() {
  const response = await fetch("/api/platform", {
    credentials: "include",
    cache: "no-store",
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error ?? "Unable to load portal data.");
  }

  return data.snapshot as DashboardSnapshot;
}

export function DajemProvider({ children }: { children: React.ReactNode }) {
  const [snapshot, setSnapshot] = React.useState<DashboardSnapshot>(emptySnapshot);
  const [isBootstrapping, setIsBootstrapping] = React.useState(true);
  const [busyAction, setBusyAction] = React.useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = React.useState(false);
  const [authMode, setAuthMode] = React.useState<AuthMode>("login");
  const [authError, setAuthError] = React.useState<string | null>(null);
  const [authNotice, setAuthNotice] = React.useState<string | null>(null);
  const [mfaRequired, setMfaRequired] = React.useState(false);

  const refresh = React.useCallback(async () => {
    const nextSnapshot = await fetchSnapshot();
    setSnapshot(nextSnapshot);
  }, []);

  React.useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      try {
        const nextSnapshot = await fetchSnapshot();
        if (!cancelled) {
          setSnapshot(nextSnapshot);
        }
      } catch (error) {
        if (!cancelled) {
          setAuthError(error instanceof Error ? error.message : "Unable to boot the portal.");
        }
      } finally {
        if (!cancelled) {
          setIsBootstrapping(false);
        }
      }
    };

    const sync = () => {
      if (document.visibilityState === "visible") {
        void refresh();
      }
    };

    bootstrap();
    const refreshIntervalMs = getRefreshIntervalMs();
    const interval = refreshIntervalMs > 0 ? window.setInterval(sync, refreshIntervalMs) : null;
    window.addEventListener("focus", sync);
    document.addEventListener("visibilitychange", sync);

    return () => {
      cancelled = true;
      if (interval) {
        window.clearInterval(interval);
      }
      window.removeEventListener("focus", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [refresh]);

  const openAuthModal = React.useCallback((mode: AuthMode = "login") => {
    setAuthMode(mode);
    setAuthError(null);
    setAuthNotice(null);
    setMfaRequired(false);
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = React.useCallback(() => {
    setAuthModalOpen(false);
    setAuthError(null);
    setAuthNotice(null);
    setMfaRequired(false);
  }, []);

  const navigateToDashboard = React.useCallback(() => {
    if (typeof window !== "undefined") {
      window.location.assign(new URL("/dashboard", window.location.origin).toString());
    }
  }, []);

  const requireAuth = React.useCallback((mode: AuthMode = "login") => {
    if (snapshot.currentUser) return true;
    openAuthModal(mode);
    return false;
  }, [openAuthModal, snapshot.currentUser]);

  const postAction = React.useCallback(async (action: string, payload?: unknown) => {
    setBusyAction(action);
    setAuthError(null);

    try {
      const response = await fetch("/api/platform", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ action, payload }),
      });

      const contentType = response.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) {
        throw new Error(response.status === 403
          ? "Access was blocked by the website's security service. Please try another network or contact support."
          : "The website could not process your request. Please try again or contact support.");
      }
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? "Action failed.");
      }

      if (data.snapshot) {
        setSnapshot(data.snapshot as DashboardSnapshot);
      }

      return data as DajemActionResponse;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Action failed.";
      setAuthError(message);
      throw error;
    } finally {
      setBusyAction(null);
    }
  }, []);

  const register = React.useCallback(async (payload: {
    name: string;
    email: string;
    phone: string;
    country: string;
    address: string;
    state: string;
    localGovernment: string;
    password: string;
  }) => {
    const result = await postAction("register", payload);
    setAuthNotice(result.message ?? "Check your email to verify your account before signing in.");
  }, [postAction]);

  const resendVerification = React.useCallback(async (email: string) => {
    const result = await postAction("resend-verification", { email });
    setAuthNotice(result.message ?? "Check your email for a new verification link.");
  }, [postAction]);

  const finishSupabaseLogin = React.useCallback(async (accessToken: string) => {
    await postAction("complete-supabase-auth", { accessToken });
    setAuthModalOpen(false);
    setAuthError(null);
    setMfaRequired(false);
    navigateToDashboard();
  }, [navigateToDashboard, postAction]);

  const login = React.useCallback(async (payload: { email: string; password: string }) => {
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword(payload);
      if (!error && data.session && data.user) {
        if (!data.user.email_confirmed_at) {
          await supabase.auth.signOut();
          throw new Error("Please verify your email before signing in.");
        }
        const assurance = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (assurance.error) throw new Error(assurance.error.message);
        if (assurance.data.nextLevel === "aal2" && assurance.data.currentLevel !== "aal2") {
          setMfaRequired(true);
          setAuthNotice("Google Authenticator confirmation is required for this account.");
          return;
        }
        await finishSupabaseLogin(data.session.access_token);
        return;
      }
    }

    // Existing accounts remain available while they are safely moved to Supabase Auth.
    await postAction("login", payload);
    setAuthModalOpen(false);
    setAuthError(null);
    navigateToDashboard();
  }, [finishSupabaseLogin, navigateToDashboard, postAction]);

  const verifyMfa = React.useCallback(async (code: string) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) throw new Error("Google Authenticator is not configured yet.");
    const { data: factors, error: factorError } = await supabase.auth.mfa.listFactors();
    if (factorError) throw new Error(factorError.message);
    const factor = factors.totp.find((entry) => entry.status === "verified");
    if (!factor) throw new Error("No Google Authenticator setup was found for this account.");
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: factor.id });
    if (challengeError) throw new Error(challengeError.message);
    const { error: verifyError } = await supabase.auth.mfa.verify({ factorId: factor.id, challengeId: challenge.id, code });
    if (verifyError) throw new Error(verifyError.message);
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session?.access_token) throw new Error("Your secure session has expired. Please sign in again.");
    await finishSupabaseLogin(sessionData.session.access_token);
  }, [finishSupabaseLogin]);

  const logout = React.useCallback(async () => {
    await postAction("logout");
    setAuthModalOpen(false);
  }, [postAction]);

  const navigateToUrl = React.useCallback(async (targetUrl: string) => {
    if (typeof window === "undefined") return;

    const resolvedTarget = new URL(targetUrl, window.location.origin);
    window.location.assign(resolvedTarget.toString());
  }, []);

  const startPaymentCheckout = React.useCallback(async (
    provider: PaymentProvider,
    options: { purpose?: PaymentPurpose; propertyListingId?: string; delivery?: FarmDeliveryInput } = {},
  ) => {
    setBusyAction(`${provider}-checkout`);
    try {
      const response = await fetch("/api/flutterwave/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(options),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? "Checkout failed.");
      }
      if (data.snapshot) {
        setSnapshot(data.snapshot as DashboardSnapshot);
      }
      return {
        order: data.order as Order | undefined,
        payment: data.payment as DajemActionResponse["payment"] | undefined,
      };
    } finally {
      setBusyAction(null);
    }
  }, []);

  const startFlutterwaveCheckout = React.useCallback(async () => (
    startPaymentCheckout("flutterwave")
  ), [startPaymentCheckout]);

  const verifyFlutterwaveCheckout = React.useCallback(async (params: { txRef: string; transactionId?: string }) => {
    setBusyAction("flutterwave-verify");
    try {
      const query = new URLSearchParams({ tx_ref: params.txRef });
      if (params.transactionId) {
        query.set("transaction_id", params.transactionId);
      }

      const response = await fetch(`/api/flutterwave/verify?${query.toString()}`, {
        credentials: "include",
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? "Verification failed.");
      }
      if (data.snapshot) {
        setSnapshot(data.snapshot as DashboardSnapshot);
      }
      return {
        order: data.order as Order | undefined,
      };
    } finally {
      setBusyAction(null);
    }
  }, []);

  const value = React.useMemo<DajemContextValue>(() => ({
    snapshot,
    currentUser: snapshot.currentUser,
    cartCount: snapshot.cart.reduce((total, item) => total + item.quantity, 0),
    isBootstrapping,
    isBusy: busyAction !== null,
    authMode,
    authError,
    authNotice,
    mfaRequired,
    openAuthModal,
    closeAuthModal,
    refresh,
    requireAuth,
    register,
    resendVerification,
    login,
    verifyMfa,
    logout,
    navigateToUrl,
    addToCart: async (productId, quantity, variant) => {
      await postAction("add-to-cart", { productId, quantity, ...variant });
    },
    updateCartItem: async (productId, quantity, variant) => {
      await postAction("update-cart-item", { productId, quantity, ...variant });
    },
    removeCartItem: async (productId, variant) => {
      await postAction("remove-cart-item", { productId, ...variant });
    },
    clearCart: async () => {
      await postAction("clear-cart");
    },
    quoteFarmDelivery: async (payload) => {
      const result = await postAction("quote-farm-delivery", payload) as unknown as { quote: FarmDeliveryQuote };
      return result.quote as FarmDeliveryQuote;
    },
    createSupportTicket: async (payload) => {
      await postAction("create-support-ticket", payload);
    },
    updateSupportTicket: async (payload) => {
      await postAction("update-support-ticket", payload);
    },
    submitBid: async (payload) => {
      await postAction("submit-bid", payload);
    },
    submitPropertyListing: async (payload) => {
      const result = await postAction("submit-property-listing", payload);
      return { listing: result.listing };
    },
    submitPropertyListingPaymentProof: async (propertyId, paymentProofPath) => {
      await postAction("submit-property-listing-payment-proof", { propertyId, paymentProofPath });
    },
    submitSurvey: async (payload) => {
      await postAction("submit-survey", payload);
    },
    updateBidStatus: async (bidId, status) => {
      await postAction("update-bid-status", { bidId, status });
    },
    updatePropertyListingStatus: async (propertyId, status) => {
      await postAction("update-property-listing-status", { propertyId, status });
    },
    upsertPropertyListing: async (payload) => {
      await postAction("upsert-property-listing", payload);
    },
    upsertSurveyService: async (payload) => {
      await postAction("upsert-survey-service", payload);
    },
    updateSurveyStatus: async (surveyId, status) => {
      await postAction("update-survey-status", { surveyId, status });
    },
    updateSurveyDelivery: async (surveyId, status, trackingNumber) => {
      await postAction("update-survey-delivery", { surveyId, status, trackingNumber });
    },
    updateInventoryItem: async (payload) => {
      await postAction("update-inventory-item", payload);
    },
    updateFarmDeliverySettings: async (payload) => {
      await postAction("update-farm-delivery-settings", payload);
    },
    updateProfile: async (payload) => {
      await postAction("update-profile", payload);
    },
    updateBrandLogo: async (imageUrl) => {
      await postAction("update-brand-logo", { imageUrl });
    },
    updatePropertyListingAgentPayment: async (propertyId, status, paymentProofPath) => {
      await postAction("update-property-listing-agent-payment", { propertyId, status, paymentProofPath });
    },
    startPaymentCheckout,
    startFlutterwaveCheckout,
    verifyFlutterwaveCheckout,
  }), [
    authError,
    authNotice,
    authMode,
    busyAction,
    closeAuthModal,
    isBootstrapping,
    login,
    logout,
    navigateToUrl,
    openAuthModal,
    postAction,
    refresh,
    register,
    resendVerification,
    requireAuth,
    snapshot,
    startPaymentCheckout,
    startFlutterwaveCheckout,
    verifyFlutterwaveCheckout,
  ]);

  return (
    <DajemContext.Provider value={value}>
      {children}
      <AuthModal
        isOpen={authModalOpen}
        mode={authMode}
        isBusy={busyAction === "login" || busyAction === "register" || busyAction === "resend-verification"}
        error={authError}
        notice={authNotice}
        onClose={closeAuthModal}
        onModeChange={setAuthMode}
        onLogin={login}
        onRegister={register}
        onResendVerification={resendVerification}
        mfaRequired={mfaRequired}
        onVerifyMfa={verifyMfa}
      />
    </DajemContext.Provider>
  );
}

export function useDajem() {
  const context = React.useContext(DajemContext);
  if (!context) {
    throw new Error("useDajem must be used within a DajemProvider.");
  }
  return context;
}
