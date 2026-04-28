import { supabase } from "@/src/services/supabase";
import { useTheme } from "@/src/utils/ThemeProvider";
import { formatINR } from "@/src/utils/format";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type LedgerTxn = {
  id: string;
  date: string;
  type: "sale" | "payment_received";
  bill_number?: string | null;
  amount: number;
};

type LedgerData = {
  vendor_business_name?: string | null;
  vendor_name?: string | null;
  vendor_phone?: string | null;
  current_balance?: number;
  transactions?: LedgerTxn[];
};

export default function PublicLedgerView() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const { colors, spacing, typography } = useTheme();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ledger, setLedger] = useState<LedgerData | null>(null);

  const loadLedger = useCallback(async () => {
    if (!token) {
      setError("This link is invalid or has expired");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc("get_ledger_by_token", {
        p_token: token,
      });

      if (rpcError) throw rpcError;

      const row = Array.isArray(data) ? data[0] : data;
      if (!row) {
        setError("This link is invalid or has expired");
        setLedger(null);
      } else {
        setLedger({
          ...row,
          transactions: (row.transactions ?? []) as LedgerTxn[],
        });
      }
    } catch {
      setError("This link is invalid or has expired");
      setLedger(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadLedger();
  }, [loadLedger]);

  const transactions = useMemo(() => {
    const items = ledger?.transactions ?? [];
    return items
      .slice()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [ledger?.transactions]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1, padding: spacing.lg, gap: spacing.md }}>
          <View style={{ backgroundColor: colors.surface, borderRadius: spacing.cardRadius, padding: spacing.lg }}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing.sm }]}>Loading ledger...</Text>
          </View>
          <View style={{ backgroundColor: colors.surface, borderRadius: spacing.cardRadius, padding: spacing.lg, height: 96 }} />
          <View style={{ backgroundColor: colors.surface, borderRadius: spacing.cardRadius, padding: spacing.lg, height: 96 }} />
          <View style={{ backgroundColor: colors.surface, borderRadius: spacing.cardRadius, padding: spacing.lg, height: 96 }} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !ledger) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1, justifyContent: "center", padding: spacing.xl }}>
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: spacing.cardRadius,
              borderWidth: spacing.dividerHeight,
              borderColor: colors.border,
              padding: spacing.xl,
            }}
          >
            <Text style={[typography.cardTitle, { color: colors.textPrimary }]}>Link unavailable</Text>
            <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.sm }]}>
              This link is invalid or has expired
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const businessName = ledger.vendor_business_name || ledger.vendor_name || "Business";
  const totalDue = Number(ledger.current_balance ?? 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing["2xl"], gap: spacing.md }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: spacing.cardRadius,
            borderWidth: spacing.dividerHeight,
            borderColor: colors.border,
            padding: spacing.lg,
            gap: spacing.xs,
          }}
        >
          <Text style={[typography.sectionTitle, { color: colors.textPrimary }]}>{businessName}</Text>
          <Text style={[typography.body, { color: colors.textSecondary }]}>{ledger.vendor_phone || "Phone unavailable"}</Text>
        </View>

        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: spacing.cardRadius,
            borderWidth: spacing.dividerHeight,
            borderColor: colors.border,
            padding: spacing.lg,
          }}
        >
          <Text style={[typography.caption, { color: colors.textSecondary }]}>Total due</Text>
          <Text style={[typography.heroAmount, { color: totalDue > 0 ? colors.danger : colors.success, marginTop: spacing.xs }]}>
            {formatINR(Math.abs(totalDue))}
          </Text>
        </View>

        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: spacing.cardRadius,
            borderWidth: spacing.dividerHeight,
            borderColor: colors.border,
            overflow: "hidden",
          }}
        >
          <View style={{ padding: spacing.lg, borderBottomWidth: spacing.dividerHeight, borderBottomColor: colors.border }}>
            <Text style={[typography.cardTitle, { color: colors.textPrimary }]}>Transactions</Text>
          </View>

          {transactions.length === 0 ? (
            <View style={{ padding: spacing.lg }}>
              <Text style={[typography.body, { color: colors.textSecondary }]}>No transactions found</Text>
            </View>
          ) : (
            transactions.map((txn, index) => {
              const isSale = txn.type === "sale";
              return (
                <View
                  key={txn.id}
                  style={{
                    padding: spacing.lg,
                    borderBottomWidth:
                      index === transactions.length - 1 ? 0 : spacing.dividerHeight,
                    borderBottomColor: colors.border,
                    gap: spacing.xs,
                  }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={[typography.body, { color: colors.textPrimary }]}>
                      {isSale ? "Sale" : "Payment"}
                      {txn.bill_number ? ` #${txn.bill_number}` : ""}
                    </Text>
                    <Text style={[typography.body, { color: isSale ? colors.danger : colors.success, fontWeight: "700" }]}>
                      {isSale ? "+" : "-"}
                      {formatINR(Number(txn.amount || 0))}
                    </Text>
                  </View>
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>
                    {new Date(txn.date).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </Text>
                  <View
                    style={{
                      alignSelf: "flex-start",
                      borderRadius: 999,
                      backgroundColor: isSale ? colors.dangerBg : colors.successBg,
                      paddingHorizontal: spacing.sm,
                      paddingVertical: spacing.xs,
                    }}
                  >
                    <Text style={[typography.caption, { color: isSale ? colors.danger : colors.success }]}> 
                      {isSale ? "Sale" : "Payment"}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
