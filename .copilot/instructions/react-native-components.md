# React Native Components Guide

## Component File Structure

```tsx
// src/components/[domain]/[ComponentName].tsx

import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '@/utils/theme';
import { [Icon] } from 'lucide-react-native';

interface [ComponentName]Props {
  [requiredProp]: [type];
  [optionalProp]?: [type];
  onPress?: () => void;
}

export function [ComponentName]({
  [requiredProp],
  [optionalProp],
  onPress,
}: [ComponentName]Props) {
  // Component logic here

  return (
    <View style={styles.container}>
      {/* JSX here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // styles using theme
  },
});
```

## Props

### Always Use Interface

```tsx
interface CardProps {
  title: string;
  subtitle?: string;
  onPress?: () => void;
}
```

### Optional vs Required

```tsx
// Required prop (no ?)
title: string

// Optional prop (with ?)
subtitle?: string
onPress?: () => void
```

## Styling

### Use theme.ts for All Values

```tsx
✅ Good:
const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
    color: theme.colors.text,
    borderRadius: theme.borderRadius.md,
  },
});

❌ Bad:
const styles = StyleSheet.create({
  container: {
    padding: 16,               // Use theme.spacing.md
    color: '#000000',          // Use theme.colors.text
    borderRadius: 8,           // Use theme.borderRadius.md
  },
});
```

### Theme Properties

```typescript
// From src/utils/theme.ts
theme.colors.{
  background,
  text,
  textSecondary,
  primary,
  secondary,
  success,
  danger,
  warning,
  // ... more colors
}

theme.spacing.{
  xs,    // 4
  sm,    // 8
  md,    // 16
  lg,    // 24
  xl,    // 32
  // ... more
}

theme.borderRadius.{
  sm,    // 4
  md,    // 8
  lg,    // 12
  // ... more
}
```

## Icons

### Use lucide-react-native

```tsx
✅ Good:
import { X, Check, ChevronRight } from 'lucide-react-native';

<X size={24} color={theme.colors.danger} />
<Check size={24} color={theme.colors.success} />

❌ Bad:
import { Ionicons } from '@expo/vector-icons';  // Don't use this

<Ionicons name="close" size={24} color="#EF4444" />  // Don't do this
```

## Common Component Types

### Card Component

```tsx
interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
}

export function Card({ children, onPress }: CardProps) {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    // Add shadow for elevation
  },
});
```

### List Item Component

```tsx
interface ListItemProps {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}

export function ListItem({
  title,
  subtitle,
  onPress,
  rightElement,
}: ListItemProps) {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {rightElement}
    </Pressable>
  );
}
```

### Button Component

```tsx
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  disabled,
}: ButtonProps) {
  const backgroundColor =
    variant === "primary"
      ? theme.colors.primary
      : variant === "danger"
        ? theme.colors.danger
        : theme.colors.secondary;

  return (
    <Pressable
      style={[styles.container, { backgroundColor }]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}
```

## Layout Patterns

### ScrollView vs FlatList

```tsx
// For small lists with mixed content → ScrollView
<ScrollView>
  <Header />
  <Section1 />
  <Section2 />
</ScrollView>

// For large lists of same item type → FlatList
<FlatList
  data={customers}
  renderItem={({ item }) => <CustomerCard customer={item} />}
  keyExtractor={item => item.id}
/>
```

### SafeAreaView

```tsx
import { SafeAreaView } from "react-native-safe-area-context";

export function Screen() {
  return (
    <SafeAreaView style={styles.container}>{/* Content here */}</SafeAreaView>
  );
}
```

## Accessibility

### Add testID for Testing

```tsx
<Pressable testID="submit-button" onPress={onPress}>
  <Text>Submit</Text>
</Pressable>
```

### Add Proper Labels

```tsx
<Pressable
  accessible={true}
  accessibilityLabel="Close dialog"
  accessibilityRole="button"
  onPress={onClose}
>
  <X size={24} />
</Pressable>
```

## Component Documentation

Add comments explaining non-obvious behavior:

```tsx
/**
 * CustomerCard displays a customer's basic info and balance.
 *
 * Props:
 * - customer: Customer object with name, phone, balance
 * - onPress: Called when card is clicked
 * - showBalance: Whether to show outstanding balance (default: true)
 */
export function CustomerCard({
  customer,
  onPress,
  showBalance = true,
}: CustomerCardProps) {
  // ...
}
```

---

**Remember:** Consistent styling using theme.ts makes your app feel cohesive and makes it easy for Copilot to generate code that matches.
