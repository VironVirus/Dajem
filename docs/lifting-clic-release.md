# CLIC lifting release

This release contains the controlled lifting workflow but intentionally does not
place estate plot data in Git. Before enabling customer applications, the
Principal Consultant must configure `DAJEM_PRINCIPAL_CONSULTANT_EMAIL` to their
admin email in Hostinger and seed the reviewed CLIC catalogue privately.

Run from the repository with the production environment available locally:

```sh
node --env-file=.env.hostinger scripts/seed-approved-lifting-catalogue.cjs --confirm
```

The helper detects the configured Supabase or MySQL platform-state backend. It
accepts only the local ignored CLIC source catalogue and requires exactly 43
plots. It replaces the private lifting catalogue with CLIC only. It does not
seed other estates, owner contacts, or non-residential schedules.

Before allowing HEIC, HEIF or WEBP title documents, run the updated
`supabase/dajem_storage.sql` in the production Supabase SQL Editor. The app
fails safely for unsupported uploads until that bucket policy is updated.
