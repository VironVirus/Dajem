# Hostinger Deployment Guide

This guide deploys DAJEM as one unified website:

- `/` - Group landing page
- `/farms` - DAJEM Farms
- `/properties` - DAJEM Homes
- `/survey` - DAJEM Orbital survey desk
- `/dashboard` - shared dashboard
- `/admin` - shared admin portal

The active app is `apps/landing`. Hostinger should deploy from the repository root.

## 1. Confirm The App Builds Locally

From the repo root, run:

```bash
npm install
npm run deploy:check
```

Expected result: the build completes and shows routes including `/farms`, `/properties`, `/survey`, `/dashboard`, and `/admin`.

## 2. Prepare Supabase

1. Create a Supabase project.
2. Open the Supabase SQL Editor.
3. Run `supabase/dajem_state.sql`.
4. Run `supabase/dajem_storage.sql`.
5. Open Storage and confirm the private bucket `dajem-documents` exists.
6. Copy these values from Supabase:
   - Project URL
   - Service role key

Important: keep the service role key secret. It should only be added to Hostinger environment variables, never pasted into client-side code.

## 3. Prepare Hostinger Environment Variables

Use `.env.hostinger` for direct import into Hostinger. The file is intentionally ignored by Git because it contains production secrets.

Before importing, replace these values:

- `SUPABASE_SERVICE_ROLE_KEY`
- `DAJEM_ADMIN_EMAIL`, `DAJEM_ADMIN_PASSWORD`, and `DAJEM_ADMIN_PHONE` if you want different admin details
- `NEXT_PUBLIC_DAJEM_SITE_URL` and `DAJEM_PUBLIC_APP_URL` only if the final domain changes from `https://dajemgroup.com`

Use `.env.hostinger.example` as the public checklist/template.

Required values:

```text
DAJEM_SESSION_SECRET=replace-with-a-long-random-secret
DAJEM_ADMIN_EMAIL=group@dajemgroup.com
DAJEM_ADMIN_PASSWORD=replace-with-a-strong-password
DAJEM_ADMIN_PHONE=+2347032608449
DAJEM_SUPPORT_WHATSAPP=2347032608449
NEXT_PUBLIC_DAJEM_SITE_URL=https://dajemgroup.com
DAJEM_PUBLIC_APP_URL=https://dajemgroup.com
NEXT_PUBLIC_DAJEM_REFRESH_INTERVAL_MS=0
NEXT_PUBLIC_SUPABASE_URL=https://inkttilgzxkqhviejglb.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=replace-with-supabase-publishable-key
SUPABASE_SERVICE_ROLE_KEY=replace-with-supabase-service-role-key
SUPABASE_STORAGE_BUCKET=dajem-documents
SUPABASE_MEDIA_BUCKET=dajem-media
DAJEM_RESEND_API_KEY=replace-with-resend-api-key
DAJEM_EMAIL_FROM=DAJEM Group <accounts@dajemgroup.com>
```

Optional values to add later only when those features are ready:

```text
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=
FLUTTERWAVE_SECRET_KEY=
DAJEM_ALLOW_MOCK_PAYMENTS=false
DHL_API_KEY=
DHL_API_SECRET=
DHL_ACCOUNT_NUMBER=
DHL_API_MODE=production
DHL_ORIGIN_CITY=Enugu
DHL_ORIGIN_POSTAL_CODE=400001
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
```

The DHL values are not required for deployment. Until they are added, the survey delivery checkout uses DAJEM's posted Nigeria-zone estimates. After you receive MyDHL API credentials, add the values in Hostinger Environment Variables, save, redeploy, and restart the app.

### Account verification and password recovery

DAJEM uses Supabase Auth for customer email confirmation, password recovery, and secure user identities. In Supabase, open **Authentication**:

1. In **URL Configuration**, set Site URL to `https://dajemgroup.com`.
2. Add `https://dajemgroup.com/auth/supabase` to Redirect URLs.
3. In **Email**, keep **Confirm email** enabled and configure a custom SMTP provider when ready for production volume.
4. Copy the project **Publishable key** from **Project Settings → API** into `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in Hostinger.
5. Redeploy, then create one customer test account and open the confirmation email.

The existing `SUPABASE_SERVICE_ROLE_KEY` stays server-only. Never expose it in browser code or commit it to Git. Resend variables remain only as a temporary legacy fallback and are not needed after Supabase Auth is configured.

Run `supabase/dajem_media.sql` in Supabase SQL Editor once before using image uploads. It creates the public `dajem-media` bucket used by the server to store 5 MB-or-smaller, WebP-converted, DAJEM-watermarked images. Never expose `SUPABASE_SERVICE_ROLE_KEY` in browser code.

For a private test deployment only, set `DAJEM_ALLOW_MOCK_PAYMENTS=true`. This enables Flutterwave's local mock checkout without collecting money; set it back to `false` before making the site public.

## 4. Push The Repo To GitHub

Hostinger’s GitHub deployment is the cleanest option.

```bash
git status
git add .
git commit -m "Prepare unified DAJEM app for Hostinger deployment"
git push
```

If you do not want to commit the old backup app folders later, remove them in a separate cleanup commit after confirming the unified app is live.

## 5. Create The Hostinger Node.js App

In Hostinger hPanel:

1. Go to Websites.
2. Choose Add Website.
3. Choose Deploy Web App or Node.js Web App.
4. Choose GitHub integration.
5. Select the DAJEM repository and deployment branch.
6. Select Next.js if Hostinger asks for the framework.
7. Use Node.js `20.x`.

Build settings:

```text
Install command: npm install --include=dev
Build command: npm run build
Start command: npm run start
Project/root path: repository root
Output directory if requested: .next
```

If Hostinger asks for an entry file, leave it blank for Next.js when possible. The `npm run start` command starts the app.

If the framework is shown as `Other`, use these values because this repository is a workspace with the actual Next.js app in `apps/landing`:

```text
Node.js version: 20.x
Project/root path: repository root
Install command: npm install --include=dev
Build command: npm run build
Start command: npm run start
Output directory: .next
Entry file: leave blank
```

If Hostinger offers a separate frontend/backend choice, choose the backend/server-side option. This app has Next.js API routes, so it must run as a Node.js server rather than as a static frontend.

If the build log does not show `npm run build --workspace landing`, Hostinger is deploying an older revision. Push the current commit, then redeploy.

If Hostinger skips build-time packages because production env variables are active during install, keep the install command as `npm install --include=dev`. The runtime starts in production through the generated standalone Next.js server.

If the browser console reports `ChunkLoadError` or a URL under `/_next/static/chunks/` returns `404`, deploy the latest commit containing the standalone asset-copy script, then use **Redeploy** followed by **Restart**. This ensures the standalone server and Hostinger's static asset layer receive the same Next.js build output.

### If the domain shows 403 Forbidden

A successful build does not by itself connect the domain to the Next.js process. If the domain shows Hostinger's `403 Forbidden` page:

1. Open the DAJEM Node.js website dashboard, not a separate PHP/HTML website dashboard.
2. If Hostinger provides a frontend/backend application type, confirm it is the backend/server-side option. If the only framework value available is `Other`, keep `Other` and use the server commands above.
3. Confirm `dajem.consolish.com` is connected to this Node.js website using `Connect domain`.
4. Confirm the Node.js application status is `Running`, then use `Restart`.
5. Redeploy once more so Hostinger regenerates the routing file at `public_html/.htaccess`.

Do not copy the Next.js build into `public_html` or create a static `index.html` as a workaround. The Node.js website must own the domain and route requests to the application. If the domain was first created as a normal website, it may need to be removed from that website (after taking a backup) before connecting it to the Node.js website.

To check each item in hPanel, open `Websites` and click `Dashboard` beside the Node.js website. Use `Settings & Redeploy` for the framework, root path, commands, and output directory; `Environment Variables` for the Supabase and DAJEM values; `Deployments` for the build result; and the `Running` status or `Restart` control for the server process. In `File Manager`, open `domains/dajem.consolish.com/public_html`, enable hidden files if necessary, and confirm Hostinger created `.htaccess` there. Do not edit or replace that file before trying a redeploy.

## 6. Add Environment Variables In Hostinger

In the Node.js app dashboard:

1. Open Environment Variables.
2. Choose Import from `.env` file.
3. Upload `.env.hostinger`, or paste the file contents.
4. Review the imported values and confirm the Supabase placeholders were replaced.
5. Save.
6. Redeploy the app so the variables are included in the build/runtime.

## 7. Test After Deployment

Open these pages:

```text
https://dajem.consolish.com/
https://dajem.consolish.com/farms
https://dajem.consolish.com/properties
https://dajem.consolish.com/survey
https://dajem.consolish.com/dashboard
https://dajem.consolish.com/admin
```

Then test:

1. Log in with the admin email/password configured in Hostinger.
2. Open `/admin` and confirm the admin portal loads.
3. Create a normal user account.
4. Submit a survey inquiry with an attachment.
5. Confirm the survey appears in `/dashboard` and `/admin`.
6. In Supabase Storage, confirm the file appears in `dajem-documents`.
7. Add a Farms item to cart and confirm the shared dashboard sees the order/cart flow.

## 7A. Complete Payments And Media Setup

Complete these steps after the new code is pushed and the Hostinger deployment has finished.

### Flutterwave

1. In Flutterwave Dashboard, create or open your business account.
2. Copy the public key and secret key for the environment you intend to use.
3. In Hostinger, open the DAJEM Node.js app, then **Environment Variables**.
4. Add `NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY` and `FLUTTERWAVE_SECRET_KEY`.
5. In Flutterwave, set the redirect URL to `https://dajem.consolish.com/checkout/callback`.
6. Create a long random `FLUTTERWAVE_WEBHOOK_HASH` value and add it in Hostinger.
7. In Flutterwave Webhooks, set the webhook URL to `https://dajem.consolish.com/api/flutterwave/webhook` and set the same secret hash.
8. Save the Hostinger variables, redeploy, then restart the app.
9. Make a small controlled payment and confirm that a receipt appears in `/dashboard` under **Bills**.

Do not enable `DAJEM_ALLOW_MOCK_PAYMENTS` on the public website. It is reserved for a private Flutterwave test environment and should remain `false` in production.

### Flutterwave Test Mode

1. In Flutterwave Dashboard, switch to **Test Mode** and copy the test public and secret keys.
2. Set `NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY` to the test public key and `FLUTTERWAVE_SECRET_KEY` to the test secret key in a private test deployment.
3. Generate a random webhook hash with `openssl rand -hex 32`, set it as `FLUTTERWAVE_WEBHOOK_HASH` in Hostinger, then use the same value in the Flutterwave test webhook settings.
4. Set the test redirect URL to `https://dajem.consolish.com/checkout/callback` and the test webhook URL to `https://dajem.consolish.com/api/flutterwave/webhook`.
5. Redeploy, sign in as a normal client, add a Farms item to cart, and pay using a Flutterwave test payment method from the Flutterwave test dashboard documentation.
6. Confirm the transaction redirects to the DAJEM payment status page, then open `/dashboard#billing` and confirm the receipt is present.
7. Before accepting real money, replace the test keys with live keys, keep the same redirect/webhook URLs, rotate the webhook hash, redeploy, and complete one controlled live transaction.

### Image Uploads

1. In Supabase SQL Editor, run `supabase/dajem_media.sql`.
2. In Supabase Storage, confirm that the `dajem-media` bucket exists and is public.
3. In Hostinger Environment Variables, confirm `SUPABASE_MEDIA_BUCKET=dajem-media` and the service role key are present.
4. Redeploy and restart the app.
5. Sign in as an admin and upload a Farm or Homes image from `/admin`.
6. Confirm that the saved image ends in `.webp`, carries the DAJEM watermark, and appears in Supabase Storage.
7. Submit one external Homes listing with an image and confirm the 5 MB limit is enforced.

### Client Billing And Receipts

1. Complete a controlled Farms checkout through Flutterwave.
2. Log in as that client and open `/dashboard`.
3. Open **Bills** and verify that the payment appears under **Payments you have made**.
4. Use **Download** and **Print** for the receipt.
5. Submit an external Homes listing with contact publication selected. Confirm the N20,000 listing bill appears, then confirm that the receipt is issued after payment.
6. In `/admin`, approve the listing and confirm the agent contact details appear only after the listing fee is confirmed.

## 8. Connect Cloudflare Optional Layer

Cloudflare is optional but useful.

Recommended first pass:

1. Put the domain DNS on Cloudflare.
2. Point DNS to Hostinger as Hostinger instructs.
3. Enable normal proxy/CDN protection.
4. Keep page caching conservative because the app has logged-in API routes.
5. Add Turnstile later for public forms if spam becomes a problem.

## 9. Keep Hostinger Usage Low

Already configured:

- App interval refresh is disabled in `.env.hostinger` for the lowest Hostinger load.
- Refresh only runs while the browser tab is visible.
- Static images have long browser cache headers.
- Uploaded documents go to Supabase Storage, not Hostinger disk.

To enable light automatic refresh later:

```text
NEXT_PUBLIC_DAJEM_REFRESH_INTERVAL_MS=60000
```

Users still see updates after actions they perform even when interval refresh is disabled.

## 10. Redeploying Later

For code changes:

```bash
git add .
git commit -m "Describe the change"
git push
```

Hostinger will redeploy from GitHub if automatic deployment is enabled. If not, open Hostinger hPanel, go to the Node.js app Deployments section, and click Redeploy.

For environment variable changes, save the variables in Hostinger and redeploy.
