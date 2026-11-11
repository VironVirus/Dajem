# DAJEM security audit - 25 October 2026

## Scope and evidence

Reviewed the current Next.js API routes, session and authentication logic, Supabase integration, admin authorization, Flutterwave callbacks, media/document uploads, listing privacy, checkout state transitions, backup endpoints, and deployment examples. Ran a production build, TypeScript check, production-dependency audit, and local API/tests. This is a source and local-behavior audit, **not** a penetration test or a verification of live Hostinger, Supabase, Flutterwave, DNS, or storage-bucket settings. No live customer records or payments were changed.

## Fixed in this working tree

| Severity before fix | Issue | Change |
| --- | --- | --- |
| Critical | `DAJEM_ALLOW_MOCK_PAYMENTS=true` could mark production orders paid without a gateway transaction. | Production builds now refuse mock payment completion regardless of the flag. Use real Flutterwave test keys on staging. |
| High | Public listing snapshots included agents' private contact and payment-proof fields even when the UI hid them. | API responses now strip private fields; approved and paid listings expose only the intended contact fields. |
| High | A 30-day cookie remained valid after legacy password reset or 2FA enrollment. | Signed sessions are now versioned, validated against the current user record, and limited to 8 hours (1 hour for admin). Legacy reset and 2FA enrollment rotate the session version. Existing cookies will require a fresh sign-in. |
| High | A valid payment could fail to create an order if stock or a listing changed before the callback. | The payment is recorded as a paid `Action Required` order for manual fulfilment/refund review rather than disappearing. |
| Medium | Pending checkouts could receive duplicate invoice numbers. | Serial allocation now considers both existing orders and pending payment intents. |
| Medium | Admin could mark an agent fee paid without proof, overwrite submitted proof, and leave no audit trail. | Manual confirmation now requires proof or an existing paid order, preserves the proof path, and logs the status transition. Submitted proof paths must belong to the agent's upload area and exist in storage. |
| Medium | Some mutation endpoints accepted requests without an `Origin` header. | Browser write routes now require a matching origin. Security response headers and no-store snapshot/error responses were added. |
| Medium | Legacy login had no application-level attempt guard. | Added a bounded 8-failure/15-minute process-local guard. This is only defense in depth, not distributed rate limiting. |

Price, stock, listing, survey-service, and farm delivery-contact admin edits now create audit entries. The upload paths already restrict file types/sizes and the Flutterwave webhook verifies transactions with Flutterwave before order completion; those controls were retained.

## Remaining risks and required follow-up

1. **High - legacy admin login has no enforced authenticator 2FA.** The seeded admin password and legacy password route remain active for compatibility. Migrate the admin account to Supabase Auth, enrol TOTP, enforce `aal2` for every admin operation, and then disable legacy admin password login. Test recovery with a second administrator before disabling the old route to avoid lockout.
2. **High - Supabase password change does not immediately revoke existing DAJEM cookies.** The new cookie expires within 8 hours (1 hour for admins), but password changes made directly through Supabase do not rotate DAJEM's `sessionVersion`. Add a server-side password-change/revocation flow or a reliable auth event hook before treating this as complete account recovery.
3. **High - platform state and audit logs share one mutable JSON record.** A compromised database/admin credential could alter orders and remove audit evidence. Move transactions and audit events into separately permissioned tables, with append-only audit retention and independent encrypted backups. Current audit history is capped at 1,000 events.
4. **Medium - rate limiting is not distributed.** The new legacy guard resets on restart and can be bypassed across instances; proxy-supplied IP headers may be spoofed. Configure rate limits and bot challenges at Cloudflare/Hostinger, and review Supabase Auth limits for sign-up, sign-in, verification resend, and password recovery.
5. **Medium - admin step-up is missing for backup exports and financial overrides.** Require a recent MFA challenge before exporting all customer data, changing payment status, or changing prices. Limit who can access backup files and rotate export passphrases.
6. **Medium - live storage/privacy settings remain unverified.** Confirm the survey-document bucket is private, media bucket policy is intentional, Supabase service keys are server-only, RLS policies are least-privilege, and backup/restore jobs are actually completing. The in-app backup has a 20 MB upload limit and is not a substitute for a full database/storage disaster-recovery test.
7. **Medium - content security policy and full admin audit coverage remain.** Add a tested CSP (initially report-only) and extend audit entries to every admin status transition. Avoid enforcing an untested CSP because this app uses Next scripts and third-party checkout.

The stronger session check adds one platform-state read per authenticated API call. Monitor Hostinger/MySQL request load after release; a dedicated small session table is the longer-term way to keep revocation checks cheap.

## Release gates

- Confirm the production Flutterwave secret, webhook hash, callback, and test/live mode are correct. Exercise a test payment on staging and verify one order, one invoice, and idempotent webhook replay.
- Confirm a legacy customer, Supabase customer, and administrator can sign in after the cookie-version change; confirm MFA-enabled users cannot access protected actions with an old pre-MFA cookie.
- Confirm unpaid agent contacts cannot be read from `/api/platform`, paid contacts can be read only on approved listings, and a real admin can still edit listings.
- Verify Hostinger and Supabase access logs, storage policies, backups, recovery passphrase custody, and staging restore independently of this source review.

Current changes are local and have **not** been deployed to the live site by this audit.
