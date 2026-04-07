/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * KREDBOOK OFFLINE-FIRST ARCHITECTURE — Sync Status Banner
 * ═══════════════════════════════════════════════════════════════════════════════
 * Global top banner that displays network sync status with 3 states:
 * - Offline: Shows queue count, reassures user changes are saved locally
 * - Syncing: Shows spinner animation while replaying mutations
 * - Synced: Shows success confirmation, auto-dismisses after 2s
 * 
 * Design: design-system.md §4 System States & Sync Tokens (lines 205-262)
 * UX: ux-context.md §3 Screen Inventory → Sync Status UI (lines 120-147)
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { CloudOff, CloudUpload, CloudCheck } from 'lucide-react-native';
import { colors, spacing, typography } from '@/src/utils/theme';
import { useNetworkSync, type SyncStatus } from '@/src/hooks/useNetworkSync';

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const BANNER_HEIGHT = 44;
const AUTO_DISMISS_DURATION = 2000; // 2 seconds for "Synced" state
const FADE_DURATION = 300; // Animation duration in milliseconds

// State-specific styling configuration
const STATE_CONFIGS = {
  offline: {
    backgroundColor: colors.sync.offlineBg,
    textColor: colors.sync.offlineText,
    Icon: CloudOff,
    getText: (queueLength: number) => 
      queueLength > 0 
        ? `Offline • ${queueLength} change${queueLength === 1 ? '' : 's'} saved locally`
        : 'Offline',
  },
  syncing: {
    backgroundColor: colors.sync.syncingBg,
    textColor: colors.sync.syncingText,
    Icon: CloudUpload,
    getText: () => 'Syncing your changes…',
  },
  synced: {
    backgroundColor: colors.sync.syncedBg,
    textColor: colors.sync.syncedText,
    Icon: CloudCheck,
    getText: () => 'All changes synced',
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function SyncStatusBanner() {
  const { syncStatus, queueLength, isConnected } = useNetworkSync();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const autoDismissTimer = useRef<NodeJS.Timeout | null>(null);

  // Determine if banner should be visible
  const shouldShow = !isConnected || syncStatus === 'syncing' || syncStatus === 'synced';

  /**
   * Effect: Animate banner in/out based on sync status.
   * Auto-dismiss "synced" state after 2 seconds.
   */
  useEffect(() => {
    // Clear any existing auto-dismiss timer
    if (autoDismissTimer.current) {
      clearTimeout(autoDismissTimer.current);
      autoDismissTimer.current = null;
    }

    if (shouldShow) {
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: FADE_DURATION,
        useNativeDriver: true,
      }).start();

      // Auto-dismiss "synced" state after 2 seconds
      if (syncStatus === 'synced') {
        autoDismissTimer.current = setTimeout(() => {
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: FADE_DURATION,
            useNativeDriver: true,
          }).start();
        }, AUTO_DISMISS_DURATION) as any;
      }
    } else {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: FADE_DURATION,
        useNativeDriver: true,
      }).start();
    }

    return () => {
      if (autoDismissTimer.current) {
        clearTimeout(autoDismissTimer.current);
      }
    };
  }, [shouldShow, syncStatus, fadeAnim]);

  /**
   * Manual dismiss handler (tap on banner).
   */
  const handleDismiss = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: FADE_DURATION,
      useNativeDriver: true,
    }).start();
  };

  // If banner should never have been shown, return null
  // Check by querying the animation value via __getValue() (private API but stable)
  if (!shouldShow && (fadeAnim as any).__getValue() === 0) {
    return null;
  }

  // Determine which state configuration to use
  const currentState: SyncStatus = !isConnected ? 'offline' : syncStatus;
  const config = STATE_CONFIGS[currentState];
  const Icon = config.Icon;
  const text = config.getText(queueLength);

  return (
    <Animated.View
      style={[
        styles.container,
        { 
          backgroundColor: config.backgroundColor,
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-BANNER_HEIGHT, 0],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.content}
        onPress={handleDismiss}
        activeOpacity={0.8}
      >
        {/* Icon (with spinner for "syncing" state) */}
        <View style={styles.iconContainer}>
          {currentState === 'syncing' ? (
            <ActivityIndicator size="small" color={config.textColor} />
          ) : (
            <Icon size={18} color={config.textColor} strokeWidth={2} />
          )}
        </View>

        {/* Text */}
        <Text style={[styles.text, { color: config.textColor }]}>
          {text}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: BANNER_HEIGHT,
    zIndex: 999, // Above all other content, never behind modals
    elevation: 10, // Android shadow for layering
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md, // 16dp
    paddingVertical: spacing.sm, // 8dp
  },
  iconContainer: {
    marginRight: spacing.sm, // 8dp gap between icon and text
  },
  text: {
    fontSize: typography.small.fontSize, // 13px
    fontWeight: typography.small.fontWeight, // '400'
    lineHeight: typography.small.lineHeight, // 18
  },
});
