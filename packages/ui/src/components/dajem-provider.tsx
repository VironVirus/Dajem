"use client";

import * as React from "react";
import { AuthModal } from "./auth-modal";
import type {
  BidStatus,
  CommunicationPreview,
  DashboardSnapshot,
  DajemActionResponse,
  ApprovalStatus,
  InventoryCategory,
  InventoryStockStatus,
  Order,
  PropertyCategory,
  PropertyType,
  SurveyStatus,
} from "../lib/store";
import { emptySnapshot } from "../lib/store";

type AuthMode = "login" | "signup";

interface DajemContextValue {
  snapshot: DashboardSnapshot;
  currentUser: DashboardSnapshot["currentUser"];
  cartCount: number;
  isBootstrapping: boolean;
  isBusy: boolean;
  authMode: AuthMode;
  authError: string | null;
  authPreview: CommunicationPreview | null;
  openAuthModal: (mode?: AuthMode) => void;
  closeAuthModal: () => void;
  refresh: () => Promise<void>;
  requireAuth: (mode?: AuthMode) => boolean;
  register: (payload: { name: string; email: string; phone: string; password: string }) => Promise<void>;
  login: (payload: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateCartItem: (productId: string, quantity: number) => Promise<void>;
  removeCartItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
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
    beds?: number;
    baths?: number;
    size: number;
    summary: string;
    highlights?: string[];
    imageUrl?: string;
  }) => Promise<void>;
  submitSurvey: (payload: {
    location: string;
    serviceType: string;
    description: string;
    fileName?: string;
    fileSizeKb?: number;
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
  }) => Promise<void>;
  startFlutterwaveCheckout: () => Promise<{ order?: Order; payment?: DajemActionResponse["payment"] }>;
  verifyFlutterwaveCheckout: (params: { txRef: string; transactionId?: string }) => Promise<{ order?: Order }>;
}

const DajemContext = React.createContext<DajemContextValue | null>(null);

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
  const [authPreview, setAuthPreview] = React.useState<CommunicationPreview | null>(null);

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
      void refresh();
    };

    bootstrap();
    const interval = window.setInterval(sync, 5000);
    window.addEventListener("focus", sync);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.removeEventListener("focus", sync);
    };
  }, [refresh]);

  const openAuthModal = React.useCallback((mode: AuthMode = "login") => {
    setAuthMode(mode);
    setAuthError(null);
    setAuthPreview(null);
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = React.useCallback(() => {
    setAuthModalOpen(false);
    setAuthError(null);
    setAuthPreview(null);
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

  const register = React.useCallback(async (payload: { name: string; email: string; phone: string; password: string }) => {
    const result = await postAction("register", payload);
    setAuthPreview(result.preview ?? null);
  }, [postAction]);

  const login = React.useCallback(async (payload: { email: string; password: string }) => {
    await postAction("login", payload);
    setAuthModalOpen(false);
    setAuthError(null);
  }, [postAction]);

  const logout = React.useCallback(async () => {
    await postAction("logout");
    setAuthModalOpen(false);
    setAuthPreview(null);
  }, [postAction]);

  const startFlutterwaveCheckout = React.useCallback(async () => {
    setBusyAction("flutterwave-checkout");
    try {
      const response = await fetch("/api/flutterwave/checkout", {
        method: "POST",
        credentials: "include",
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
    authPreview,
    openAuthModal,
    closeAuthModal,
    refresh,
    requireAuth,
    register,
    login,
    logout,
    addToCart: async (productId, quantity) => {
      await postAction("add-to-cart", { productId, quantity });
    },
    updateCartItem: async (productId, quantity) => {
      await postAction("update-cart-item", { productId, quantity });
    },
    removeCartItem: async (productId) => {
      await postAction("remove-cart-item", { productId });
    },
    clearCart: async () => {
      await postAction("clear-cart");
    },
    submitBid: async (payload) => {
      await postAction("submit-bid", payload);
    },
    submitPropertyListing: async (payload) => {
      await postAction("submit-property-listing", payload);
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
    updateInventoryItem: async (payload) => {
      await postAction("update-inventory-item", payload);
    },
    startFlutterwaveCheckout,
    verifyFlutterwaveCheckout,
  }), [
    authError,
    authMode,
    authPreview,
    busyAction,
    closeAuthModal,
    isBootstrapping,
    login,
    logout,
    openAuthModal,
    postAction,
    refresh,
    register,
    requireAuth,
    snapshot,
    startFlutterwaveCheckout,
    verifyFlutterwaveCheckout,
  ]);

  return (
    <DajemContext.Provider value={value}>
      {children}
      <AuthModal
        isOpen={authModalOpen}
        mode={authMode}
        isBusy={busyAction === "login" || busyAction === "register"}
        error={authError}
        preview={authPreview}
        onClose={closeAuthModal}
        onModeChange={setAuthMode}
        onLogin={login}
        onRegister={register}
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
