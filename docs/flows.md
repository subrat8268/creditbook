# KredBook — Core User Flows

> **Last Updated**: April 18, 2026
> **Version**: v3.0 Simplified

---

## Overview

This document is the quick reference for KredBook user flows.

For detailed specifications, see individual flow files in `docs/flows/`.

### Flow Files

| Flow | File | Description |
|------|------|-------------|
| Add Customer | `flows/add-customer.md` | Adding new people |
| Add Entry | `flows/add-entry.md` | Recording what customer owes |
| Record Payment | `flows/record-payment.md` | Recording payments received |
| Customer Detail | `flows/customer-detail.md` | Viewing customer + transactions |
| View Dashboard | `flows/dashboard.md` | Dashboard flow |

---

## Quick Reference

### Navigation Map

```
Dashboard (Home)
├── Add Entry → Entry Create
├── Top Overdue → Pay → Entry Create (with customer)
└── Tap customer → Customer Detail

People
├── Tap card → Entry Create (with customer)
├── Long press → Customer Detail
└── Inline add → Add Person

Entries
├── Tap card → Entry Detail
│   └── Record Payment → Payment Modal
└── FAB → Entry Create
```

### Common Actions

| Action | Path |
|--------|------|
| Add customer | People → Inline form |
| Add entry | FAB → Amount → Save |
| Record payment | Customer Detail → Record Payment |
| View balance | Dashboard / Customer Detail |
| Export data | Profile → Export |

---

### Balance States

| State | Hero Color | Shows |
|-------|------------|-------|
| Has dues | Red gradient | Amount + "TOTAL DUE" |
| Overdue | Red gradient | Amount + "OVERDUE Xd" |
| Cleared (₹0) | Green gradient | "SETTLED" |
| Advance (< 0) | Green gradient | "ADVANCE" |

---

### Quick Actions

| Screen | Actions |
|--------|---------|
| Dashboard | Add Entry, Pay |
| People | Add Person, Create Entry |
| Customer Detail | Add Entry, Record Payment, Share |
| Entries | View Detail, Record Payment |

---

**Updated: April 18, 2026**

For detailed flow specifications, see `docs/flows/` directory.