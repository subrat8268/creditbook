# KredBook PRD (5-Phase Vision)

KredBook is a strict single-mode digital khata for small businesses in India to track **Customers**, **Entries**, **Payments**, and total outstanding.

## Product Goals

- Fast capture: add an Entry or Payment in seconds.
- Financial clarity: always know who owes what and what is overdue.
- Offline reliability: works under poor connectivity without data loss.

## Canonical Screens

`Dashboard`, `People`, `Entries`, `Profile`.

## Phased Roadmap

- Phase 1 (Done): truth reset (Customer/Entry/Payment), offline-first foundations, basic flows, CSV export.
- Phase 2 (In Progress): reliability + polish: faster People/Entries, clearer overdue prioritization, better sync UX, tighter RLS, better export correctness.
- Phase 3: experience upgrades: dark mode, improved share surfaces (WhatsApp-first), and small quality-of-life wins (search, filters, faster capture).
- Phase 4 (AI): AI assistance as opt-in features: follow-up prioritization, smart summaries for a Customer, anomaly detection, and WhatsApp message drafts.
- Phase 5 (Documents + Collection): PDF outputs (Customer statement / Entry PDF), UPI collection (link/QR), and receipt-friendly sharing.

## In Scope (always)

- Customers, Entries, Payments
- Dashboard, People, Entries, Profile
- Offline-first sync, EN/HI localization
- CSV export

## Non-Goals (stay out of scope)

- Suppliers / distributor mode (legacy only)
- Product catalog / inventory
- Reports/GST as a platform
- Multi-user/team workflows
- Notifications/reminders as an active product feature

## Legacy Truth Rule

Legacy/transitional terms may exist in code (for example `order`, `party`). New docs and user-facing copy must use **Customer / Entry / Payment** and explicitly label any legacy references.
