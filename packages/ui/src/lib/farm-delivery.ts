import type { FarmDeliverySettings } from "./store";

export type FarmDeliveryInput = {
  recipientName: string;
  phone: string;
  email?: string;
  address: string;
  state: string;
  localGovernment: string;
  postalCode?: string;
  /** Rebuilt from the inventory on the server before a payment starts. */
  weightKg?: number;
};

export type FarmDeliveryQuote = {
  provider: "DAJEM Farms Delivery";
  serviceName: string;
  amount: number;
  currency: "NGN";
  source: "farm-state-rate" | "farm-rest-of-country";
  estimatedDelivery: string;
  note: string;
  requiresWhatsAppConfirmation: boolean;
};

function cleanText(value: unknown, maxLength = 160) {
  return String(value ?? "").trim().slice(0, maxLength);
}

function normalizedState(value: string) {
  return value.trim().toLocaleLowerCase("en-NG");
}

export function normalizeFarmDeliveryInput(input: FarmDeliveryInput): FarmDeliveryInput {
  const delivery = {
    recipientName: cleanText(input.recipientName, 120),
    phone: cleanText(input.phone, 40),
    email: cleanText(input.email, 180).toLowerCase() || undefined,
    address: cleanText(input.address, 240),
    state: cleanText(input.state, 100),
    localGovernment: cleanText(input.localGovernment, 120),
    postalCode: cleanText(input.postalCode, 20) || undefined,
    weightKg: Number.isFinite(Number(input.weightKg)) && Number(input.weightKg) > 0
      ? Math.min(Math.max(Number(input.weightKg), 0.1), 1000)
      : undefined,
  };

  if (!delivery.recipientName || !delivery.phone || !delivery.address || !delivery.state || !delivery.localGovernment) {
    throw new Error("Complete the delivery address before continuing.");
  }
  if (!/^\+[1-9]\d{6,14}$/.test(delivery.phone)) {
    throw new Error("Enter a valid delivery phone number.");
  }
  return delivery;
}

export function quoteFarmDelivery(input: FarmDeliveryInput, settings: FarmDeliverySettings): FarmDeliveryQuote {
  const destination = normalizeFarmDeliveryInput(input);
  const stateRate = settings.stateRates.find((rate) => normalizedState(rate.state) === normalizedState(destination.state));

  if (stateRate) {
    return {
      provider: "DAJEM Farms Delivery",
      serviceName: `${stateRate.state} farm delivery`,
      amount: stateRate.fee,
      currency: "NGN",
      source: "farm-state-rate",
      estimatedDelivery: stateRate.state.toLowerCase() === "enugu" ? "Same day or next business day" : "2-4 business days after confirmation",
      note: `Delivery fee set by DAJEM Farms for ${stateRate.state}.`,
      requiresWhatsAppConfirmation: false,
    };
  }

  return {
    provider: "DAJEM Farms Delivery",
    serviceName: "Rest of Nigeria farm delivery",
    amount: settings.restOfCountryFee,
    currency: "NGN",
    source: "farm-rest-of-country",
    estimatedDelivery: "Delivery timing confirmed after order review",
    note: "This is the rest-of-country delivery charge. Delivery costs may change for your location; confirm your paid order with DAJEM Farms on WhatsApp.",
    requiresWhatsAppConfirmation: true,
  };
}
