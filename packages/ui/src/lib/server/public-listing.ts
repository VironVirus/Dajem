import type { PropertyListing } from "../store";

export function propertyListingForViewer(listing: PropertyListing, viewerEmail: string | null): PropertyListing {
  const ownsListing = Boolean(viewerEmail && listing.submittedByEmail?.toLowerCase() === viewerEmail.toLowerCase());
  if (ownsListing) return listing;

  const { submittedByName: _submittedByName, submittedByEmail: _submittedByEmail,
    submittedByPhone: _submittedByPhone, agentPaymentProofPath: _agentPaymentProofPath,
    agentName, agentEmail, agentPhone, ...publicListing } = listing;
  const result = { ...publicListing, isExternalSubmission: Boolean(listing.submittedByEmail) };
  return listing.submittedByEmail && listing.status === "Approved" && listing.agentListingPaymentStatus === "Paid"
    ? { ...result, agentName, agentEmail, agentPhone }
    : result;
}
