# KredBook — Current Status

**Last Updated:** April 17, 2026

## Version

**KredBook v3.0** — Simple Digital Khata

---

## What's Implemented

### Core Features (v3.0)

| Feature | Status | Notes |
|---------|--------|-------|
| Authentication | ✅ Working | Email + Google OAuth |
| Dashboard | ✅ Working | Total outstanding + overdue list |
| People/Customers | ✅ Working | Add, list, search |
| Entries | ✅ Working | Create, list, detail |
| Payments | ✅ Working | Record, history |
| Profile | ✅ Working | Business name, language, sign out |
| Offline-first | ✅ Working | MMKV queue, auto-sync |
| Localization | ✅ Working | EN/HI toggle |
| Export | ✅ Working | CSV export |

### Navigation Structure

- **5 tabs**: Home → People → Add (FAB) → Entries → Profile
- **More sheet**: Profile Settings, Export, Sign Out

---

## What's NOT in Scope v3.0

| Feature | Status | Reason |
|---------|--------|--------|
| Suppliers | ❌ Removed | No longer needed |
| Products Catalog | ❌ Removed | Quick amount only |
| Reports | ❌ Removed | Single number is enough |
| GST | ❌ Removed | Not for small businesses |
| Multi-user | ❌ Removed | Single user app |
| Notifications | ❌ Removed | Future feature |

---

## Architecture Notes

- Routes use `/entries/` (NOT `/orders/`)
- Main tab FAB points to `/entries/create`
- "People" = Customers (unified)
- Quick amount-first entry (no product picker)

---

## Updates Required

When making changes to the product:

1. **Update this STATUS.md** with feature status
2. **Update PRD** if scope changes
3. Keep documentation in sync with implementation

**Rule:** If it's not needed to track credit between two people, it's not in scope.

---

## Documentation Rule

> **When any major change is made to the product, update this document.**

**What to update:**

| If you... | Then update... |
|----------|----------------|
| Add a new feature | PRD §3 (Key Features) + STATUS |
| Remove a feature | PRD §6 (What's NOT in Scope) + STATUS |
| Change navigation | PRD §4 (Core Screens) + STATUS |
| Change architecture | ARCHITECTURE.md + STATUS |

**Always keep:**
- This STATUS.md in sync with implementation
- PRD aligned with product scope
- Architecture docs match code