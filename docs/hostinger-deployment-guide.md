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
- `NEXT_PUBLIC_DAJEM_SITE_URL` only if the final domain changes from `https://dajem.consolish.com`

Use `.env.hostinger.example` as the public checklist/template.

Required values:

```text
DAJEM_SESSION_SECRET=replace-with-a-long-random-secret
DAJEM_ADMIN_EMAIL=group@dajemgroup.com
DAJEM_ADMIN_PASSWORD=replace-with-a-strong-password
DAJEM_ADMIN_PHONE=+2347032608449
NEXT_PUBLIC_DAJEM_SITE_URL=https://dajem.consolish.com
NEXT_PUBLIC_DAJEM_REFRESH_INTERVAL_MS=0
NEXT_PUBLIC_SUPABASE_URL=https://inkttilgzxkqhviejglb.supabase.co
SUPABASE_SERVICE_ROLE_KEY=replace-with-supabase-service-role-key
```

Optional values to add later only when those features are ready:

```text
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=
FLUTTERWAVE_SECRET_KEY=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
```

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
Output directory if requested: apps/landing/.next
```

If Hostinger asks for an entry file, leave it blank for Next.js when possible. The `npm run start` command starts the app.

If the build log shows `turbo run build` or `sh: turbo: command not found`, Hostinger is deploying an older version of the repository. Push the latest commit, then redeploy. The current root `build` script should run `npm run build --workspace landing`.

If Hostinger skips build-time packages because production env variables are active during install, keep the install command as `npm install --include=dev`. The runtime still starts in production through `next start`.

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
