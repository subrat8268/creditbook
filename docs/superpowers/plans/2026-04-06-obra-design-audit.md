# Obra Design-to-Code Sync Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Execute a highly-meticulous, one-by-one screen audit of the KredBook React Native/Expo application as 'Obra' to ensure pixel-perfect fidelity with the Figma mockups.

**Architecture:** We are refactoring UI files to systematically eradicate raw hex codes, enforce NativeWind classes mapped from `src/utils/theme.ts`, replace outdated modal modules with `@gorhom/bottom-sheet`, and ensure `SafeAreaView` layout consistency.

**Tech Stack:** React Native, Expo, NativeWind, tailwindcss, Lucide Icons, @gorhom/bottom-sheet, SafeAreaContext.

---

### Task 1: Initialize Tracker & Dashboard Audit

**Files:**
- Create: `docs/DESIGN_AUDIT_LOG.md`
- Modify: `app/(main)/dashboard/index.tsx`

- [ ] **Step 1: Write the initial CHANGELOG**
- [ ] **Step 2: Compare Dashboard with 'Seller Dashboard.png' / 'Both View.png'**
- [ ] **Step 3: Refactor Dashboard UI** (Eradicate hex, verify Hero card gradients, FAB positioning, Stat card spacing)
- [ ] **Step 4: Commit Phase 1 - Dashboard**

### Task 2: Customers List Audit

**Files:**
- Modify: `app/(main)/customers/index.tsx`

- [ ] **Step 1: Compare with 'Customers List.png'**
- [ ] **Step 2: Refactor UI** (Verify Pill search bar, underline tabs, deterministic avatar colors, eradicate hex)
- [ ] **Step 3: Log to DESIGN_AUDIT_LOG.md**
- [ ] **Step 4: Commit Phase 1 - Customers List**

### Task 3: Customer Detail Audit

**Files:**
- Modify: `app/(main)/customers/[customerId].tsx`

- [ ] **Step 1: Compare with 'Customer Detail Screen.png' & Empty Screen**
- [ ] **Step 2: Refactor UI** (Check Red gradient hero, transaction feed borders)
- [ ] **Step 3: Log and Commit**

### Task 4: Products List Audit

**Files:**
- Modify: `app/(main)/products/index.tsx`

- [ ] **Step 1: Compare with 'Products List Screen.png'**
- [ ] **Step 2: Refactor UI** (Category chips scroll, single-row layout with tinted icon boxes)
- [ ] **Step 3: Log and Commit**

### Task 5: Product Detail Audit

**Files:**
- Modify: `app/(main)/products/[productId].tsx`

- [ ] **Step 1: Compare with 'Product Detail Screen.png'**
- [ ] **Step 2: Refactor UI** (Hero image borders, active/inactive variations, sticky bottom CTA)
- [ ] **Step 3: Log and Commit**

### Task 6: Product Modals Audit

**Files:**
- Modify: `app/(main)/products/...` (Add, Edit, Delete Modals)

- [ ] **Step 1: Compare with Modal Target images**
- [ ] **Step 2: Enforce @gorhom/bottom-sheet and spacing**
- [ ] **Step 3: Log and Commit**

### Task 7: Supplier Modals Audit

**Files:**
- Modify: Supplier modals

- [ ] **Step 1: Compare with Supplier Target Images**
- [ ] **Step 2: Enforce @gorhom/bottom-sheet and check expanding bank details accordion clipping**
- [ ] **Step 3: Log and Commit**

### Task 8: Profile & Settings Audit

**Files:**
- Modify: `app/(main)/profile/index.tsx`

- [ ] **Step 1: Compare with 'Profile & More Tab Menu Options' / 'More Active sheet'**
- [ ] **Step 2: Refactor UI** (Grouped SectionCards, Segmented Control styles, sign-out red text)
- [ ] **Step 3: Log and Commit**

### Task 9: Contact Picker Modal Audit

**Files:**
- Modify: Contact Picker components

- [ ] **Step 1: Compare with 'Contact Picker Modal' / 'Denied Modal'**
- [ ] **Step 2: Refactor UI** (BottomSheetFlatList, Solid green denied CTA, rounded checkboxes)
- [ ] **Step 3: Log and Commit**
