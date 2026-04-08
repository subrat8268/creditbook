# KredBook Implementation Plan — PRD v5

**Date:** April 8, 2026  
**Version:** Phase 1 (Hybrid Approach)  
**Goal:** Transform KredBook into simplest digital khata with shared ledger

---

## Strategic Decisions (Locked)

Based on your final decisions:

1. ✅ **Scope:** Hybrid approach (simplify UX, keep current schema)
2. ✅ **Phone System:** Mandatory after login, no OTP
3. ✅ **Shared Ledger:** Priority 1 (build immediately)
4. ✅ **Data:** Keep current schema, adapt in app layer
5. ✅ **Entry Flow:** Rebuild (amount-first, items optional)
6. ✅ **Focus:** Simplicity and speed over perfection

---

## Phase 1: Critical Foundations (4 Weeks)

### Week 1-2: Shared Ledger System (Priority 1)

**Goal:** Customers can view ledger via WhatsApp link (no login required)

#### 1.1 Database Schema (Day 1-2)

**Create `access_tokens` table:**

```sql
CREATE TABLE access_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  customer_phone TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  last_accessed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tokens_token ON access_tokens(token);
CREATE INDEX idx_tokens_customer ON access_tokens(customer_id);
CREATE INDEX idx_tokens_expiry ON access_tokens(expires_at);
```

**RLS Policies:**

```sql
-- Vendors can create tokens for their customers
CREATE POLICY "Vendors create tokens for own customers"
  ON access_tokens FOR INSERT
  WITH CHECK (
    vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- Public can validate tokens (for web view)
CREATE POLICY "Anyone can validate tokens"
  ON access_tokens FOR SELECT
  USING (expires_at > NOW());
```

**Files to create:**
- `supabase/migrations/0010_create_access_tokens.sql`

**Deliverable:** Schema migration ready, applied to database

---

#### 1.2 Token Generation System (Day 3-4)

**Create token utility:**

```typescript
// src/utils/generateAccessToken.ts

import { supabase } from '@/src/services/supabase';
import CryptoJS from 'crypto-js';

export async function generateCustomerAccessToken(
  customerId: string,
  vendorId: string,
  customerPhone: string
): Promise<string> {
  // Generate secure token (32-char hex)
  const tokenData = `${customerId}:${vendorId}:${Date.now()}`;
  const token = CryptoJS.SHA256(tokenData).toString().substring(0, 32);

  // Store in database
  const { data, error } = await supabase
    .from('access_tokens')
    .insert({
      customer_id: customerId,
      vendor_id: vendorId,
      token,
      customer_phone: customerPhone,
    })
    .select()
    .single();

  if (error) throw error;

  return token;
}

export function getSharedLedgerLink(token: string): string {
  const baseUrl = process.env.EXPO_PUBLIC_WEB_URL || 'https://kredbook.app';
  return `${baseUrl}/l/${token}`;
}
```

**Install dependency:**
```bash
npm install crypto-js
npm install --save-dev @types/crypto-js
```

**Files to create:**
- `src/utils/generateAccessToken.ts`

**Deliverable:** Token generation working, tested with console logs

---

#### 1.3 WhatsApp Link Integration (Day 5-6)

**Update bill creation to generate token:**

```typescript
// app/(main)/orders/create.tsx (after order creation)

import { generateCustomerAccessToken, getSharedLedgerLink } from '@/src/utils/generateAccessToken';

// ... inside handleSaveAndShare after createOrderMutation.mutateAsync

// Generate access token for customer
const token = await generateCustomerAccessToken(
  selectedCustomerId,
  vendorId!,
  selectedCustomerMeta.phone
);

const sharedLink = getSharedLedgerLink(token);

// Update WhatsApp message
const whatsappMessage = `Hi ${selectedCustomerMeta.name}!

New bill from ${profile?.business_name || 'KredBook'}

Amount: ₹${getGrandTotal()}
Total Balance: ₹${getGrandTotal() + previousBalance}

View your ledger anytime:
${sharedLink}

Thank you!`;

// Open WhatsApp with link
const whatsappUrl = `whatsapp://send?phone=${selectedCustomerMeta.phone}&text=${encodeURIComponent(whatsappMessage)}`;
await Linking.openURL(whatsappUrl);
```

**Files to modify:**
- `app/(main)/orders/create.tsx` (lines ~200-210)

**Deliverable:** Bills now generate WhatsApp links with tokens

---

#### 1.4 Web View Page (Day 7-10)

**Create Next.js web view** (separate repo or `/web` folder):

**Option A: Expo Web (simpler, same codebase)**

```typescript
// app/l/[token].tsx (new file)

import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, FlatList } from 'react-native';
import { supabase } from '@/src/services/supabase';

export default function SharedLedgerView() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [ledgerData, setLedgerData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLedger();
  }, [token]);

  const fetchLedger = async () => {
    try {
      // 1. Validate token
      const { data: tokenData, error: tokenError } = await supabase
        .from('access_tokens')
        .select('*, customer:customers(*), vendor:profiles(*)')
        .eq('token', token)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (tokenError || !tokenData) {
        setError('Invalid or expired link');
        return;
      }

      // 2. Fetch transactions
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('customer_id', tokenData.customer_id)
        .eq('vendor_id', tokenData.vendor_id)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .in('order_id', orders?.map(o => o.id) || [])
        .order('payment_date', { ascending: false });

      if (paymentsError) throw paymentsError;

      // 3. Calculate running balance
      const transactions = [
        ...orders.map(o => ({
          type: 'bill',
          date: o.created_at,
          amount: o.total_amount,
          note: o.order_items.length > 0 
            ? `${o.order_items.length} items` 
            : 'Bill',
        })),
        ...payments.map(p => ({
          type: 'payment',
          date: p.payment_date,
          amount: p.amount,
          note: p.payment_mode,
        }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      let runningBalance = 0;
      const transactionsWithBalance = transactions.map(t => {
        runningBalance += t.type === 'bill' ? t.amount : -t.amount;
        return { ...t, balance: runningBalance };
      });

      setLedgerData({
        vendor: tokenData.vendor,
        customer: tokenData.customer,
        currentBalance: runningBalance,
        transactions: transactionsWithBalance.reverse(),
      });
    } catch (e: any) {
      setError(e.message || 'Failed to load ledger');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-6">
        <Text className="text-lg text-danger mb-2">⚠️ {error}</Text>
        <Text className="text-sm text-textSecondary text-center">
          This link may have expired or is invalid.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="bg-primary p-6 pb-8">
        <Text className="text-white text-lg font-semibold mb-1">
          {ledgerData.vendor.business_name}
        </Text>
        <Text className="text-white/80 text-sm">
          Your Ledger with {ledgerData.vendor.business_name}
        </Text>
      </View>

      {/* Balance Card */}
      <View className="bg-white mx-4 -mt-6 rounded-2xl p-5 shadow-sm">
        <Text className="text-sm text-textSecondary mb-1">Your Balance</Text>
        <Text className="text-3xl font-bold text-danger">
          ₹{ledgerData.currentBalance.toFixed(2)}
        </Text>
        <Text className="text-xs text-textSecondary mt-1">
          {ledgerData.currentBalance > 0 ? 'You owe' : 'Settled'}
        </Text>
      </View>

      {/* Transactions List */}
      <View className="flex-1 px-4 mt-6">
        <Text className="text-sm font-semibold text-textPrimary mb-3">
          Transaction History
        </Text>
        <FlatList
          data={ledgerData.transactions}
          keyExtractor={(item, idx) => `txn-${idx}`}
          renderItem={({ item }) => (
            <View className="bg-white rounded-xl p-4 mb-3">
              <View className="flex-row justify-between items-start mb-2">
                <View>
                  <Text className="text-sm font-semibold text-textPrimary">
                    {item.type === 'bill' ? '📄 Bill' : '💰 Payment'}
                  </Text>
                  <Text className="text-xs text-textSecondary">
                    {new Date(item.date).toLocaleDateString('en-IN')}
                  </Text>
                </View>
                <Text className={`text-base font-bold ${item.type === 'bill' ? 'text-danger' : 'text-success'}`}>
                  {item.type === 'bill' ? '+' : '-'}₹{item.amount}
                </Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-xs text-textMuted">{item.note}</Text>
                <Text className="text-xs font-semibold text-textSecondary">
                  Balance: ₹{item.balance}
                </Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text className="text-center text-textSecondary text-sm py-8">
              No transactions yet
            </Text>
          }
        />
      </View>

      {/* Install App CTA */}
      <View className="bg-white border-t border-border p-4">
        <Text className="text-xs text-textSecondary text-center mb-3">
          Install KredBook app to see all your ledgers
        </Text>
        <TouchableOpacity className="bg-primary rounded-full py-3 px-6">
          <Text className="text-white font-semibold text-center">
            Download App
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
```

**Files to create:**
- `app/l/[token].tsx`

**Deliverable:** Shared ledger view accessible via link, shows balance + transactions

---

#### 1.5 Testing & Validation (Day 11-12)

**Test Cases:**

1. ✅ Create bill → Token generated → Link in WhatsApp message
2. ✅ Open link in browser → Ledger loads
3. ✅ Shows correct balance
4. ✅ Shows transaction history (running balance)
5. ✅ Expired token → Error message
6. ✅ Invalid token → Error message
7. ✅ Works on mobile web (not just desktop)

**Test with:**
- Real customer phone number
- Multiple transactions
- Partial payments
- Different vendors

**Deliverable:** Shared ledger system working end-to-end ✅

---

### Week 2-3: Phone Collection System (Priority 1)

**Goal:** Mandatory phone entry after auth, auto-link ledgers

#### 2.1 Phone Entry Screen (Day 13-14)

**Create new screen:**

```typescript
// app/(auth)/phone-setup.tsx

import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '@/src/services/supabase';
import { useAuthStore } from '@/src/store/authStore';
import Button from '@/src/components/ui/Button';

export default function PhoneSetupScreen() {
  const router = useRouter();
  const { user, profile, setProfile } = useAuthStore();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validatePhone = (p: string) => {
    // Indian phone: 10 digits
    const cleaned = p.replace(/\D/g, '');
    return cleaned.length === 10;
  };

  const handleContinue = async () => {
    if (!validatePhone(phone)) {
      setError('Enter a valid 10-digit phone number');
      return;
    }

    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // Check if phone already exists (global unique constraint)
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('phone', phone)
        .neq('user_id', user.id)
        .single();

      if (existing) {
        setError('This phone number is already registered');
        setLoading(false);
        return;
      }

      // Update profile with phone
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ phone })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Update local state
      if (profile) {
        setProfile({ ...profile, phone });
      }

      // Navigate to onboarding
      router.replace('/(auth)/onboarding/role');
    } catch (e: any) {
      setError(e.message || 'Failed to save phone number');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background px-6">
      <View className="flex-1 justify-center">
        <Text className="text-2xl font-bold text-textPrimary mb-2">
          What's your phone number?
        </Text>
        <Text className="text-sm text-textSecondary mb-8">
          We'll use this to link your ledgers and send reminders
        </Text>

        <View className="bg-white rounded-2xl p-5">
          <Text className="text-sm font-semibold text-textPrimary mb-2">
            Phone Number <Text className="text-danger">*</Text>
          </Text>
          <View className="flex-row items-center border-2 rounded-xl px-4 py-3" style={{
            borderColor: error ? '#DC2626' : '#E5E7EB'
          }}>
            <Text className="text-base text-textSecondary mr-2">+91</Text>
            <TextInput
              placeholder="9876543210"
              value={phone}
              onChangeText={(text) => {
                setPhone(text.replace(/\D/g, ''));
                setError(null);
              }}
              keyboardType="phone-pad"
              maxLength={10}
              className="flex-1 text-base text-textPrimary"
            />
          </View>
          {error && (
            <Text className="text-xs text-danger mt-2">{error}</Text>
          )}
        </View>

        <Button
          title={loading ? 'Saving...' : 'Continue'}
          onPress={handleContinue}
          loading={loading}
          disabled={phone.length !== 10}
          className="mt-6"
        />
      </View>
    </SafeAreaView>
  );
}
```

**Files to create:**
- `app/(auth)/phone-setup.tsx`

**Deliverable:** Phone entry screen complete with validation

---

#### 2.2 Update Auth Routing Logic (Day 15)

**Modify `app/_layout.tsx` routing guard:**

```typescript
// app/_layout.tsx (lines ~103-129)

// Replace current routing logic with:

useEffect(() => {
  if (!isInitialized) return;

  if (isRecoveryMode) {
    router.replace("/set-new-password");
    return;
  }

  if (!user) {
    router.replace(showWelcome ? "/" : "/(auth)/login");
    return;
  }

  if (isFetchingProfile) return;

  if (!profile) {
    router.replace("/profile-error");
    return;
  }

  // ⭐ NEW: Check phone number
  if (!profile.phone) {
    router.replace("/(auth)/phone-setup");
    return;
  }

  if (!profile.onboarding_complete) {
    router.replace("/(auth)/onboarding/role");
    return;
  }

  router.replace("/(main)/dashboard");
}, [user, profile, isInitialized, isFetchingProfile, isRecoveryMode, showWelcome]);
```

**Files to modify:**
- `app/_layout.tsx`

**Deliverable:** Phone entry enforced after auth, before onboarding

---

#### 2.3 Auto-Link Ledgers (Day 16)

**Create RPC function:**

```sql
-- supabase/migrations/0011_auto_link_ledgers.sql

CREATE OR REPLACE FUNCTION get_user_ledgers(user_phone TEXT)
RETURNS TABLE (
  ledger_type TEXT,
  party_id UUID,
  party_name TEXT,
  party_phone TEXT,
  balance NUMERIC
) AS $$
BEGIN
  -- Return ledgers where user is a customer (owes money)
  RETURN QUERY
  SELECT 
    'customer'::TEXT as ledger_type,
    c.id as party_id,
    p.business_name as party_name,
    p.phone as party_phone,
    COALESCE(SUM(o.balance_due), 0) as balance
  FROM customers c
  JOIN profiles p ON c.vendor_id = p.id
  LEFT JOIN orders o ON o.customer_id = c.id
  WHERE c.phone = user_phone
  GROUP BY c.id, p.business_name, p.phone;

  -- Return ledgers where user is a vendor (others owe them)
  RETURN QUERY
  SELECT
    'vendor'::TEXT as ledger_type,
    c.id as party_id,
    c.name as party_name,
    c.phone as party_phone,
    COALESCE(SUM(o.balance_due), 0) as balance
  FROM customers c
  JOIN profiles p ON c.vendor_id = p.id
  LEFT JOIN orders o ON o.customer_id = c.id
  WHERE p.phone = user_phone
  GROUP BY c.id, c.name, c.phone;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Create hook:**

```typescript
// src/hooks/useLinkedLedgers.ts

import { supabase } from '@/src/services/supabase';
import { useQuery } from '@tanstack/react-query';

export function useLinkedLedgers(userPhone: string | null) {
  return useQuery({
    queryKey: ['linked-ledgers', userPhone],
    queryFn: async () => {
      if (!userPhone) return { asCustomer: [], asVendor: [] };

      const { data, error } = await supabase
        .rpc('get_user_ledgers', { user_phone: userPhone });

      if (error) throw error;

      return {
        asCustomer: data.filter(l => l.ledger_type === 'customer'),
        asVendor: data.filter(l => l.ledger_type === 'vendor'),
      };
    },
    enabled: !!userPhone,
  });
}
```

**Files to create:**
- `supabase/migrations/0011_auto_link_ledgers.sql`
- `src/hooks/useLinkedLedgers.ts`

**Deliverable:** Users can see all ledgers (both sides) where their phone appears

---

#### 2.4 Update Dashboard (Day 17)

**Show linked ledgers:**

```typescript
// app/(main)/dashboard/index.tsx

import { useLinkedLedgers } from '@/src/hooks/useLinkedLedgers';

export default function DashboardScreen() {
  const { profile } = useAuthStore();
  const linkedLedgers = useLinkedLedgers(profile?.phone || null);

  return (
    <ScrollView>
      {/* Existing dashboard content */}

      {/* NEW: Linked Ledgers Section */}
      {linkedLedgers.data?.asCustomer.length > 0 && (
        <View className="px-4 mt-6">
          <Text className="text-lg font-bold mb-3">Your Credit Ledgers</Text>
          {linkedLedgers.data.asCustomer.map(ledger => (
            <View key={ledger.party_id} className="bg-white rounded-xl p-4 mb-3">
              <Text className="font-semibold">{ledger.party_name}</Text>
              <Text className="text-danger text-xl font-bold">
                You owe: ₹{ledger.balance}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
```

**Deliverable:** Dashboard shows both "My Business" and "Where I'm a Customer"

---

### Week 3-4: Quick Entry System (Priority 0)

**Goal:** Rebuild entry screen for <10 second bill creation

#### 3.1 Redesign Entry Screen UI (Day 18-20)

**New layout (amount-first, items optional):**

```typescript
// app/(main)/orders/create.tsx (REWRITE)

import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomerPicker from '@/src/components/picker/CustomerPicker';
import { useOrderStore } from '@/src/store/orderStore';

export default function QuickEntryScreen() {
  const { profile } = useAuthStore();
  const vendorId = profile?.id;

  // Zustand state
  const selectedCustomerId = useOrderStore(s => s.selectedCustomerId);
  const setCustomer = useOrderStore(s => s.setCustomer);
  const clearOrder = useOrderStore(s => s.clearOrder);

  // Local state
  const [selectedCustomerMeta, setSelectedCustomerMeta] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [showItemPicker, setShowItemPicker] = useState(false);
  const [isCustomerPickerVisible, setCustomerPickerVisible] = useState(false);

  const quickAmounts = [100, 500, 1000, 2000];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4 py-6">
        {/* Header */}
        <Text className="text-2xl font-bold mb-6">New Entry</Text>

        {/* Customer Selection */}
        <TouchableOpacity
          onPress={() => setCustomerPickerVisible(true)}
          className="bg-white rounded-2xl p-5 mb-4"
        >
          {selectedCustomerMeta ? (
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-full bg-primary items-center justify-center mr-3">
                <Text className="text-white font-bold">
                  {getInitials(selectedCustomerMeta.name)}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-base">{selectedCustomerMeta.name}</Text>
                <Text className="text-xs text-textSecondary">{selectedCustomerMeta.phone}</Text>
              </View>
              <Pencil size={18} color="#9CA3AF" />
            </View>
          ) : (
            <Text className="text-textSecondary">Select Customer</Text>
          )}
        </TouchableOpacity>

        {/* Amount Input (LARGE, PROMINENT) */}
        <View className="bg-white rounded-2xl p-6 mb-4">
          <Text className="text-sm font-semibold mb-3">Amount</Text>
          <View className="flex-row items-center">
            <Text className="text-3xl font-bold mr-2">₹</Text>
            <TextInput
              placeholder="0"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              className="flex-1 text-3xl font-bold"
              autoFocus
            />
          </View>

          {/* Quick Amount Buttons */}
          <View className="flex-row gap-2 mt-4">
            {quickAmounts.map(amt => (
              <TouchableOpacity
                key={amt}
                onPress={() => setAmount(amt.toString())}
                className="flex-1 bg-primary-light rounded-lg py-2"
              >
                <Text className="text-primary text-center font-semibold">
                  ₹{amt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Note (Optional) */}
        <View className="bg-white rounded-2xl p-5 mb-4">
          <Text className="text-sm font-semibold mb-2">Note (optional)</Text>
          <TextInput
            placeholder="e.g. Rice, Dal"
            value={note}
            onChangeText={setNote}
            className="text-base"
          />
        </View>

        {/* Add Items (Collapsed by default) */}
        {!showItemPicker && (
          <TouchableOpacity
            onPress={() => setShowItemPicker(true)}
            className="border-2 border-dashed border-border rounded-2xl p-4 mb-4"
          >
            <Text className="text-primary text-center font-semibold">
              + Add Itemized Details (Optional)
            </Text>
          </TouchableOpacity>
        )}

        {/* Item Picker (Expanded when tapped) */}
        {showItemPicker && (
          <View className="bg-white rounded-2xl p-5 mb-4">
            {/* Product picker goes here */}
            <Text className="text-sm text-textSecondary">
              Product picker (existing component)
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Save Button (Sticky Footer) */}
      <View className="bg-white border-t border-border p-4">
        <TouchableOpacity
          onPress={handleSave}
          disabled={!selectedCustomerId || !amount}
          className={`rounded-full py-4 ${
            selectedCustomerId && amount ? 'bg-primary' : 'bg-gray-300'
          }`}
        >
          <Text className="text-white text-center font-bold text-base">
            Save & Send
          </Text>
        </TouchableOpacity>
      </View>

      {/* Customer Picker Modal */}
      <CustomerPicker
        visible={isCustomerPickerVisible}
        onClose={() => setCustomerPickerVisible(false)}
        onSelect={handleSelectCustomer}
        vendorId={vendorId!}
      />
    </SafeAreaView>
  );
}
```

**Files to modify:**
- `app/(main)/orders/create.tsx` (complete rewrite)

**Deliverable:** New entry screen with amount-first UX

---

#### 3.2 Update Order Store (Day 21)

**Add amount-only mode:**

```typescript
// src/store/orderStore.ts

interface OrderState {
  // ... existing fields

  // NEW: Amount-only mode
  entryMode: 'amount-only' | 'itemized';
  simpleAmount: number;

  // NEW: Actions
  setEntryMode: (mode: 'amount-only' | 'itemized') => void;
  setSimpleAmount: (amount: number) => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  // ... existing state

  entryMode: 'amount-only',
  simpleAmount: 0,

  setEntryMode: (mode) => set({ entryMode: mode }),
  setSimpleAmount: (amount) => set({ simpleAmount: amount }),

  // Update getGrandTotal to use simpleAmount if amount-only
  getGrandTotal: () => {
    const state = get();
    if (state.entryMode === 'amount-only') {
      return state.simpleAmount;
    }
    return state.getSubtotal() + state.getTaxAmount() + state.loadingCharge;
  },
}));
```

**Deliverable:** Store supports both modes

---

#### 3.3 Update Create Order Mutation (Day 22)

**Handle amount-only bills:**

```typescript
// src/hooks/useOrders.ts

export function useCreateOrder(vendorId: string) {
  return useMutation({
    mutationFn: async (data: {
      customerId: string;
      vendorId: string;
      items?: Array<{ product_id, product_name, price, quantity }>;
      amountOnly?: number; // NEW
      note?: string; // NEW
      amountPaid: number;
      loadingCharge: number;
      taxPercent: number;
      billNumberPrefix: string;
    }) => {
      // 1. Get next bill number
      const { data: billNum } = await supabase.rpc('get_next_bill_number', {
        v_id: vendorId,
        prefix: data.billNumberPrefix,
      });

      // 2. Calculate total
      let totalAmount = 0;
      if (data.amountOnly) {
        totalAmount = data.amountOnly; // Amount-only mode
      } else if (data.items && data.items.length > 0) {
        const subtotal = data.items.reduce((sum, item) => 
          sum + (item.price * item.quantity), 0
        );
        const tax = (subtotal * data.taxPercent) / 100;
        totalAmount = subtotal + tax + data.loadingCharge;
      } else {
        throw new Error('Either provide amount or items');
      }

      // 3. Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          vendor_id: vendorId,
          customer_id: data.customerId,
          bill_number: billNum,
          total_amount: totalAmount,
          amount_paid: data.amountPaid,
          loading_charge: data.loadingCharge || 0,
          tax_percent: data.taxPercent || 0,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 4. Insert order items (only if itemized)
      if (data.items && data.items.length > 0) {
        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(
            data.items.map(item => ({
              order_id: order.id,
              vendor_id: vendorId,
              product_id: item.product_id,
              product_name: item.product_name,
              price: item.price,
              quantity: item.quantity,
            }))
          );

        if (itemsError) throw itemsError;
      } else if (data.note) {
        // Store note in order_items as single "misc" item
        await supabase.from('order_items').insert({
          order_id: order.id,
          vendor_id: vendorId,
          product_id: null,
          product_name: data.note,
          price: data.amountOnly,
          quantity: 1,
        });
      }

      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
```

**Deliverable:** Mutation handles both amount-only and itemized

---

#### 3.4 Testing & Validation (Day 23-24)

**Test scenarios:**

1. ✅ Amount-only: ₹500, "Rice" → Saves in <10 seconds
2. ✅ Quick buttons: Tap ₹1000 → Fills amount
3. ✅ Itemized: Expand → Add products → Works
4. ✅ WhatsApp link generated for both modes
5. ✅ Customer sees entry via web link
6. ✅ Running balance correct

**Measure:**
- Time from FAB tap to save complete
- Target: <10 seconds for amount-only
- Current: Achieved?

**Deliverable:** Quick entry working, <10 sec validated ✅

---

### Week 4: Polish & Integration (Final Week)

#### 4.1 Remove Bank Blocking (Day 25)

**Make bank details optional:**

```typescript
// app/(main)/orders/create.tsx

// REMOVE this blocking validation:
// if (!profile?.bank_name || !profile?.account_number || !profile?.ifsc_code) {
//   return Alert.alert("Bank Details Missing", "...");
// }

// REPLACE with soft prompt when sharing PDF:
const handleSharePDF = async () => {
  if (!profile?.bank_name || !profile?.account_number || !profile?.ifsc_code) {
    Alert.alert(
      'Add Bank Details?',
      'Bank details make your invoices more professional. Add them now?',
      [
        { text: 'Skip', style: 'cancel', onPress: () => sharePlainBill() },
        { text: 'Add Details', onPress: () => router.push('/profile/edit-bank') },
      ]
    );
    return;
  }

  // Generate PDF with bank details
  await generateAndSharePDF();
};
```

**Deliverable:** Users can create bills without bank details

---

#### 4.2 Simplify Onboarding (Day 26)

**Remove GSTIN & Bill Prefix from business setup:**

```typescript
// app/(auth)/onboarding/business.tsx

// REMOVE fields:
// - GSTIN input
// - Bill Prefix input

// KEEP only:
// - Business Name (required)

// Move removed fields to:
// app/(main)/profile/edit.tsx (new screen for Phase 2)
```

**Deliverable:** Onboarding streamlined to 2 steps (role + name)

---

#### 4.3 Documentation (Day 27)

**Update README:**

```markdown
# KredBook v4.0 — Shared Digital Khata

## Quick Start

1. Sign up with email or Google
2. Enter your phone number
3. Add your business name
4. Start tracking credit!

## Key Features

- ⚡ Create bills in <10 seconds
- 🔗 Customers see ledger via WhatsApp link
- 📱 Works offline
- 💰 Running balance always visible

## For Developers

See `/docs`:
- `UX_AUDIT_PRD_v5.md` — Current vs target UX
- `IMPLEMENTATION_PLAN_PRD_v5.md` — This document
- `SHARED_LEDGER.md` — Token system architecture
```

**Create API documentation:**

```markdown
# Shared Ledger API

## Generate Access Token

```typescript
import { generateCustomerAccessToken } from '@/src/utils/generateAccessToken';

const token = await generateCustomerAccessToken(
  customerId,
  vendorId,
  customerPhone
);
```

## Get Shared Link

```typescript
import { getSharedLedgerLink } from '@/src/utils/generateAccessToken';

const link = getSharedLedgerLink(token);
// https://kredbook.app/l/abc123def
```

## Web View Route

`GET /l/[token]`

Returns: HTML page with ledger view (no auth required)

Token validation:
- Signature verified
- Expiry < 30 days
- Phone matches customer

## RPC Functions

### get_user_ledgers(user_phone)

Returns all ledgers where user's phone appears (as customer or vendor).

```sql
SELECT * FROM get_user_ledgers('+919876543210');
```
```

**Files to create/update:**
- `README.md`
- `docs/SHARED_LEDGER.md`
- `docs/API_REFERENCE.md`

**Deliverable:** Complete documentation for Phase 1

---

#### 4.4 End-to-End Testing (Day 28)

**Test complete user journey:**

**Scenario A: New User (First Bill)**
1. Sign up with Google
2. Enter phone: 9876543210
3. Select role: Retailer
4. Enter business name: "Ram General Store"
5. Skip bank details
6. Dashboard loads
7. Tap "+" → Select customer "Rahul"
8. Enter ₹500, note "Monthly grocery"
9. Tap Save & Send
10. WhatsApp opens with link
11. Copy link → Open in browser
12. Ledger view shows: Balance ₹500, 1 transaction
13. ✅ Complete journey working

**Scenario B: Existing User (Quick Entry)**
1. Login
2. Dashboard → Tap "+"
3. Customer auto-selected (recent)
4. Tap "₹1000" quick button
5. Tap Save
6. Time: <7 seconds ✅
7. WhatsApp sent with link

**Scenario C: Customer View**
1. Customer receives WhatsApp
2. Taps link
3. Sees ledger (no login)
4. Verifies balance
5. Closes browser
6. ✅ No app install needed

**Deliverable:** All scenarios pass ✅

---

## Success Metrics (Phase 1)

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Entry time (amount-only) | <10 seconds | Stopwatch test (50 users) |
| Entry time (itemized) | <20 seconds | Stopwatch test |
| Shared link click rate | >50% | Analytics on `/l/[token]` |
| Onboarding completion | >80% | % reaching dashboard |
| Phone collection rate | 100% | Enforced (mandatory) |
| Bank details skip rate | <30% | Track who fills vs skips |

---

## Rollout Plan

### Week 1-2: Internal Testing
- Test with 5 team members
- Fix critical bugs
- Validate all flows

### Week 3: Closed Beta
- 50 real users (kirana shop owners)
- Collect feedback via WhatsApp
- Monitor metrics

### Week 4: Open Beta
- 500 users
- App Store submission (TestFlight)
- Iterate based on data

### Month 2: Public Launch
- Full production release
- Marketing campaign
- Track growth

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Token security breach | HIGH | Use signed JWT, short expiry, rate limiting |
| Phone number conflicts | MEDIUM | Global unique constraint, clear error messages |
| Web view performance | MEDIUM | Optimize query, cache tokens, CDN for assets |
| User confusion (2 entry modes) | LOW | Clear UI, amount-first default, optional expansion |
| Bank details blocking adoption | HIGH | Make optional, soft prompt only when sharing |

---

## Dependencies

### External Services
- ✅ Supabase (database, auth, RLS)
- ✅ WhatsApp deeplink API (free)
- ⏳ Web hosting (Vercel/Netlify for `/l/[token]`)

### Libraries to Add
- `crypto-js` (token generation)
- `@types/crypto-js`

### No New Dependencies
- Use existing Expo Router for web view
- Use existing React Query for data
- Use existing NativeWind for styling

---

## Post-Phase 1 Roadmap

### Phase 2: Clean Architecture (Weeks 5-8)
- Migrate to `parties` table (unified)
- Remove role/mode complexity
- Add edit bill flow
- Profile edit screen
- Image upload (logos, products)

### Phase 3: Advanced Features (Weeks 9-12)
- Push notifications (Expo Push)
- Payment reminders (scheduled)
- Bulk operations
- Customer analytics
- Referral system

---

## Conclusion

Phase 1 delivers the **3 critical features** missing from current KredBook:

1. ✅ **Shared Ledger** — Customers see ledger via WhatsApp link
2. ✅ **Phone-Based Linking** — Auto-discover all ledgers
3. ✅ **Quick Entry** — <10 second bill creation

After Phase 1, KredBook will be:
- **Simpler** than current (fewer fields, faster flow)
- **More transparent** than competitors (shared ledger)
- **Faster** than paper khata (<10 sec vs 15-20 sec)

**Ready to begin implementation!** 🚀

