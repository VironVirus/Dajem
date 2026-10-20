# Dajem Integrations

## Current Architecture

- The public website now runs as one Next.js app from `apps/landing`.
- The main sections are `/`, `/farms`, `/properties`, `/survey`, `/dashboard`, and `/admin`.
- Login, cart, bids, survey requests, orders, inventory, dashboards, and admin tools share one server state layer.
- Hostinger should run the website and API routes.
- Supabase should persist shared data and store uploaded survey documents.
- Cloudflare can sit in front for DNS, CDN caching, WAF/security, and optional Turnstile.

## Supabase Setup

1. Create a Supabase project.
2. Run `supabase/dajem_state.sql` in the Supabase SQL editor.
3. Run `supabase/dajem_storage.sql` in the Supabase SQL editor.
4. Confirm the private Storage bucket named `dajem-documents` exists.
5. Copy `.env.hostinger.example` into your production environment checklist.
6. Set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

The shared state adapter switches from local filesystem mode to Supabase mode automatically when the Supabase service key is present.

## Hostinger Setup

Use one Node/Next.js app, not four deployments.

- Install command: `npm install`
- Build command: `npm run build`
- Start command: `npm run start`
- Active app workspace: `apps/landing`
- Detailed guide: `docs/hostinger-deployment-guide.md`

Set these environment variables in Hostinger:

- `DAJEM_SESSION_SECRET`
- `DAJEM_ADMIN_EMAIL`
- `DAJEM_ADMIN_PASSWORD`
- `DAJEM_ADMIN_PHONE`
- `NEXT_PUBLIC_DAJEM_SITE_URL=https://dajemgroup.com`
- `DAJEM_PUBLIC_APP_URL=https://dajemgroup.com`
- `DAJEM_RESEND_API_KEY`
- `DAJEM_EMAIL_FROM=DAJEM Group <accounts@dajemgroup.com>`
- `NEXT_PUBLIC_DAJEM_REFRESH_INTERVAL_MS=0`
- Supabase variables from the Supabase setup section

## Hostinger Limit Protection

- The app no longer polls the backend every 5 seconds.
- The Hostinger import file disables interval refresh with `NEXT_PUBLIC_DAJEM_REFRESH_INTERVAL_MS=0`.
- Set `NEXT_PUBLIC_DAJEM_REFRESH_INTERVAL_MS=60000` later to enable a light once-per-minute refresh.
- Successful user actions update the local dashboard state immediately, so frequent polling is not needed.
- Public image assets are cached for one year by browser cache headers.

## Flutterwave Setup

1. Add `NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY` and `FLUTTERWAVE_SECRET_KEY`.
2. Set the Flutterwave redirect/callback URL to `https://dajem.consolish.com/checkout/callback`.
3. Add a secret `FLUTTERWAVE_WEBHOOK_HASH` in Hostinger and set the same value in Flutterwave Webhooks.
4. Set the Flutterwave webhook URL to `https://dajem.consolish.com/api/flutterwave/webhook`.

The app validates the signed webhook and independently verifies the transaction with Flutterwave before issuing the order and receipt. The browser return page is a customer confirmation page; the webhook lets DAJEM record a verified payment even if the customer closes that page.

## Customer Account Email

New customer accounts must verify their email before they can log in. The same verified address receives password-reset links. Add a verified sender domain and API key from Resend to the three `DAJEM_*` email settings above. The application deliberately refuses new registrations until those settings are configured, preventing unverified account records and registration abuse.

## Managed Images

Run `supabase/dajem_media.sql` once in Supabase SQL Editor. Images uploaded through the Homes and admin workflows are limited to 5 MB, verified as JPG/PNG/WebP, converted to WebP, and watermarked with DAJEM before server-side Storage upload.

## DHL Survey Plan Delivery

The survey calculator includes an optional DHL-style document delivery checkout. Without DHL credentials, it uses the posted DAJEM Nigeria-zone estimates and clearly identifies them as estimates. It does not poll DHL, so it only uses a Hostinger API request when the client clicks **Calculate & Add Delivery**.

For live MyDHL account rates, create or connect a DHL Express business account, request MyDHL API access, and add these server-only Hostinger environment variables:

- `DHL_API_KEY`
- `DHL_API_SECRET`
- `DHL_ACCOUNT_NUMBER`
- `DHL_API_MODE=production`
- `DHL_ORIGIN_CITY=Enugu`
- `DHL_ORIGIN_POSTAL_CODE=400001`

Keep the DHL credentials server-side. The checkout rates a 0.5 kg document envelope measuring 35 x 25 x 2 cm. When the client submits the inquiry, the selected delivery fee and destination are stored with that survey request. Administrators can then update the delivery through **Rate Added**, **Awaiting Dispatch**, **Dispatched**, **Delivered**, or **Cancelled** and add the DHL tracking number from `/admin`; the client sees those updates in the survey tracker and shared dashboard.

Live shipment creation, label purchase, and courier pickup remain separate fulfillment steps to enable after DAJEM confirms its DHL account workflow. Until then, the administrator creates the shipment in the DHL business portal and records the issued tracking number in DAJEM.

## DAJEM Farms Delivery

DHL is used only for survey-plan delivery. DAJEM Farms delivery is free only within Enugu metropolis: Enugu East, Enugu North, and Enugu South. Checkout never adds a Farms delivery charge. Customers outside those areas pay for their items first, then receive a WhatsApp delivery-arrangement button in their dashboard with their order ID and payment status. Set that number in **Farms admin** → **Delivery contact**; the administrator can review the delivery address under **Farms admin** → **Farm orders**.

## Cloudflare Setup

Cloudflare is optional but recommended in front of Hostinger.

- Use Cloudflare DNS for the domain.
- Turn on CDN/caching for static assets.
- Add WAF/security rules if needed.
- Add Turnstile later by setting `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` after the widget is created.

## Admin Access

- Production admin credentials are configured through environment variables.
- Set `DAJEM_ADMIN_EMAIL` and `DAJEM_ADMIN_PASSWORD` before using `/admin`.
- Local development seeds `admin@dajem.local` / `ChangeMe123!` when no admin env vars are present.
