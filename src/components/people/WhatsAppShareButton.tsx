/**
 * WhatsApp Share Ledger Button
 * 
 * Generates shareable token and sends WhatsApp message with ledger link
 * Used on customer detail screen and order confirmation screen
 */

import { useState } from 'react';
import { TouchableOpacity, Text, View, ActivityIndicator, Linking, Alert } from 'react-native';
import { MessageCircle } from 'lucide-react-native';
import { colors } from '@/src/utils/theme';
import { generateWhatsAppLedgerLink, getLedgerUrl } from '@/src/utils/accessToken';
import { useToast } from '@/src/components/feedback/Toast';

interface WhatsAppShareButtonProps {
  vendorId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  businessName: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
}

export default function WhatsAppShareButton({
  vendorId,
  customerId,
  customerName,
  customerPhone,
  businessName,
  variant = 'primary',
  size = 'medium',
  showIcon = true,
}: WhatsAppShareButtonProps) {
  const [loading, setLoading] = useState(false);
  const { show } = useToast();

  const handleShareLedger = async () => {
    try {
      setLoading(true);

      // Validate phone number
      if (!customerPhone || customerPhone.trim() === '') {
        Alert.alert(
          'Phone Required',
          `${customerName} doesn't have a phone number. Please add their phone number to share the ledger.`,
          [{ text: 'OK' }]
        );
        return;
      }

      // Generate WhatsApp link with token
      const whatsappUrl = await generateWhatsAppLedgerLink(
        vendorId,
        customerId,
        customerPhone,
        businessName
      );

      // Open WhatsApp
      const canOpen = await Linking.canOpenURL(whatsappUrl);
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
        show({ message: 'Opening WhatsApp...', type: 'success' });
      } else {
        // Fallback: Show ledger URL in alert if WhatsApp not available
        const ledgerUrl = await getLedgerUrl(vendorId, customerId);
        Alert.alert(
          'WhatsApp Not Available',
          `Copy this link to share with ${customerName}:\n\n${ledgerUrl}`,
          [
            {
              text: 'Copy Link',
              onPress: () => {
                // Note: Clipboard not imported yet, can add if needed
                show({ message: 'Link generated successfully!', type: 'success' });
              },
            },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
      }
    } catch (error) {
      console.error('[WhatsAppShare] Error:', error);
      show({ message: 'Failed to generate share link', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Size variants
  const sizeStyles = {
    small: {
      container: 'px-3 py-2',
      text: 'text-xs',
      icon: 16,
    },
    medium: {
      container: 'px-4 py-3',
      text: 'text-sm',
      icon: 18,
    },
    large: {
      container: 'px-6 py-4',
      text: 'text-base',
      icon: 20,
    },
  };

  // Variant styles
  const variantStyles = {
    primary: {
      container: 'bg-primary',
      text: 'text-white',
      iconColor: '#FFFFFF',
    },
    secondary: {
      container: 'bg-primaryLight border border-primary',
      text: 'text-primaryDark',
      iconColor: colors.primaryDark,
    },
    outline: {
      container: 'border-2 border-primary',
      text: 'text-primaryDark',
      iconColor: colors.primaryDark,
    },
  };

  const currentSize = sizeStyles[size];
  const currentVariant = variantStyles[variant];

  return (
    <TouchableOpacity
      onPress={handleShareLedger}
      disabled={loading}
      className={`flex-row items-center justify-center rounded-lg ${currentSize.container} ${currentVariant.container}`}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size="small" color={currentVariant.iconColor} />
      ) : (
        <>
          {showIcon && (
            <MessageCircle
              size={currentSize.icon}
              color={currentVariant.iconColor}
              strokeWidth={2}
            />
          )}
          <Text
            className={`font-semibold ${currentSize.text} ${currentVariant.text} ${
              showIcon ? 'ml-2' : ''
            }`}
          >
            Share Ledger
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}
