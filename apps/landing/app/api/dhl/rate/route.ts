import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type DeliveryZone = "enugu" | "southeast" | "other";

const fallbackRates: Record<DeliveryZone, { amount: number; estimatedDelivery: string }> = {
  enugu: { amount: 10000, estimatedDelivery: "1-2 business days after dispatch" },
  southeast: { amount: 15000, estimatedDelivery: "2-3 business days after dispatch" },
  other: { amount: 20000, estimatedDelivery: "3-5 business days after dispatch" },
};

function assertSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return;

  const host = request.headers.get("host");
  if (!host || new URL(origin).host !== host) {
    throw new Error("Cross-site delivery requests are not allowed.");
  }
}

function normalizeText(value: unknown, maxLength = 100) {
  return String(value ?? "").trim().slice(0, maxLength);
}

function getPlannedShippingDate() {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 1);

  while (date.getUTCDay() === 0 || date.getUTCDay() === 6) {
    date.setUTCDate(date.getUTCDate() + 1);
  }

  return date.toISOString().slice(0, 10);
}

function formatEstimatedDelivery(value: unknown) {
  const parsed = new Date(String(value ?? ""));
  if (Number.isNaN(parsed.getTime())) return "DHL estimated transit shown at booking";

  return `Estimated by ${new Intl.DateTimeFormat("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Lagos",
  }).format(parsed)}`;
}

function buildFallbackRate(zone: DeliveryZone, note?: string) {
  return {
    provider: "DHL Express",
    serviceName: "DHL Express Document Delivery",
    currency: "NGN",
    source: "dajem-estimate",
    ...fallbackRates[zone],
    note: note ?? "DAJEM estimated DHL rate. Final DHL charge is confirmed when the shipment is booked.",
  };
}

async function requestLiveDhlRate(destination: { city: string; postalCode: string; countryCode: string }) {
  const apiKey = process.env.DHL_API_KEY?.trim();
  const apiSecret = process.env.DHL_API_SECRET?.trim();
  const accountNumber = process.env.DHL_ACCOUNT_NUMBER?.trim();

  if (!apiKey || !apiSecret || !accountNumber) return null;

  const baseUrl = process.env.DHL_API_MODE === "production"
    ? "https://express.api.dhl.com/mydhlapi"
    : "https://express.api.dhl.com/mydhlapi/test";
  const url = new URL(`${baseUrl}/rates`);
  const query = {
    accountNumber,
    originCountryCode: "NG",
    originPostalCode: process.env.DHL_ORIGIN_POSTAL_CODE?.trim() || "400001",
    originCityName: process.env.DHL_ORIGIN_CITY?.trim() || "Enugu",
    destinationCountryCode: destination.countryCode,
    destinationPostalCode: destination.postalCode,
    destinationCityName: destination.city,
    weight: "0.5",
    length: "35",
    width: "25",
    height: "2",
    plannedShippingDate: getPlannedShippingDate(),
    isCustomsDeclarable: "false",
    unitOfMeasurement: "metric",
  };

  Object.entries(query).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      Authorization: `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")}`,
    },
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  const payload = await response.json();

  if (!response.ok || !Array.isArray(payload?.products)) {
    throw new Error(payload?.detail ?? payload?.title ?? "DHL did not return a delivery rate.");
  }

  const product = payload.products.find((candidate: any) => (
    Array.isArray(candidate?.totalPrice)
    && candidate.totalPrice.some((price: any) => price?.priceCurrency === "NGN" && Number(price?.price) > 0)
  ));
  const price = product?.totalPrice?.find((candidate: any) => candidate?.priceCurrency === "NGN");

  if (!product || !price) {
    throw new Error("DHL did not return a Nigerian Naira rate for this address.");
  }

  return {
    provider: "DHL Express",
    serviceName: normalizeText(product.productName || product.productCode || "DHL Express Document Delivery"),
    amount: Math.round(Number(price.price)),
    currency: "NGN",
    estimatedDelivery: formatEstimatedDelivery(product?.deliveryCapabilities?.estimatedDeliveryDateAndTime),
    source: "dhl-live",
    note: "Indicative DHL account rate. Final charge and transit time are confirmed when the shipment is accepted.",
  };
}

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const payload = await request.json();
    const zone = normalizeText(payload?.zone) as DeliveryZone;
    const destination = {
      city: normalizeText(payload?.destination?.city),
      state: normalizeText(payload?.destination?.state),
      postalCode: normalizeText(payload?.destination?.postalCode, 20),
      countryCode: normalizeText(payload?.destination?.countryCode, 2).toUpperCase() || "NG",
    };

    if (!(zone in fallbackRates)) {
      return NextResponse.json({ error: "Select a valid Nigerian delivery zone." }, { status: 400 });
    }
    if (!destination.city || !destination.state || destination.countryCode !== "NG") {
      return NextResponse.json({ error: "Enter a valid Nigerian destination city and state." }, { status: 400 });
    }

    try {
      const liveRate = await requestLiveDhlRate(destination);
      return NextResponse.json(liveRate ?? buildFallbackRate(zone));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Live DHL rating is temporarily unavailable.";
      return NextResponse.json(buildFallbackRate(zone, `${message} DAJEM's estimated DHL rate is shown instead.`));
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to calculate delivery.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
