---
name: react-native-skills
description: React Native and Expo best practices from Vercel Engineering.
---

# React Native Skills

> React Native and Expo best practices from Vercel Engineering.
> Adapted from Vercel's agent-skills with comprehensive RN/Expo rules.

## When to Use

- Building React Native or Expo apps
- Optimizing list and scroll performance
- Implementing animations with Reanimated
- Working with images and media
- Configuring native modules or fonts
- React Native, Expo, mobile performance, native platform APIs

## Rule Categories (Priority Order)

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | List Performance | CRITICAL | `list-performance-` |
| 2 | Animation | HIGH | `animation-` |
| 3 | Navigation | HIGH | `navigation-` |
| 4 | UI Patterns | HIGH | `ui-` |
| 5 | State Management | MEDIUM | `react-state-` |
| 6 | Rendering | MEDIUM | `rendering-` |
| 7 | Monorepo | MEDIUM | `monorepo-` |
| 8 | Configuration | LOW | `fonts-`, `imports-` |

## Quick Reference

### 1. List Performance (CRITICAL) - `list-performance-`

| Rule | Description |
|------|-------------|
| `list-performance-virtualize` | Use FlashList for large lists |
| `list-performance-item-memo` | Memoize list item components |
| `list-performance-callbacks` | Stabilize callback references |
| `list-performance-inline-objects` | Avoid inline style objects |
| `list-performance-function-references` | Extract functions outside render |
| `list-performance-images` | Optimize images in lists |
| `list-performance-item-expensive` | Move expensive work outside items |
| `list-performance-item-types` | Use item types for heterogeneous lists |

### 2. Animation (HIGH) - `animation-`

| Rule | Description |
|------|-------------|
| `animation-gpu-properties` | Animate only transform and opacity |
| `animation-derived-value` | Use useDerivedValue for computed animations |
| `animation-gesture-detector-press` | Use Gesture.Tap instead of Pressable |

### 3. Navigation (HIGH) - `navigation-`

| Rule | Description |
|------|-------------|
| `navigation-native-navigators` | Use native stack and native tabs over JS navigators |

### 4. UI Patterns (HIGH) - `ui-`

| Rule | Description |
|------|-------------|
| `ui-expo-image` | Use expo-image for all images |
| `ui-image-gallery` | Use Galeria for image lightboxes |
| `ui-pressable` | Use Pressable over TouchableOpacity |
| `ui-safe-area-scroll` | Handle safe areas in ScrollViews |
| `ui-scrollview-content-inset` | Use contentInset for headers |
| `ui-menus` | Use native context menus |
| `ui-native-modals` | Use native modals when possible |
| `ui-measure-views` | Use onLayout, not measure() |
| `ui-styling` | Use StyleSheet.create or Nativewind |

### 5. State Management (MEDIUM) - `react-state-`

| Rule | Description |
|------|-------------|
| `react-state-minimize` | Minimize state subscriptions |
| `react-state-dispatcher` | Use dispatcher pattern for callbacks |
| `react-state-fallback` | Show fallback on first render |
| `react-compiler-destructure-functions` | Destructure for React Compiler |
| `react-compiler-reanimated-shared-values` | Handle shared values with compiler |

### 6. Rendering (MEDIUM) - `rendering-`

| Rule | Description |
|------|-------------|
| `rendering-text-in-text-component` | Wrap text in Text components |
| `rendering-no-falsy-and` | Avoid falsy && for conditional rendering |

### 7. Monorepo (MEDIUM) - `monorepo-`

| Rule | Description |
|------|-------------|
| `monorepo-native-deps-in-app` | Keep native dependencies in app package |
| `monorepo-single-dependency-versions` | Use single versions across packages |

### 8. Configuration (LOW)

| Rule | Description |
|------|-------------|
| `fonts-config-plugin` | Use config plugins for custom fonts |
| `imports-design-system-folder` | Organize design system imports |
| `js-hoist-intl` | Hoist Intl object creation |

## KredBook Specific Adaptations

### FlashList Setup

```tsx
import { FlashList } from '@shopify/flash-list';

<FlashList
  data={items}
  renderItem={({ item }) => <ListItem item={item} />}
  estimatedItemSize={80}
  keyExtractor={(item) => item.id}
/>
```

### Image Optimization

```tsx
import { Image } from 'expo-image';

<Image
  source={uri}
  contentFit="cover"
  transition={200}
  cachePolicy="memory-disk"
/>
```

### Animation Best Practice

```tsx
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

// âœ… Animate transform/opacity only
const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ translateX: translateX.value }],
  opacity: opacity.value,
}));

// âŒ Avoid animating other properties
// backgroundColor, width, height = GPU-intensive
```

### Pressable Usage

```tsx
import { Pressable, Text } from 'react-native';

// âœ… Use Pressable
<Pressable onPress={handlePress}>
  <Text>Press me</Text>
</Pressable>
```

### Safe Area ScrollView

```tsx
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';

<SafeAreaView style={{ flex: 1 }}>
  <ScrollView contentInsetAdjustmentBehavior="automatic">
    {/* content */}
  </ScrollView>
</SafeAreaView>
```

## State Patterns

### Minimize State Subscriptions

```tsx
// âŒ BAD - Multiple re-renders
const { name, email, phone } = user;

// âœ… GOOD - Stable reference
const user = useUser(id);
// Access only what's needed
const name = user?.name;
```

### Dispatcher Pattern

```tsx
// For callbacks that need stable references
const handlePress = useCallback((id: string) => {
  dispatch({ type: 'SELECT', payload: id });
}, [dispatch]);
```

---

*Loaded when: "React Native", "Expo", "mobile", "native", "list performance", "animation", "Reanimated"*
