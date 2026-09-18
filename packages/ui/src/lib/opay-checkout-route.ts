import { NextRequest, NextResponse } from "next/server";
import { completePaymentIntent, createPaymentIntent } from "./server/platform-repository";
import { readSessionEmail } from "./server/session";

export const dynamic = "force-dynamic";

function allowMockPayments() {
  return process.env.OPAY_MOCK_ENABLED !== "false"
    && (process.env.NODE_ENV !== "production" || process.env.DAJEM_ALLOW_MOCK_PAYMENTS === "true");
}

function assertSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return;
  const host = request.headers.get("host");
  if (!host || new URL(origin).host !== host) {
    throw new Error("Cross-site requests are not allowed.");
  }
}

// This adapter is intentionally local-only. It makes the payment choice testable
// without representing OPay as a configured live payment gateway.
export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    if (!allowMockPayments()) {
      throw new Error("OPay mock checkout is disabled. Configure an approved live OPay adapter before accepting real payments.");
    }

    const sessionEmail = readSessionEmail(request);
    const body = await request.json().catch(() => ({}));
    const purpose = body?.purpose === "property-listing-fee" ? "property-listing-fee" : "farm-order";
    const { intent } = await createPaymentIntent(sessionEmail, {
      provider: "opay",
      purpose,
      propertyListingId: body?.propertyListingId,
      delivery: body?.delivery,
    });
    const result = await completePaymentIntent(sessionEmail, {
      txRef: intent.txRef,
      provider: "OPay Mock",
    });

    return NextResponse.json({
      snapshot: result.snapshot,
      message: "OPay local mock checkout completed. No money was collected.",
      order: result.order,
      payment: { mode: "mock", provider: "opay", txRef: intent.txRef },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "OPay checkout failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
