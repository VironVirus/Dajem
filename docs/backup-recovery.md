# Encrypted platform backup

An administrator can download an encrypted copy of platform records and files in the configured image and document buckets from Admin Centre > Overview. The passphrase must be at least 16 characters; keep it separately from the downloaded file. Losing it makes the backup unrecoverable. The file contains sensitive customer and account records, including password hashes.

This is a manual backup, not an automatic daily backup. It fails if the configured buckets are unavailable, their files exceed 20 MB combined, or the encrypted archive exceeds 32 MB. Hosting request limits may be lower. It includes uploaded objects from those buckets, but not application code, environment variables, hosting settings, bucket access policies, or files stored elsewhere. Back up those separately. A one-copy backup can be overwritten after a breach; retain an independent offline copy. For a consistent recovery point, pause site activity while creating a backup: records are checked for changes, but files and database updates cannot be captured in one transaction.

To check a backup on a trusted machine, set the passphrase without placing it in shell history and run:

```sh
read -rs 'DAJEM_BACKUP_PASSPHRASE?Backup passphrase: '
export DAJEM_BACKUP_PASSPHRASE
node scripts/inspect-backup.cjs /path/to/dajem-records.encrypted.json
unset DAJEM_BACKUP_PASSPHRASE
```

The `read` command above is for zsh. The verifier prints only the backup date, not customer data. To produce a plaintext recovery file, pass its new path as a second argument; it is created with owner-only permissions and will not overwrite an existing file. Such a file is unencrypted and must be protected and removed once no longer needed.

There is no in-app restore button yet. A private storage bucket and a separate Hostinger database have been created for the planned staging recovery; neither is yet connected to a restore process. The existing primary database is not the staging database. The staging application must be isolated from live payments, messages, and webhooks. Do not put production credentials or customer information in a public staging application.

Restoring production requires a tested, controlled recovery process, a fresh rollback backup, and a maintenance window. Never import this file into a running system without validating the target, media, and transaction consistency. After a breach, rotate compromised credentials and review what caused the breach before bringing a restored system online.
