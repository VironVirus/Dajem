import { NextRequest, NextResponse } from "next/server";
import {
  addToCart,
  clearCart,
  createSupportTicket,
  getSnapshot,
  loginUser,
  registerUser,
  removeCartItem,
  submitBid,
  submitPropertyListing,
  submitPropertyListingPaymentProof,
  submitSurvey,
  updateBidStatus,
  updateCartItem,
  updateFarmDeliverySettings,
  updateInventoryItem,
  updatePropertyListingStatus,
  updatePropertyListingAgentPayment,
  updateSurveyDelivery,
  updateSurveyStatus,
  updateSupportTicket,
  upsertPropertyListing,
  upsertSurveyService,
  quoteFarmDeliveryForCheckout,
} from "./server/platform-repository";
import {
  clearSessionCookie,
  readSessionEmail,
  writeSessionCookie,
} from "./server/session";

export const dynamic = "force-dynamic";

function assertSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return;

  const host = request.headers.get("host");
  if (!host || new URL(origin).host !== host) {
    throw new Error("Cross-site requests are not allowed.");
  }
}

function jsonError(error: unknown, status = 400) {
  const message = error instanceof Error ? error.message : "Something went wrong.";
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: NextRequest) {
  try {
    const snapshot = await getSnapshot(readSessionEmail(request));
    return NextResponse.json({ snapshot });
  } catch (error) {
    return jsonError(error, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const sessionEmail = readSessionEmail(request);
    const body = await request.json();
    const action = body?.action as string | undefined;
    const payload = body?.payload ?? {};

    switch (action) {
      case "register": {
        const result = await registerUser(sessionEmail, payload);
        const response = NextResponse.json({
          snapshot: result.snapshot,
          message: result.message,
          preview: result.preview,
        });
        writeSessionCookie(response, result.sessionEmail);
        return response;
      }
      case "login": {
        const result = await loginUser(sessionEmail, payload);
        const response = NextResponse.json({
          snapshot: result.snapshot,
          message: result.message,
        });
        writeSessionCookie(response, result.sessionEmail);
        return response;
      }
      case "logout": {
        const snapshot = await getSnapshot(null);
        const response = NextResponse.json({
          snapshot,
          message: "You have been signed out.",
        });
        clearSessionCookie(response);
        return response;
      }
      case "add-to-cart":
        return NextResponse.json(await addToCart(sessionEmail, payload));
      case "update-cart-item":
        return NextResponse.json(await updateCartItem(sessionEmail, payload));
      case "remove-cart-item":
        return NextResponse.json(await removeCartItem(sessionEmail, payload));
      case "clear-cart":
        return NextResponse.json(await clearCart(sessionEmail));
      case "quote-farm-delivery":
        return NextResponse.json(await quoteFarmDeliveryForCheckout(sessionEmail, payload));
      case "create-support-ticket":
        return NextResponse.json(await createSupportTicket(sessionEmail, payload));
      case "submit-bid":
        return NextResponse.json(await submitBid(sessionEmail, payload));
      case "submit-property-listing":
        return NextResponse.json(await submitPropertyListing(sessionEmail, payload));
      case "submit-property-listing-payment-proof":
        return NextResponse.json(await submitPropertyListingPaymentProof(sessionEmail, payload));
      case "submit-survey":
        return NextResponse.json(await submitSurvey(sessionEmail, payload));
      case "update-bid-status":
        return NextResponse.json(await updateBidStatus(sessionEmail, payload));
      case "update-property-listing-status":
        return NextResponse.json(await updatePropertyListingStatus(sessionEmail, payload));
      case "update-property-listing-agent-payment":
        return NextResponse.json(await updatePropertyListingAgentPayment(sessionEmail, payload));
      case "upsert-property-listing":
        return NextResponse.json(await upsertPropertyListing(sessionEmail, payload));
      case "upsert-survey-service":
        return NextResponse.json(await upsertSurveyService(sessionEmail, payload));
      case "update-survey-status":
        return NextResponse.json(await updateSurveyStatus(sessionEmail, payload));
      case "update-survey-delivery":
        return NextResponse.json(await updateSurveyDelivery(sessionEmail, payload));
      case "update-inventory-item":
        return NextResponse.json(await updateInventoryItem(sessionEmail, payload));
      case "update-farm-delivery-settings":
        return NextResponse.json(await updateFarmDeliverySettings(sessionEmail, payload));
      case "update-support-ticket":
        return NextResponse.json(await updateSupportTicket(sessionEmail, payload));
      default:
        return jsonError(new Error("Unsupported platform action."), 404);
    }
  } catch (error) {
    return jsonError(error);
  }
}
