# DAJEM Unified Hosting Plan

## App Shape

DAJEM now runs as one website, not four separate deployed apps.

- `/` - Group landing page
- `/farms` - DAJEM Farms
- `/properties` - DAJEM Homes
- `/survey` - DAJEM Orbital survey desk
- `/dashboard` - Shared user dashboard
- `/admin` - Shared admin portal
- `/checkout/callback` - Shared Flutterwave callback

The active deployable app is `apps/landing`. The old app folders are no longer part of the root workspace build and can be removed later after the unified app is confirmed.

## Hosting Responsibilities

- Hostinger hosts the Next.js website and API routes.
- Supabase stores shared app data and should be used for document/file storage.
- Cloudflare is optional for DNS, CDN caching, security, and Turnstile bot protection.
- Step-by-step deployment guide: `docs/hostinger-deployment-guide.md`

## Hostinger Limit Protection

The app avoids unnecessary background load by refreshing shared data at a safe interval instead of every few seconds.

- Production import file uses `NEXT_PUBLIC_DAJEM_REFRESH_INTERVAL_MS=0` to avoid background polling.
- Set `NEXT_PUBLIC_DAJEM_REFRESH_INTERVAL_MS=60000` later if you want light automatic refresh.
- User actions still update the dashboard immediately after each successful request.
- Static images are served with long browser cache headers.

## Production Environment

Set these in Hostinger:

```text
DAJEM_SESSION_SECRET=
DAJEM_ADMIN_EMAIL=
DAJEM_ADMIN_PASSWORD=
DAJEM_ADMIN_PHONE=
NEXT_PUBLIC_DAJEM_SITE_URL=https://dajem.consolish.com
NEXT_PUBLIC_DAJEM_REFRESH_INTERVAL_MS=0
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

Optional:

```text
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=
FLUTTERWAVE_SECRET_KEY=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
```
