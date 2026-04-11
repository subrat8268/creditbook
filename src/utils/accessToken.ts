/**
 * Token Generation Utility for Shared Ledger System
 * 
 * Provides functions to:
 * - Generate or retrieve access tokens for person ledger sharing
 * - Create WhatsApp shareable links
 * - Track token usage
 */

import { supabase } from '@/src/services/supabase';

export interface AccessToken {
  id: string;
  token: string;
  vendor_id: string;
  customer_id: string;
  created_at: string;
  last_accessed_at: string | null;
  access_count: number;
  expires_at: string | null;
  is_revoked: boolean;
}

export interface LedgerInfo {
  vendor_id: string;
  vendor_business_name: string;
  vendor_name: string;
  customer_id: string;
  customer_name: string;
  balance: number;
  access_token: string;
  ledger_url: string;
}

/**
 * Get or create an access token for a person ledger
 * Uses the database RPC function to ensure uniqueness
 * 
 * @param vendorId - Profile ID of the vendor (business owner)
 * @param customerId - Person ID whose ledger will be shared
 * @returns The shareable token string (e.g., "a8f3k2m9p1")
 */
export async function getOrCreateAccessToken(
  vendorId: string,
  customerId: string
): Promise<string> {
  try {
    const { data, error } = await supabase.rpc('get_or_create_access_token', {
      p_vendor_id: vendorId,
      p_customer_id: customerId,
    });

    if (error) {
      console.error('[AccessToken] Error creating token:', error);
      throw error;
    }

    if (!data) {
      throw new Error('Token creation returned no data');
    }

    return data as string;
  } catch (err) {
    console.error('[AccessToken] Failed to get/create token:', err);
    throw err;
  }
}

/**
 * Generate a shareable WhatsApp link for a person ledger
 * 
 * @param vendorId - Profile ID of the vendor
 * @param customerId - Person ID
 * @param customerPhone - Person's phone number (with country code)
 * @param businessName - Vendor's business name
 * @returns WhatsApp deep link with pre-filled message
 */
export async function generateWhatsAppLedgerLink(
  vendorId: string,
  customerId: string,
  customerPhone: string,
  businessName: string
): Promise<string> {
  try {
    // Get or create token
    const token = await getOrCreateAccessToken(vendorId, customerId);
    
    // Build ledger URL
    const ledgerUrl = `https://kredbook.app/l/${token}`;
    
    // Create WhatsApp message
    const message = `नमस्ते! 🙏\n\nआप ${businessName} के साथ अपना खाता यहाँ देख सकते हैं:\n${ledgerUrl}\n\n(Hello! You can view your ledger with ${businessName} here)`;
    
    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Format phone number (remove + and spaces)
    const formattedPhone = customerPhone.replace(/[^0-9]/g, '');
    
    // Build WhatsApp deep link
    const whatsappUrl = `whatsapp://send?phone=${formattedPhone}&text=${encodedMessage}`;
    
    return whatsappUrl;
  } catch (err) {
    console.error('[AccessToken] Failed to generate WhatsApp link:', err);
    throw err;
  }
}

/**
 * Get the public ledger URL for a person
 * 
 * @param vendorId - Profile ID of the vendor
 * @param customerId - Person ID
 * @returns Public ledger URL (e.g., "https://kredbook.app/l/a8f3k2m9p1")
 */
export async function getLedgerUrl(
  vendorId: string,
  customerId: string
): Promise<string> {
  const token = await getOrCreateAccessToken(vendorId, customerId);
  return `https://kredbook.app/l/${token}`;
}

/**
 * Find all ledgers for a phone number (used when a person adds phone)
 * 
 * @param phone - Phone number to search for
 * @returns Array of ledger information across all vendors
 */
export async function findLedgersByPhone(phone: string): Promise<LedgerInfo[]> {
  try {
    if (!phone?.trim()) {
      throw new Error('Phone number is required');
    }

    const { data, error } = await supabase.rpc('find_ledgers_by_phone', {
      p_phone: phone,
    });

    if (error) {
      console.error('[AccessToken] Error finding ledgers:', error);
      throw error;
    }

    return (data || []) as LedgerInfo[];
  } catch (err) {
    console.error('[AccessToken] Failed to find ledgers by phone:', err);
    throw err;
  }
}

/**
 * Auto-link a person to all existing ledgers when they provide their phone
 * Creates access tokens for all vendor relationships with this phone number
 * 
 * @param customerId - Person ID to link
 * @param phone - Phone number to search for
 * @returns Number of ledgers linked
 */
export async function autoLinkCustomerLedgers(
  customerId: string,
  phone: string
): Promise<number> {
  try {
    if (!phone?.trim()) {
      throw new Error('Phone number is required');
    }

    const { data, error } = await supabase.rpc('auto_link_customer_ledgers', {
      p_customer_id: customerId,
      p_phone: phone,
    });

    if (error) {
      console.error('[AccessToken] Error auto-linking ledgers:', error);
      throw error;
    }

    return (data || 0) as number;
  } catch (err) {
    console.error('[AccessToken] Failed to auto-link ledgers:', err);
    throw err;
  }
}

/**
 * Revoke an access token (disable ledger sharing)
 * 
 * @param token - The token to revoke
 */
export async function revokeAccessToken(token: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('access_tokens')
      .update({ is_revoked: true })
      .eq('token', token);

    if (error) {
      console.error('[AccessToken] Error revoking token:', error);
      throw error;
    }
  } catch (err) {
    console.error('[AccessToken] Failed to revoke token:', err);
    throw err;
  }
}

/**
 * Get all access tokens for a vendor's people (customers)
 * 
 * @param vendorId - Profile ID of the vendor
 * @returns Array of access tokens
 */
export async function getVendorAccessTokens(vendorId: string): Promise<AccessToken[]> {
  try {
    const { data, error } = await supabase
      .from('access_tokens')
      .select('*')
      .eq('vendor_id', vendorId)
      .eq('is_revoked', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[AccessToken] Error fetching vendor tokens:', error);
      throw error;
    }

    return (data || []) as AccessToken[];
  } catch (err) {
    console.error('[AccessToken] Failed to fetch vendor tokens:', err);
    throw err;
  }
}
