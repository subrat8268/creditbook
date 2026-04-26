/**
 * useCustomer - Backward compatibility wrapper for useParties
 *
 * This hook wraps the new useParties hook and adapts the Party type
 * to the legacy Customer type (now aliased to Person), allowing existing UI
 * components to work without changes during the migration period.
 *
 * MIGRATION NOTE: This is a temporary compatibility layer.
 * New code should use useParties directly from '@/src/hooks/useParties'
 */

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Alert } from "react-native";
import { fetchPersonDetail, PAGE_SIZE } from "../api/people";
import { ApiError } from "../lib/supabaseQuery";
import { supabase } from "../services/supabase";
import { Person, PersonDetail } from "../types/customer";
import type { Party } from "../types/party";
import { useDebounce } from "./useDebounce";

function dedupeById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  // Infinite pagination + changing datasets can yield overlapping ranges; dedupe prevents duplicate keys in lists.
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

// Helper: Convert Party to Person type
function partyToPerson(party: Party): Person {
  return {
    id: party.id,
    name: party.name,
    phone: party.phone || "",
    vendor_id: party.vendor_id,
    address: party.address || undefined,
    created_at: party.created_at,
    outstandingBalance: party.customer_balance,
    isOverdue: false, // Will be calculated if needed
    lastActiveAt: party.updated_at,
  };
}

export const customerKeys = {
  all: (vendorId: string) => ["customers", vendorId] as const,
  list: (vendorId: string, search: string) =>
    [...customerKeys.all(vendorId), { search }] as const,
};

// Preferred alias (new naming)
export const peopleKeys = customerKeys;

/**
 * Fetch people (customers) using new parties table
 */
async function fetchCustomersFromParties(
  pageParam: number,
  vendorId: string,
  search?: string,
): Promise<Person[]> {
  let query = supabase
    .from("parties")
    .select("*")
    .eq("vendor_id", vendorId)
    .eq("is_customer", true)
    .order("created_at", { ascending: false })
    .range(pageParam * PAGE_SIZE, pageParam * PAGE_SIZE + PAGE_SIZE - 1);

  if (search) {
    query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;

  const parties = (data ?? []) as Party[];

  // Convert parties to people
  const people = parties.map(partyToPerson);

  // Determine overdue status (same logic as before)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: overdueOrders } = await supabase
    .from("orders")
    .select("customer_id")
    .eq("vendor_id", vendorId)
    .gt("balance_due", 0)
    .lt("created_at", thirtyDaysAgo.toISOString());

  const overdueIds = new Set(
    (overdueOrders ?? []).map((o: any) => o.customer_id),
  );

  // Mark overdue people
  people.forEach((p) => {
    p.isOverdue = overdueIds.has(p.id);
  });

  return people;
}

export const useCustomers = (vendorId?: string, search?: string) => {
  const debouncedSearch = useDebounce(search ?? "", 300);

  const query = useInfiniteQuery<Person[], ApiError>({
    queryKey: vendorId
      ? customerKeys.list(vendorId, debouncedSearch)
      : ["customers-disabled"],
    queryFn: ({ pageParam }) =>
      fetchCustomersFromParties(
        pageParam as number,
        vendorId!,
        debouncedSearch,
      ),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.length : undefined,
    initialPageParam: 0,
    enabled: !!vendorId,
    staleTime: 30_000,
  });

  return {
    ...query,
    people: dedupeById(query.data?.pages.flat() ?? []),
  };
};

// Preferred alias (new naming)
export const usePeople = useCustomers;

// Backward-compatible alias (deprecated)
export const useCustomer = useCustomers;

export const useAddCustomer = (vendorId: string) => {
  const queryClient = useQueryClient();

  return useMutation<
    Person,
    ApiError,
    Omit<
      Person,
      | "id"
      | "vendor_id"
      | "created_at"
      | "isOverdue"
      | "outstandingBalance"
      | "lastActiveAt"
    >,
    { previousQueries: [import("@tanstack/react-query").QueryKey, unknown][] }
  >({
    mutationFn: async (values) => {
      // Insert into parties table instead of legacy customers table
      const { data, error } = await supabase
        .from("parties")
        .insert({
          vendor_id: vendorId,
          name: values.name,
          phone: values.phone || null,
          address: values.address || null,
          is_customer: true,
          is_supplier: false,
          customer_balance: (values as any).openingBalance || 0,
        })
        .select()
        .single();

      if (error) throw error;
      return partyToPerson(data as Party);
    },
    onMutate: async (newCustomer) => {
      const queryKey = customerKeys.all(vendorId);
      await queryClient.cancelQueries({ queryKey });

      const previousQueries = queryClient.getQueriesData({ queryKey });

      const optimisticPerson: Person = {
        id: `temp-${Date.now()}`,
        vendor_id: vendorId,
        name: newCustomer.name,
        phone: newCustomer.phone,
        address: newCustomer.address,
        created_at: new Date().toISOString(),
        isOverdue: false,
        outstandingBalance: (newCustomer as any).openingBalance ?? 0,
        lastActiveAt: new Date().toISOString(),
      };

      queryClient.setQueriesData<any>({ queryKey }, (oldData: any) => {
        if (!oldData || !oldData.pages) return oldData;
        const newPages = [...oldData.pages];
        newPages[0] = [optimisticPerson, ...newPages[0]];
        return {
          ...oldData,
          pages: newPages,
        };
      });

      return { previousQueries };
    },
    onError: (err: ApiError, _, context) => {
      console.error("Failed to add customer:", err.message);
      if (context?.previousQueries) {
        context.previousQueries.forEach(([cacheKey, oldData]) => {
          queryClient.setQueryData(cacheKey, oldData);
        });
      }
      Alert.alert("Error", err.message || "Failed to add customer.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: customerKeys.all(vendorId),
        exact: false,
      });
    },
    onSuccess: () => {
      Alert.alert("Success", "Person added successfully");
    },
  });
};

export function useCustomerDetail(customerId?: string) {
  return useQuery<PersonDetail | null>({
    queryKey: ["customerDetail", customerId],
    queryFn: () =>
      customerId ? fetchPersonDetail(customerId) : Promise.resolve(null),
    enabled: !!customerId,
    staleTime: 30_000,
  });
}

// Preferred alias (new naming)
export const useAddPerson = useAddCustomer;
export const usePersonDetail = useCustomerDetail;
