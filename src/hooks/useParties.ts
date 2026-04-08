/**
 * useParties - Unified hook for managing business relationships
 * 
 * Replaces separate useCustomers and useSuppliers hooks with a single
 * unified interface for the parties table.
 * 
 * Features:
 * - Query parties by type (customer, supplier, or all)
 * - Create/update/delete parties
 * - Handle parties that are both customer AND supplier
 * - Automatic query invalidation on mutations
 * 
 * @example
 * // Get all customers
 * const { data: customers } = useParties(vendorId, 'customer');
 * 
 * // Get all suppliers
 * const { data: suppliers } = useParties(vendorId, 'supplier');
 * 
 * // Get ALL parties (customers + suppliers)
 * const { data: allParties } = useParties(vendorId, 'all');
 * 
 * // Get single party
 * const { data: party } = useParty(partyId);
 * 
 * // Create new customer
 * const createMutation = useCreateParty();
 * createMutation.mutate({
 *   vendor_id: vendorId,
 *   name: 'John Doe',
 *   phone: '+919876543210',
 *   is_customer: true,
 *   is_supplier: false,
 * });
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import type { Party, PartyInsert, PartyUpdate, PartyType } from '../types/party';

/**
 * Query all parties for a vendor, optionally filtered by type
 * 
 * @param vendorId - Profile ID of the vendor
 * @param type - Filter by 'customer', 'supplier', or 'all'
 * @returns React Query result with parties array
 */
export function useParties(vendorId: string, type: PartyType = 'all') {
  return useQuery({
    queryKey: ['parties', vendorId, type],
    queryFn: async () => {
      let query = supabase
        .from('parties')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('name');

      // Filter by relationship type
      if (type === 'customer') {
        query = query.eq('is_customer', true);
      } else if (type === 'supplier') {
        query = query.eq('is_supplier', true);
      }
      // If type === 'all', no additional filter

      const { data, error } = await query;
      if (error) throw error;
      return data as Party[];
    },
    enabled: !!vendorId,
  });
}

/**
 * Query a single party by ID
 * 
 * @param partyId - UUID of the party
 * @returns React Query result with single party
 */
export function useParty(partyId: string | undefined) {
  return useQuery({
    queryKey: ['parties', partyId],
    queryFn: async () => {
      if (!partyId) throw new Error('Party ID is required');

      const { data, error } = await supabase
        .from('parties')
        .select('*')
        .eq('id', partyId)
        .single();

      if (error) throw error;
      return data as Party;
    },
    enabled: !!partyId,
  });
}

/**
 * Search parties by name or phone
 * 
 * @param vendorId - Profile ID of the vendor
 * @param searchTerm - Name or phone to search for
 * @param type - Filter by party type
 * @returns React Query result with matching parties
 */
export function useSearchParties(
  vendorId: string,
  searchTerm: string,
  type: PartyType = 'all'
) {
  return useQuery({
    queryKey: ['parties', vendorId, type, 'search', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('parties')
        .select('*')
        .eq('vendor_id', vendorId);

      // Filter by type
      if (type === 'customer') {
        query = query.eq('is_customer', true);
      } else if (type === 'supplier') {
        query = query.eq('is_supplier', true);
      }

      // Search by name or phone
      query = query.or(`name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`);

      const { data, error } = await query.order('name');
      if (error) throw error;
      return data as Party[];
    },
    enabled: !!vendorId && searchTerm.length > 0,
  });
}

/**
 * Get party by phone number (for linking/discovery)
 * 
 * @param vendorId - Profile ID of the vendor
 * @param phone - Phone number to search for
 * @returns React Query result with matching party (if exists)
 */
export function usePartyByPhone(vendorId: string, phone: string) {
  return useQuery({
    queryKey: ['parties', vendorId, 'phone', phone],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('parties')
        .select('*')
        .eq('vendor_id', vendorId)
        .eq('phone', phone)
        .maybeSingle(); // Returns null if not found (not an error)

      if (error) throw error;
      return data as Party | null;
    },
    enabled: !!vendorId && !!phone,
  });
}

/**
 * Create a new party (customer, supplier, or both)
 * 
 * @returns Mutation hook for creating parties
 */
export function useCreateParty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (party: PartyInsert) => {
      // Validate: must be at least customer OR supplier
      if (!party.is_customer && !party.is_supplier) {
        throw new Error('Party must be either a customer, supplier, or both');
      }

      const { data, error } = await supabase
        .from('parties')
        .insert(party)
        .select()
        .single();

      if (error) throw error;
      return data as Party;
    },
    onSuccess: (data: Party) => {
      // Invalidate all party queries for this vendor
      queryClient.invalidateQueries({ queryKey: ['parties', data.vendor_id] });
    },
  });
}

/**
 * Update an existing party
 * 
 * @returns Mutation hook for updating parties
 */
export function useUpdateParty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: PartyUpdate }) => {
      const { data, error } = await supabase
        .from('parties')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Party;
    },
    onSuccess: (data: Party) => {
      // Invalidate both list and individual queries
      queryClient.invalidateQueries({ queryKey: ['parties', data.vendor_id] });
      queryClient.invalidateQueries({ queryKey: ['parties', data.id] });
    },
  });
}

/**
 * Delete a party
 * 
 * NOTE: This will CASCADE delete all related orders/deliveries if foreign keys
 * are configured with ON DELETE CASCADE. Use with caution!
 * 
 * @returns Mutation hook for deleting parties
 */
export function useDeleteParty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (partyId: string) => {
      const { error } = await supabase
        .from('parties')
        .delete()
        .eq('id', partyId);

      if (error) throw error;
    },
    onSuccess: (_: void, partyId: string) => {
      // Invalidate all party queries (we don't know vendor_id at this point)
      queryClient.invalidateQueries({ queryKey: ['parties'] });
    },
  });
}

/**
 * Get customer balance (amount they owe vendor)
 * 
 * @param partyId - UUID of the party
 * @returns React Query result with customer balance
 */
export function useCustomerBalance(partyId: string | undefined) {
  return useQuery({
    queryKey: ['parties', partyId, 'customer-balance'],
    queryFn: async () => {
      if (!partyId) throw new Error('Party ID is required');

      const { data, error } = await supabase
        .from('parties')
        .select('customer_balance')
        .eq('id', partyId)
        .eq('is_customer', true)
        .single();

      if (error) throw error;
      return data.customer_balance;
    },
    enabled: !!partyId,
  });
}

/**
 * Get supplier balance (amount vendor owes party)
 * 
 * @param partyId - UUID of the party
 * @returns React Query result with supplier balance
 */
export function useSupplierBalance(partyId: string | undefined) {
  return useQuery({
    queryKey: ['parties', partyId, 'supplier-balance'],
    queryFn: async () => {
      if (!partyId) throw new Error('Party ID is required');

      const { data, error } = await supabase
        .from('parties')
        .select('supplier_balance')
        .eq('id', partyId)
        .eq('is_supplier', true)
        .single();

      if (error) throw error;
      return data.supplier_balance;
    },
    enabled: !!partyId,
  });
}

/**
 * Helper function to check if a party is a customer
 */
export function isCustomer(party: Party): boolean {
  return party.is_customer === true;
}

/**
 * Helper function to check if a party is a supplier
 */
export function isSupplier(party: Party): boolean {
  return party.is_supplier === true;
}

/**
 * Helper function to check if a party has both roles
 */
export function isDualRole(party: Party): boolean {
  return party.is_customer === true && party.is_supplier === true;
}

/**
 * Helper function to get party's role as human-readable string
 */
export function getPartyRole(party: Party): string {
  if (isDualRole(party)) return 'Customer & Supplier';
  if (isCustomer(party)) return 'Customer';
  if (isSupplier(party)) return 'Supplier';
  return 'Unknown';
}
