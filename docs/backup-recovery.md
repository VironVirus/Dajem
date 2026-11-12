# Encrypted platform backup

An administrator can download an encrypted copy of platform records and files in the configured image and document buckets from Admin Centre > Overview. The passphrase must be at least 16 characters; keep it separately from the downloaded file. Losing it makes the backup unrecoverable. The file contains sensitive customer and account records, including password hashes.

The manual admin download and the Hostinger daily cron both produce the same encrypted format. The cron writes `daily.encrypted.json` as the most recent copy and dated archives such as `daily-20261112T000000Z.encrypted.json` at `$HOME/.dajem-private-backups`, outside the web root. It retains the newest seven dated archives by default; change `DAJEM_BACKUP_RETENTION_COUNT` only to a value from 2 through 31. A failed backup never prunes or replaces the prior latest archive. Confirm the cron schedule and output in Hostinger; a file's presence alone does not prove the next run will succeed. Backups fail if the configured buckets are unavailable, their files exceed 20 MB combined, or the encrypted archive exceeds 32 MB. Hosting request limits may be lower. The backup includes the platform state and uploaded objects in the configured buckets, but not Supabase Auth itself, application code, environment variables, hosting settings, bucket access policies, or files stored elsewhere. Back up those separately. For a consistent recovery point, pause site activity while creating a backup: records are checked for changes, but files and database updates cannot be captured in one transaction.

## Cron monitoring

Set `DAJEM_BACKUP_HEALTHCHECK_URL` to a private Healthchecks.io check URL. The cron sends `/start` before work, the base URL after a verified archive is written, and `/fail` after a failure. Configure the check for `0 0 * * *` in the Hostinger server timezone with a 90-minute grace period. This detects an unsuccessful run and a cron job that never starts. Optionally set `DAJEM_BACKUP_ALERT_EMAIL` alongside the existing `DAJEM_RESEND_API_KEY` and `DAJEM_EMAIL_FROM` values to receive an email when the script itself catches a failure. Do not expose the healthcheck URL, which acts as a monitoring credential. `DAJEM_BACKUP_FORCE_FAILURE_TEST=1` is for a one-time monitored test only; remove it immediately and run a normal backup afterwards.

To check a backup on a trusted machine, set the passphrase without placing it in shell history and run:

```sh
read -rs 'DAJEM_BACKUP_PASSPHRASE?Backup passphrase: '
export DAJEM_BACKUP_PASSPHRASE
node scripts/inspect-backup.cjs /path/to/dajem-records.encrypted.json
unset DAJEM_BACKUP_PASSPHRASE
```

The `read` command above is for zsh. The verifier prints only the backup date, not customer data. To produce a plaintext recovery file, pass its new path as a second argument; it is created with owner-only permissions and will not overwrite an existing file. Such a file is unencrypted and must be protected and removed once no longer needed.

## Staging-only recovery check

The Hostinger staging database is `u999427255_dajemstage`. An older recovery row may already exist there. The helper below creates SQL for a **new** `dajem_recovery_*` table in that database and does not replace the existing row or modify production. It supports backups with zero uploaded files only. Never use its unencrypted SQL against the live database.

1. Download `daily.encrypted.json` from Hostinger File Manager > **Access all files of Unlimited Web Hosting** > `.dajem-private-backups`. Keep the backup passphrase separate from the file.
2. On a trusted Mac, from the repository root, run `node scripts/prepare-staging-recovery.cjs ~/Downloads/daily.encrypted.json`. Type the automated backup passphrase at the hidden prompt. Do not post the passphrase or SQL file in chat or Git.
3. Note the printed target database, new table name, expected user/order counts, and state SHA-256. Confirm the target says `u999427255_dajemstage` before importing.
4. In Hostinger, open phpMyAdmin for **`u999427255_dajemstage`**, select **Import**, and choose the generated `staging-import.sql` from the printed private temporary path. Do not select `u999427255_dajem` or the Supabase production project.
5. After import, run the read-only `SELECT` statement at the end of that SQL file if phpMyAdmin did not show its result. Confirm one row with `state_key=platform`, counts matching step 3, and `state_sha256` matching the printed hash. Do not open or share the full `value` column.
6. Remove the temporary plaintext SQL file after the counts and hash match. Keep the encrypted backup and its passphrase separately. If import fails, stop and inspect the exact error; do not rerun the same SQL blindly because the new table may already exist.

This proves records can be decrypted and imported into an isolated table. It does **not** prove that Supabase Auth accounts, uploaded files, or a staging application are restored. There is no in-app restore button yet. Before connecting a staging application to recovered data, isolate it from live payments, messages, and webhooks and keep customer information out of a public staging application.

## Staging-only uploaded-file recovery check

`dajem-media` and `dajem-documents` are backed up with the platform archive, but only a restore test proves that an uploaded object can be recovered. Use a separate Supabase staging project, never the production project `inkttilgzxkqhviejglb`. The recovery helper refuses that production project, refuses unsafe paths and unknown buckets, defaults to dry-run mode, requires a typed staging project reference before uploads, does not overwrite existing objects, and verifies the restored bytes with SHA-256.

1. Upload one harmless test image or document through the normal DAJEM admin flow. Do not use customer or identity documents for this check.
2. Run the backup and download its encrypted JSON archive. Confirm the backup output reports at least one file and a non-zero byte count.
3. In a private terminal on a trusted Mac, set the staging Supabase URL and service-role key. Do not place either value in a source file, Git, or chat.

   ```zsh
   read -r 'DAJEM_STAGING_SUPABASE_URL?Staging Supabase URL: '
   export DAJEM_STAGING_SUPABASE_URL
   read -rs 'DAJEM_STAGING_SUPABASE_SERVICE_ROLE_KEY?Staging service-role key: '
   echo
   export DAJEM_STAGING_SUPABASE_SERVICE_ROLE_KEY
   ```

4. First inspect the archive without changing staging. Run `node scripts/restore-backup-files.cjs ~/Downloads/daily.encrypted.json`, enter the backup passphrase at the hidden prompt, and confirm that the printed path, file count, byte count, and SHA-256 match the uploaded test file.
5. Run the same command with `--apply`. When prompted, type the staging project reference shown in the prompt exactly. The helper uploads only files that do not already exist and downloads each one again to verify its SHA-256.
6. In the staging Supabase dashboard, confirm that the test object is present in the expected private bucket. Download it only within staging and compare its contents to the harmless original. Do not make a recovered private bucket public merely for this test.
7. Delete the harmless staging test object after verification, then clear the temporary terminal variables: `unset DAJEM_STAGING_SUPABASE_URL DAJEM_STAGING_SUPABASE_SERVICE_ROLE_KEY`.

This helper restores files only. It does not restore users, MFA factors, policies, application code, payments, or production records.

Restoring production requires a tested, controlled recovery process, a fresh rollback backup, and a maintenance window. Never import this file into a running system without validating the target, media, and transaction consistency. After a breach, rotate compromised credentials and review what caused the breach before bringing a restored system online.
