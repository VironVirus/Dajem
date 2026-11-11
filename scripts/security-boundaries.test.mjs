import { test } from "node:test";
import assert from "node:assert/strict";
import { propertyListingForViewer } from "../packages/ui/src/lib/server/public-listing.ts";
import { mockPaymentsAllowed } from "../packages/ui/src/lib/payment-policy.ts";
import { assertLegacyLoginAllowed, legacyLoginKey, recordLegacyLoginFailure, clearLegacyLoginFailures } from "../packages/ui/src/lib/server/legacy-login-throttle.ts";

const listing = {
  id: "PROP-TEST", title: "Test property", status: "Approved",
  submittedByName: "Agent", submittedByEmail: "agent@example.com", submittedByPhone: "+234800000001",
  agentName: "Agent", agentEmail: "agent@example.com", agentPhone: "+234800000001",
  agentPaymentProofPath: "private/payment-proof.png", agentListingPaymentStatus: "Awaiting Payment",
};

test("unpaid listing does not expose agent contact or payment proof", () => {
  const publicListing = propertyListingForViewer(listing, null);
  assert.equal(publicListing.isExternalSubmission, true);
  for (const key of ["submittedByName", "submittedByEmail", "submittedByPhone", "agentName", "agentEmail", "agentPhone", "agentPaymentProofPath"]) {
    assert.equal(key in publicListing, false, key);
  }
});

test("paid approved listing exposes agent contact but not submission records", () => {
  const publicListing = propertyListingForViewer({ ...listing, agentListingPaymentStatus: "Paid" }, null);
  assert.equal(publicListing.agentEmail, "agent@example.com");
  assert.equal(publicListing.agentPaymentProofPath, undefined);
  assert.equal(publicListing.submittedByEmail, undefined);
});

test("owner retains private submission data; unapproved listing does not expose contact", () => {
  assert.equal(propertyListingForViewer(listing, "AGENT@example.com").agentPaymentProofPath, "private/payment-proof.png");
  assert.equal(propertyListingForViewer({ ...listing, status: "Pending Approval", agentListingPaymentStatus: "Paid" }, null).agentEmail, undefined);
});

test("official listing is not mislabelled or given private agent contact", () => {
  const official = propertyListingForViewer({ ...listing, submittedByEmail: undefined, agentListingPaymentStatus: "Paid" }, null);
  assert.equal(official.isExternalSubmission, false);
  assert.equal(official.agentEmail, undefined);
});

test("production cannot enable mock payments with an environment flag", () => {
  assert.equal(mockPaymentsAllowed("production"), false);
  assert.equal(mockPaymentsAllowed("development"), true);
});

test("legacy login is delayed after repeated failures", () => {
  const key = legacyLoginKey(`test-${Date.now()}@example.com`, "127.0.0.1");
  for (let index = 0; index < 8; index += 1) recordLegacyLoginFailure(key);
  assert.throws(() => assertLegacyLoginAllowed(key), /Too many sign-in attempts/);
  clearLegacyLoginFailures(key);
  assert.doesNotThrow(() => assertLegacyLoginAllowed(key));
});
