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
  source: "farm-free-enugu" | "farm-admin-arrangement";
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

const enuguMetropolisLocalGovernments = new Set([
  "enugu east",
  "enugu north",
  "enugu south",
]);

export function isFreeEnuguMetropolisDelivery(state: string, localGovernment: string) {
  return normalizedState(state) === "enugu"
    && enuguMetropolisLocalGovernments.has(normalizedState(localGovernment));
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

export function quoteFarmDelivery(input: FarmDeliveryInput): FarmDeliveryQuote {
  const destination = normalizeFarmDeliveryInput(input);

  if (isFreeEnuguMetropolisDelivery(destination.state, destination.localGovernment)) {
    return {
      provider: "DAJEM Farms Delivery",
      serviceName: "Free delivery within Enugu metropolis",
      amount: 0,
      currency: "NGN",
      source: "farm-free-enugu",
      estimatedDelivery: "Same day or next business day",
      note: "Free delivery is available within Enugu East, Enugu North, and Enugu South only.",
      requiresWhatsAppConfirmation: false,
    };
  }

  return {
    provider: "DAJEM Farms Delivery",
    serviceName: "Delivery arrangement after payment",
    amount: 0,
    currency: "NGN",
    source: "farm-admin-arrangement",
    estimatedDelivery: "Delivery timing and charge confirmed after order review",
    note: "Delivery outside Enugu metropolis is arranged directly with DAJEM Farms after payment. Any delivery charge is confirmed separately and is not included at checkout.",
    requiresWhatsAppConfirmation: true,
  };
}
