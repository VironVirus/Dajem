export type CheckoutDeliveryInput = {
  recipientName: string;
  phone: string;
  email?: string;
  address: string;
  state: string;
  localGovernment: string;
  postalCode?: string;
};

export type DeliveryRate = {
  provider: string;
  serviceName: string;
  amount: number;
  currency: "NGN";
  source: "dajem-estimate" | "dhl-live";
  estimatedDelivery: string;
  note: string;
};

const southeastStates = new Set(["abia", "anambra", "ebonyi", "enugu", "imo"]);

function normalizeText(value: unknown, maxLength = 160) {
  return String(value ?? "").trim().slice(0, maxLength);
}

function getPlannedShippingDate() {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 1);
  while (date.getUTCDay() === 0 || date.getUTCDay() === 6) date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

function formatEstimatedDelivery(value: unknown) {
  const parsed = new Date(String(value ?? ""));
  if (Number.isNaN(parsed.getTime())) return "DHL timing is confirmed when the shipment is booked";
  return `Estimated by ${new Intl.DateTimeFormat("en-NG", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Lagos" }).format(parsed)}`;
}

function estimatedDhlRate(state: string, note?: string): DeliveryRate {
  const regional = southeastStates.has(state.toLowerCase());
  return {
    provider: "DHL Express",
    serviceName: "DHL Express Delivery",
    amount: regional ? 15000 : 20000,
    currency: "NGN",
    source: "dajem-estimate",
    estimatedDelivery: regional ? "2-3 business days after dispatch" : "3-5 business days after dispatch",
    note: note ?? "DHL estimate. The final DHL charge is confirmed when the shipment is booked.",
  };
}

async function requestLiveDhlRate(destination: CheckoutDeliveryInput): Promise<DeliveryRate | null> {
  const apiKey = process.env.DHL_API_KEY?.trim();
  const apiSecret = process.env.DHL_API_SECRET?.trim();
  const accountNumber = process.env.DHL_ACCOUNT_NUMBER?.trim();
  if (!apiKey || !apiSecret || !accountNumber || !destination.postalCode) return null;

  const baseUrl = process.env.DHL_API_MODE === "production" ? "https://express.api.dhl.com/mydhlapi" : "https://express.api.dhl.com/mydhlapi/test";
  const url = new URL(`${baseUrl}/rates`);
  const query = {
    accountNumber,
    originCountryCode: "NG",
    originPostalCode: process.env.DHL_ORIGIN_POSTAL_CODE?.trim() || "400001",
    originCityName: process.env.DHL_ORIGIN_CITY?.trim() || "Enugu",
    destinationCountryCode: "NG",
    destinationPostalCode: destination.postalCode,
    destinationCityName: destination.localGovernment,
    weight: "0.5",
    length: "35",
    width: "25",
    height: "2",
    plannedShippingDate: getPlannedShippingDate(),
    isCustomsDeclarable: "false",
    unitOfMeasurement: "metric",
  };
  Object.entries(query).forEach(([key, value]) => url.searchParams.set(key, value));

  const response = await fetch(url, {
    headers: { Accept: "application/json", Authorization: `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")}` },
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  const payload = await response.json();
  if (!response.ok || !Array.isArray(payload?.products)) throw new Error(payload?.detail ?? payload?.title ?? "DHL did not return a delivery rate.");

  const product = payload.products.find((candidate: any) => Array.isArray(candidate?.totalPrice) && candidate.totalPrice.some((price: any) => price?.priceCurrency === "NGN" && Number(price?.price) > 0));
  const price = product?.totalPrice?.find((candidate: any) => candidate?.priceCurrency === "NGN");
  if (!product || !price) throw new Error("DHL did not return a Nigerian Naira rate for this address.");

  return {
    provider: "DHL Express",
    serviceName: normalizeText(product.productName || product.productCode || "DHL Express Delivery"),
    amount: Math.round(Number(price.price)),
    currency: "NGN",
    source: "dhl-live",
    estimatedDelivery: formatEstimatedDelivery(product?.deliveryCapabilities?.estimatedDeliveryDateAndTime),
    note: "DHL rate calculated for this address. Final timing is confirmed when the shipment is booked.",
  };
}

export function normalizeCheckoutDelivery(input: CheckoutDeliveryInput): CheckoutDeliveryInput {
  const delivery = {
    recipientName: normalizeText(input.recipientName, 120),
    phone: normalizeText(input.phone, 40),
    email: normalizeText(input.email, 180).toLowerCase() || undefined,
    address: normalizeText(input.address, 240),
    state: normalizeText(input.state, 100),
    localGovernment: normalizeText(input.localGovernment, 120),
    postalCode: normalizeText(input.postalCode, 20) || undefined,
  };
  if (!delivery.recipientName || !delivery.phone || !delivery.address || !delivery.state || !delivery.localGovernment) throw new Error("Complete the delivery address before continuing.");
  if (!/^\+[1-9]\d{6,14}$/.test(delivery.phone)) throw new Error("Enter a valid delivery phone number.");
  return delivery;
}

export async function quoteDhlDelivery(input: CheckoutDeliveryInput): Promise<DeliveryRate> {
  const destination = normalizeCheckoutDelivery(input);
  if (destination.state.toLowerCase() === "enugu") {
    return { provider: "DAJEM Delivery", serviceName: "Enugu delivery", amount: 5000, currency: "NGN", source: "dajem-estimate", estimatedDelivery: "Same day or next business day", note: "Flat Enugu delivery charge." };
  }
  try {
    return await requestLiveDhlRate(destination) ?? estimatedDhlRate(destination.state);
  } catch (error) {
    const message = error instanceof Error ? error.message : "DHL rate is temporarily unavailable.";
    return estimatedDhlRate(destination.state, `${message} A DHL estimate is shown instead.`);
  }
}
