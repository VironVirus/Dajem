# Dajem Integrations

## What is live now

- Shared auth, cart, bids, surveys, orders, inventory, dashboards, and admin tools are now backed by a shared server state layer instead of isolated page-only mocks.
- Cross-app sign-in works through a signed cookie shared across `localhost` ports.
- Poultry checkout supports a simulated path by default and a Flutterwave initialization/verification flow when keys are present.
- The backend uses a shared filesystem state file for local development and can switch to Supabase automatically when the relevant env vars are configured.
- Cross-site navigation is environment-driven now, so production deploys no longer depend on hardcoded `localhost` URLs.

## Supabase setup

1. Create a Supabase project.
2. Run [`supabase/dajem_state.sql`](/C:/Users/user/Desktop/Dajem/supabase/dajem_state.sql:1) in the SQL editor.
3. Copy the values from [`C:/Users/user/Desktop/Dajem/.env.example`](/C:/Users/user/Desktop/Dajem/.env.example:1) into your local env file.
4. Set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY`
5. Restart the app servers. The shared state adapter will switch from filesystem mode to Supabase mode automatically.

Important:

- For separate Netlify sites, shared state should use Supabase. The filesystem fallback is fine locally, but it is not a reliable shared backend across multiple Netlify deploys.

## Flutterwave setup

1. Add `NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY` and `FLUTTERWAVE_SECRET_KEY`.
2. Keep the Poultry callback URL pointed at `/checkout/callback` for the deployed Poultry app.
3. Optional: add `FLUTTERWAVE_WEBHOOK_SECRET_HASH` later if you want to extend this into webhook verification.

## Netlify setup

Create one Netlify site per app and set:

- Repository base directory: repo root
- Package directory:
  - `apps/landing`
  - `apps/poultry`
  - `apps/real-estate`
  - `apps/survey`
- Build command: leave the app-level `netlify.toml` in place so each site uses its workspace build command automatically

Set these shared environment variables on every Netlify site:

- `DAJEM_SESSION_SECRET`
- `NEXT_PUBLIC_DAJEM_LANDING_URL`
- `NEXT_PUBLIC_DAJEM_POULTRY_URL`
- `NEXT_PUBLIC_DAJEM_REAL_ESTATE_URL`
- `NEXT_PUBLIC_DAJEM_SURVEY_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY`

Add these on Poultry as well:

- `NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY`
- `FLUTTERWAVE_SECRET_KEY`

Preview limitation on default `*.netlify.app` domains:

- Data can still be shared through Supabase.
- Login sessions will not automatically follow you between separate Netlify sites unless you later move them onto a shared custom domain and set `DAJEM_COOKIE_DOMAIN` like `.yourdomain.com`.

Each app now has its own `netlify.toml` with the workspace build command and local dev command.

## Default admin

- Email: `admin@dajem.com`
- Password: `Admin@Dajem123`
