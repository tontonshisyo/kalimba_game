# Short links

Normal sharing remains a self-contained compressed URL. Only the explicit shorten button sends a song to the `short-links` Edge Function. Links use `#s=` and a random 96-bit identifier. Shared songs are unlisted, not confidential.

Server setup: execute `short-links-schema.sql`, deploy `short-links-edge.ts` as `short-links` with platform JWT verification disabled. The handler validates the project's public API key; database RPCs and tables are service-role-only. No server secret is bundled in the browser. Runtime service credentials come from Supabase environment variables.

Limits: one creation request per originating IP per 180 seconds, including deduplicated requests; shared networks share the cooldown. IPs are stored only as salted hashes, with old cooldown records removed on new insertions. Songs retain the app's 2,000-note limit and have a 128 KiB request limit; more than 80 tones in a rolling second is rejected.

Canonical song content is hashed to reuse existing links. New insertions serialize quota checks. At 100 MiB of stored JSON, remove least-recently-opened entries first, breaking ties by use count and age, until below 90 MiB. This is a sharing-data budget, not a measurement of the whole PostgreSQL database. Other tables, indexes and database overhead require separate monitoring. Deleted short links return 404. Long URLs remain independent and users can save them with the restore-long-URL button. No existing catalog songs are deleted by this cleanup.

Private browser backups and Auth data are separate. Do not publish a database dump of feedback or contacts.
