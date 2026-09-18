import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { completePaymentIntentFromGateway, getPaymentIntentForGateway } from "./server/platform-repository";

export const dynamic = "force-dynamic";

function webhookSignatureIsValid(request: NextRequest) {
  const expected = process.env.FLUTTERWAVE_WEBHOOK_HASH;
  const received = request.headers.get("verif-hash");
  if (!expected || !received || expected.length !== received.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(received));
}

export async function POST(request: NextRequest) {
  if (!webhookSignatureIsValid(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = await request.json();
    if (payload?.event !== "charge.completed") return NextResponse.json({ received: true });

    const transactionId = String(payload?.data?.id ?? "").trim();
    const txRef = String(payload?.data?.tx_ref ?? "").trim();
    if (!transactionId || !txRef) return NextResponse.json({ received: true });

    const intent = await getPaymentIntentForGateway(txRef);
    if (!intent) return NextResponse.json({ received: true });

    // Do not trust the webhook body: retrieve the payment directly from Flutterwave.
    const response = await fetch(`https://api.flutterwave.com/v3/transactions/${encodeURIComponent(transactionId)}/verify`, {
      headers: { Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}` },
      cache: "no-store",
    });
    const verified = await response.json();
    const payment = verified?.data;
    const isValid = response.ok
      && verified?.status === "success"
      && payment?.status === "successful"
      && payment?.tx_ref === txRef
      && Number(payment?.amount) === Number(intent.amount)
      && payment?.currency === intent.currency;

    if (!isValid) return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });

    await completePaymentIntentFromGateway(txRef, transactionId);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Flutterwave webhook processing failed.", error);
    return NextResponse.json({ error: "Unable to process notification." }, { status: 500 });
  }
}
