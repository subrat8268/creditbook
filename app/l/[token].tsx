/**
 * Public Ledger View - Shared via WhatsApp link
 * Route: /l/[token]
 * 
 * Shows customer their ledger with a specific vendor without requiring login
 * Accessible via shareable token (e.g., https://kredbook.app/l/a8f3k2m9p1)
 */

import { colors } from '@/src/utils/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Image,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '@/src/services/supabase';
import { ArrowLeft, Building2, Phone, MapPin, FileText, Calendar } from 'lucide-react-native';
import { format } from 'date-fns';

interface Transaction {
  id: string;
  date: string;
  type: 'sale' | 'payment_received';
  bill_number: string;
  amount: number;
  payment_method?: string;
  items?: Array<{
    product_name: string;
    variant_name?: string;
    quantity: number;
    rate: number;
    total: number;
  }>;
}

interface LedgerData {
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  vendor_business_name: string;
  vendor_name: string;
  vendor_phone: string;
  vendor_address: string;
  vendor_gstin: string;
  vendor_logo_url: string;
  total_sales: number;
  total_payments: number;
  current_balance: number;
  last_transaction_date: string;
  transactions: Transaction[];
}

export default function PublicLedgerView() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [ledgerData, setLedgerData] = useState<LedgerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLedger = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      setError(null);

      const { data, error: fetchError } = await supabase.rpc('get_ledger_by_token', {
        p_token: token,
      });

      if (fetchError) {
        console.error('[PublicLedger] Error fetching ledger:', fetchError);
        setError('Failed to load ledger');
        return;
      }

      if (!data || data.length === 0) {
        setError('Invalid or expired link');
        return;
      }

      // Parse the result (RPC returns array with single row)
      const ledger = data[0];
      setLedgerData({
        ...ledger,
        transactions: ledger.transactions || [],
      });
    } catch (err) {
      console.error('[PublicLedger] Unexpected error:', err);
      setError('Something went wrong');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchLedger();
    } else {
      setError('Invalid link');
      setLoading(false);
    }
  }, [token]);

  const onRefresh = () => {
    fetchLedger(true);
  };

  // Format currency (Indian Rupees)
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Loading state
  if (loading) {
    return (
      <View className="items-center justify-center flex-1 bg-gray-50">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="mt-4 text-sm text-textSecondary">Loading ledger...</Text>
      </View>
    );
  }

  // Error state
  if (error || !ledgerData) {
    return (
      <View
        className="items-center justify-center flex-1 px-6 bg-gray-50"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <View className="items-center p-8 bg-white rounded-2xl">
          <Text className="mb-2 text-4xl">🔒</Text>
          <Text className="mb-2 text-lg font-bold text-textPrimary">
            {error || 'Ledger not found'}
          </Text>
          <Text className="mb-6 text-sm text-center text-textSecondary">
            This link may be invalid, expired, or revoked
          </Text>
          <TouchableOpacity
            className="px-6 py-3 rounded-lg bg-primary"
            onPress={() => router.back()}
          >
            <Text className="font-semibold text-white">Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const { transactions } = ledgerData;
  const balanceColor =
    ledgerData.current_balance > 0
      ? colors.danger
      : ledgerData.current_balance < 0
      ? colors.primaryDark
      : colors.textSecondary;

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Card - Vendor Info */}
        <View className="p-5 mx-4 mt-4 bg-white rounded-2xl">
          <View className="flex-row items-center mb-4">
            {ledgerData.vendor_logo_url ? (
              <Image
                source={{ uri: ledgerData.vendor_logo_url }}
                className="w-12 h-12 mr-3 rounded-full bg-gray-100"
              />
            ) : (
              <View className="items-center justify-center w-12 h-12 mr-3 rounded-full bg-primary-light">
                <Building2 size={20} color={colors.primary} />
              </View>
            )}
            <View className="flex-1">
              <Text className="text-lg font-bold text-textPrimary">
                {ledgerData.vendor_business_name || ledgerData.vendor_name}
              </Text>
              {ledgerData.vendor_gstin && (
                <Text className="text-xs text-textSecondary">
                  GSTIN: {ledgerData.vendor_gstin}
                </Text>
              )}
            </View>
          </View>

          {/* Vendor Contact */}
          <View className="pt-3 space-y-2 border-t border-gray-100">
            {ledgerData.vendor_phone && (
              <View className="flex-row items-center">
                <Phone size={14} color={colors.textSecondary} />
                <Text className="ml-2 text-sm text-textSecondary">
                  {ledgerData.vendor_phone}
                </Text>
              </View>
            )}
            {ledgerData.vendor_address && (
              <View className="flex-row items-start">
                <MapPin size={14} color={colors.textSecondary} className="mt-0.5" />
                <Text className="flex-1 ml-2 text-sm text-textSecondary">
                  {ledgerData.vendor_address}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Balance Summary Card */}
        <View className="p-5 mx-4 mt-4 bg-white rounded-2xl">
          <Text className="mb-3 text-sm font-medium text-textSecondary">
            Your Account with {ledgerData.vendor_business_name}
          </Text>

          <View className="flex-row items-center justify-between pb-4 mb-4 border-b border-gray-100">
            <View>
              <Text className="text-xs text-textSecondary">Total Sales</Text>
              <Text className="text-base font-semibold text-textPrimary">
                {formatAmount(ledgerData.total_sales)}
              </Text>
            </View>
            <View>
              <Text className="text-xs text-right text-textSecondary">Total Payments</Text>
              <Text className="text-base font-semibold text-right text-textPrimary">
                {formatAmount(ledgerData.total_payments)}
              </Text>
            </View>
          </View>

          <View className="items-center py-4 rounded-xl bg-gray-50">
            <Text className="mb-1 text-xs font-medium text-textSecondary">
              Current Balance
            </Text>
            <Text className="text-3xl font-bold" style={{ color: balanceColor }}>
              {formatAmount(Math.abs(ledgerData.current_balance))}
            </Text>
            <Text className="mt-1 text-xs text-textSecondary">
              {ledgerData.current_balance > 0
                ? 'You owe'
                : ledgerData.current_balance < 0
                ? 'To receive'
                : 'Settled'}
            </Text>
          </View>
        </View>

        {/* Transactions List */}
        <View className="p-5 mx-4 mt-4 mb-4 bg-white rounded-2xl">
          <Text className="mb-4 text-base font-bold text-textPrimary">
            Transaction History
          </Text>

          {transactions.length === 0 ? (
            <View className="items-center py-8">
              <FileText size={32} color={colors.textSecondary} />
              <Text className="mt-2 text-sm text-textSecondary">No transactions yet</Text>
            </View>
          ) : (
            <View className="space-y-3">
              {transactions.map((txn, index) => (
                <View
                  key={txn.id}
                  className={`pb-3 ${
                    index < transactions.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <View className="flex-row items-start justify-between mb-1">
                    <View className="flex-1">
                      <View className="flex-row items-center mb-1">
                        <Text
                          className={`text-xs font-semibold px-2 py-0.5 rounded ${
                            txn.type === 'sale'
                              ? 'bg-dangerBg text-danger'
                              : 'bg-successBg text-primaryDark'
                          }`}
                        >
                          {txn.type === 'sale' ? 'Sale' : 'Payment'}
                        </Text>
                        {txn.bill_number && (
                          <Text className="ml-2 text-xs text-textSecondary">
                            #{txn.bill_number}
                          </Text>
                        )}
                      </View>

                      <View className="flex-row items-center mt-1">
                        <Calendar size={12} color={colors.textSecondary} />
                        <Text className="ml-1 text-xs text-textSecondary">
                          {format(new Date(txn.date), 'dd MMM yyyy, hh:mm a')}
                        </Text>
                      </View>

                      {/* Transaction items */}
                      {txn.items && txn.items.length > 0 && (
                        <View className="mt-2 space-y-1">
                          {txn.items.map((item, idx) => (
                            <Text key={idx} className="text-xs text-textSecondary">
                              • {item.product_name}
                              {item.variant_name && ` (${item.variant_name})`} - {item.quantity}{' '}
                              × {formatAmount(item.rate)}
                            </Text>
                          ))}
                        </View>
                      )}
                    </View>

                    <View className="items-end ml-3">
                      <Text
                        className="text-base font-bold"
                        style={{
                          color: txn.type === 'sale' ? colors.danger : colors.primaryDark,
                        }}
                      >
                        {txn.type === 'sale' ? '+' : '-'}
                        {formatAmount(txn.amount)}
                      </Text>
                      {txn.payment_method && (
                        <Text className="mt-1 text-xs text-textSecondary">
                          {txn.payment_method}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Footer */}
        <View className="items-center px-6 pb-6">
          <Text className="text-xs text-center text-textSecondary">
            Powered by{' '}
            <Text className="font-bold text-primary">KredBook</Text>
          </Text>
          <Text className="mt-1 text-xs text-center text-textSecondary">
            Track credit. Get paid faster.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
