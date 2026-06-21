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

export async function POST(request: NextRequest) {
  try {
    const sessionEmail = readSessionEmail(request);
    const { intent, snapshot } = await createPaymentIntent(sessionEmail);

    if (!process.env.FLUTTERWAVE_SECRET_KEY || !process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY) {
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
