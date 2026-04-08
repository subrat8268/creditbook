/**
 * Custom hook for WhatsApp ledger sharing
 * 
 * Provides reusable function to share customer ledgers via WhatsApp
 * Handles token generation, link formatting, and error handling
 */

import { useState } from 'react';
import { Linking, Alert } from 'react-native';
import { generateWhatsAppLedgerLink, getLedgerUrl } from '@/src/utils/accessToken';
import { useToast } from '@/src/components/feedback/Toast';

interface UseWhatsAppShareOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useWhatsAppShare(options?: UseWhatsAppShareOptions) {
  const [isSharing, setIsSharing] = useState(false);
  const { show } = useToast();

  const shareLedger = async (
    vendorId: string,
    customerId: string,
    customerName: string,
    customerPhone: string,
    businessName: string
  ): Promise<boolean> => {
    try {
      setIsSharing(true);

      // Validate phone number
      if (!customerPhone || customerPhone.trim() === '') {
        Alert.alert(
          'Phone Number Required',
          `${customerName} doesn't have a phone number. Please add their phone number to share the ledger.`,
          [{ text: 'OK' }]
        );
        return false;
      }

      // Generate WhatsApp link with ledger token
      const whatsappUrl = await generateWhatsAppLedgerLink(
        vendorId,
        customerId,
        customerPhone,
        businessName
      );

      // Try to open WhatsApp
      const canOpen = await Linking.canOpenURL(whatsappUrl);
      
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
        show({ message: 'Opening WhatsApp...', type: 'success' });
        options?.onSuccess?.();
        return true;
      } else {
        // Fallback: Show ledger URL in alert if WhatsApp not available
        const ledgerUrl = await getLedgerUrl(vendorId, customerId);
        
        Alert.alert(
          'WhatsApp Not Available',
          `Share this link with ${customerName}:\n\n${ledgerUrl}`,
          [
            {
              text: 'Copy Link',
              onPress: () => {
                show({ message: 'Link generated!', type: 'success' });
                options?.onSuccess?.();
              },
            },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
        
        return true;
      }
    } catch (error) {
      console.error('[useWhatsAppShare] Error:', error);
      show({ message: 'Failed to generate share link', type: 'error' });
      options?.onError?.(error as Error);
      return false;
    } finally {
      setIsSharing(false);
    }
  };

  return {
    shareLedger,
    isSharing,
  };
}
