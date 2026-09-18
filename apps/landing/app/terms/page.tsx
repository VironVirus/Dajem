"use client";

import { Footer, Header } from "@repo/ui";

const sections = [
  ["Using DAJEM", "DAJEM Group Limited provides group, farms, property, survey, inquiry, payment, and account tools. You must provide accurate information, protect your login, and use the platform lawfully. A request, estimate, listing, or payment confirmation does not by itself create a professional-services, tenancy, sale, or agency agreement."],
  ["Accounts and submissions", "You are responsible for information and files submitted through your account. Property listings may be reviewed, approved, rejected, or removed. External-agent contact details remain unavailable to the public until the N20,000 listing fee is confirmed and the listing is approved."],
  ["Payments and invoices", "Prices, deposits, delivery estimates, and listing fees are shown before payment. Flutterwave transactions are processed by Flutterwave under its terms. A payment is treated as complete only after confirmation. Invoice references beginning DF, DH, or DS identify DAJEM Farms, DAJEM Homes, and DAJEM Survey transactions respectively."],
  ["Survey and delivery services", "Survey estimates are indicative unless an authorised DAJEM representative confirms scope, site conditions, statutory fees, and timing. DHL rate estimates are subject to confirmation, address validation, plan readiness, and courier terms. Survey outcomes remain subject to applicable professional and government requirements."],
  ["Images and intellectual property", "Uploaded images must be yours to use and must not infringe another person’s rights. We may convert supported images to WebP, resize them, and apply a DAJEM watermark. Do not upload unlawful, harmful, misleading, or sensitive material unless specifically requested through a secure process."],
  ["Privacy and data", "We collect account details, contact details, service requests, uploaded documents, payment references, and activity needed to deliver and improve the platform, comply with legal obligations, prevent fraud, and support customers. We do not expose agent contact details before the listing-fee condition is met. Contact group@dajemgroup.com for data questions."],
  ["Availability and liability", "The platform is provided as available. We may change features, prices, providers, or terms with reasonable notice where practical. To the extent allowed by law, DAJEM is not responsible for third-party provider outages, inaccurate user submissions, or indirect losses. Nothing here limits rights that cannot legally be excluded."],
  ["Contact and changes", "These terms are governed by applicable Nigerian law. For support, notices, or questions contact group@dajemgroup.com. Continued use after an updated effective date means acceptance of the updated terms."],
];

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header activeApp="landing" />
      <main className="flex-1 bg-muted/20 py-12 sm:py-16">
        <article className="container mx-auto max-w-3xl px-5 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">DAJEM Group Limited</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-5xl">Terms of Service</h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">Effective 17 September 2026. These terms apply across DAJEM Group, DAJEM Farms, DAJEM Homes, and DAJEM Orbital Resources.</p>
          <div className="mt-10 space-y-4">
            {sections.map(([title, body]) => (
              <section key={title} className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
                <h2 className="text-lg font-bold text-foreground">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
              </section>
            ))}
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
