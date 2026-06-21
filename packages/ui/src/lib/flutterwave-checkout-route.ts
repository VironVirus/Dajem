import { NextRequest, NextResponse } from "next/server";
import { createPaymentIntent, completePaymentIntent } from "./server/platform-repository";
import { readSessionEmail } from "./server/session";

export const dynamic = "force-dynamic";

function buildCallbackUrl(request: NextRequest) {
  return new URL("/checkout/callback", request.url).toString();
}

function buildApiHeaders() {
  return {
    Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
    "Content-Type": "application/json",
  };
}

function flutterwaveIsConfigured() {
  return Boolean(process.env.FLUTTERWAVE_SECRET_KEY && process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY);
}

function allowMockPayments() {
  return process.env.NODE_ENV !== "production" || process.env.DAJEM_ALLOW_MOCK_PAYMENTS === "true";
}

function assertSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return;

  const host = request.headers.get("host");
  if (!host || new URL(origin).host !== host) {
    throw new Error("Cross-site requests are not allowed.");
  }
}

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const sessionEmail = readSessionEmail(request);
    const { intent, snapshot } = await createPaymentIntent(sessionEmail);

    if (!flutterwaveIsConfigured()) {
      if (!allowMockPayments()) {
        throw new Error("Flutterwave keys are required before checkout can run in production.");
      }

      const result = await completePaymentIntent(sessionEmail, {
        txRef: intent.txRef,
        provider: "Simulation",
      });

      return NextResponse.json({
        snapshot: result.snapshot,
        message: "Simulated checkout completed.",
        order: result.order,
        payment: {
          mode: "mock",
          txRef: intent.txRef,
        },
      });
    }

    const callbackUrl = buildCallbackUrl(request);
    const customerEmail = sessionEmail ?? intent.userEmail;
    const createPaymentResponse = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: buildApiHeaders(),
      body: JSON.stringify({
        tx_ref: intent.txRef,
        amount: intent.amount,
        currency: intent.currency,
        redirect_url: callbackUrl,
        customer: {
          email: customerEmail,
        },
        customizations: {
          title: "Dajem Poultry Checkout",
          description: "Shared Dajem Poultry checkout powered by Flutterwave",
        },
      }),
      cache: "no-store",
    });

    const paymentPayload = await createPaymentResponse.json();
    if (!createPaymentResponse.ok || paymentPayload?.status !== "success") {
      throw new Error(paymentPayload?.message ?? "Unable to initialize Flutterwave checkout.");
    }

    return NextResponse.json({
      snapshot,
      message: "Redirecting to Flutterwave checkout.",
      payment: {
        mode: "redirect",
        txRef: intent.txRef,
        checkoutUrl: paymentPayload?.data?.link,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
