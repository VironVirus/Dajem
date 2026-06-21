import { NextRequest, NextResponse } from "next/server";
import { completePaymentIntent, getPaymentIntent } from "./server/platform-repository";
import { readSessionEmail } from "./server/session";

export const dynamic = "force-dynamic";

function flutterwaveIsConfigured() {
  return Boolean(process.env.FLUTTERWAVE_SECRET_KEY && process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY);
}

function allowMockPayments() {
  return process.env.NODE_ENV !== "production" || process.env.DAJEM_ALLOW_MOCK_PAYMENTS === "true";
}

export async function GET(request: NextRequest) {
  try {
    const sessionEmail = readSessionEmail(request);
    const txRef = request.nextUrl.searchParams.get("tx_ref");
    const transactionId = request.nextUrl.searchParams.get("transaction_id");

    if (!txRef) {
      throw new Error("Missing transaction reference.");
    }

    const intent = await getPaymentIntent(txRef);
    if (!intent) {
      throw new Error("Payment session not found.");
    }

    if (!flutterwaveIsConfigured()) {
      if (!allowMockPayments()) {
        throw new Error("Flutterwave verification is not configured.");
      }

      const result = await completePaymentIntent(sessionEmail ?? intent.userEmail, {
        txRef,
        provider: "Simulation",
      });

      return NextResponse.json({
        snapshot: result.snapshot,
        message: result.message,
        order: result.order,
      });
    }

    if (!transactionId) {
      throw new Error("Missing Flutterwave transaction id.");
    }

    const verificationResponse = await fetch(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
      },
      cache: "no-store",
    });

    const verificationPayload = await verificationResponse.json();
    if (!verificationResponse.ok || verificationPayload?.status !== "success") {
      throw new Error(verificationPayload?.message ?? "Flutterwave verification failed.");
    }

    const data = verificationPayload?.data;
    const statusIsValid = data?.status === "successful";
    const referenceMatches = data?.tx_ref === txRef;
    const amountMatches = Number(data?.amount) >= Number(intent.amount);
    const currencyMatches = data?.currency === intent.currency;

    if (!statusIsValid || !referenceMatches || !amountMatches || !currencyMatches) {
      throw new Error("Flutterwave verification did not match the expected order details.");
    }

    const result = await completePaymentIntent(sessionEmail ?? intent.userEmail, {
      txRef,
      provider: "Flutterwave",
      transactionId,
    });

    return NextResponse.json({
      snapshot: result.snapshot,
      message: result.message,
      order: result.order,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Verification failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
