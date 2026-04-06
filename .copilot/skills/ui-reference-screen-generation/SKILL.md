---
name: ui-reference-screen-generation
description: Use when building screens from design images or UI references - analyzes design files and generates screen code matching your design system
---

# UI Reference-Based Screen Generation

## Overview

**Turn images into code.**

Drop a design image → Get working React Native screen code that matches:

- ✓ Your design system (colors, spacing, typography)
- ✓ Your component library (custom components, lucide icons)
- ✓ KredBook conventions (imports, error handling, patterns)
- ✓ Your project structure (file locations, naming)

## When to Use

### ✅ Perfect For

- **Figma → Code**: Export screen design from Figma, generate screen code
- **Photo → Prototype**: Take photo of whiteboard sketch, generate screen
- **Reference Design**: "Build this screen like the design in /designs/customer-detail.png"
- **New Team Member**: "Here's the design, build the screen"
- **Quick Prototyping**: Iterate design → code → test quickly
- **Multi-screen Features**: Multiple related screens from one design document

### ❌ Not For

- Existing code changes (use `copilot:feature` instead)
- Complex business logic (use `copilot:backend` for API)
- Non-visual features (use appropriate skill)

## How It Works

### Step 1: Prepare Design Image

Place your design file in `designs/` folder:

```
designs/
├── customer-detail.png          ← Screenshot or export
├── order-form.figma.png         ← From Figma
├── payment-modal.sketch.png     ← From Sketch
└── dashboard-dashboard.jpg      ← Photo reference
```

### Step 2: Describe What You Need

```
copilot:ui-reference-screen

Design image: /designs/customer-detail.png

Requirements:
- User taps on customer from list
- Shows customer info (name, phone, balance)
- Shows recent transactions (table)
- Action buttons at bottom (Edit, Delete, Message)

Colors: Use theme.ts colors
Icons: Use lucide-react-native
Pattern: Follow screen-development.md structure
```

### Step 3: Review Generated Code

Copilot generates:

- Screen component with proper SafeAreaView + status bar
- Proper component imports from your library
- Styled using theme.ts values
- TypeScript types defined
- Error handling
- Loading states

### Step 4: Test and Refine

- ✓ Test on iOS and Android simulators
- ✓ Verify colors match design
- ✓ Check responsive layout
- ✓ Iterate if needed

## Prompt Template

```
copilot:ui-reference-screen

Design image: [path/to/design.png]

Screen name: [ScreenName]

What user sees:
- [Description of layout]
- [What sections/components]

Functionality:
- [What happens when user interacts]
- [Navigation flows]

Design notes:
- Colors from: [theme.ts]
- Icons from: [lucide-react-native]
- Components from: [your custom components or standard]

Data source:
- How to load data: [API hook, query, context]
- What to display while loading: [Spinner]
- How to handle errors: [Error toast, retry button]

Related files:
- Follow: instructions/screen-development.md
- Reference: docs/ux-context.md section [N]
```

## Example: Customer Detail Screen

### Design Image

```
/ designs/customer-detail.png

Shows:
┌─────────────────────────────────┐
│ Customer: John Doe              │
│ Phone: 98765-43210   Balance: ₹5000 │
│ ─────────────────────────────────│
│ Recent Transactions:            │
│ • 2024-04-05  Invoice #45  ₹1500│
│ • 2024-04-02  Payment    -₹500  │
│ • 2024-03-28  Invoice #44  ₹2000│
│ ─────────────────────────────────│
│  [Edit]  [Message]  [Delete]    │
└─────────────────────────────────┘
```

### Your Prompt

```
copilot:ui-reference-screen

Design image: /designs/customer-detail.png

Screen name: CustomerDetailScreen

What user sees:
- Header with customer name
- Customer info card (phone, balance)
- Recent transactions list (date, description, amount)
- Action buttons at bottom (Edit, Message, Delete)

Functionality:
- Get customer data from useCustomer(id) hook
- Get transactions from useCustomerTransactions(customerId)
- Edit button navigates to edit screen
- Delete button shows confirm dialog
- Message button opens WhatsApp

Data loading:
- Show spinner while loading
- Show error message if fails
- Auto-refresh on focus

Follow: instructions/screen-development.md
Use: theme.ts for colors, lucide-react-native for icons
Reference: docs/ux-context.md section 4.5 (Customer Detail)
```

### Generated Code

Screen file: `app/(main)/customers/[customerId].tsx`

```tsx
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Edit2, MessageSquare, Trash2 } from "lucide-react-native";
import { theme } from "@/utils/theme";
import { useCustomer } from "@/hooks/useCustomer";
import { useCustomerTransactions } from "@/hooks/useCustomerTransactions";
import { CustomerInfoCard } from "@/components/customers/CustomerInfoCard";

export default function CustomerDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ customerId: string }>();
  const customerId = params.customerId!;

  const { data: customer, isLoading, error } = useCustomer(customerId);
  const { data: transactions } = useCustomerTransactions(customerId);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage />;

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.container}>
        <CustomerInfoCard customer={customer} />

        <FlatList
          data={transactions}
          renderItem={({ item }) => <TransactionRow transaction={item} />}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<EmptyMessage />}
        />

        <View style={styles.actions}>
          <Button
            title="Edit"
            variant="secondary"
            onPress={() => router.push(`/customers/${customerId}/edit`)}
          />
          <Button
            title="Message"
            variant="secondary"
            onPress={() => openWhatsApp(customer)}
          />
          <Button
            title="Delete"
            variant="danger"
            onPress={() => showDeleteConfirm()}
          />
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  actions: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
});
```

## Key Features

### 1. Design System Awareness

Reads `theme.ts` and uses your colors, spacing, typography:

```tsx
// ❌ Old way:
color: "#0061FF";
fontSize: 16;

// ✅ New way (generated):
color: theme.colors.primary;
fontSize: theme.fontSize.body;
```

### 2. Component Auto-Detection

Sees "icon" in design → Uses lucide-react-native:

```tsx
import { Edit2, MessageSquare, Trash2 } from "lucide-react-native";

<Edit2 size={24} color={theme.colors.text} />;
```

### 3. Convention Compliance

Automatically follows KredBook patterns:

- ✓ Absolute imports from `@/`
- ✓ `SafeAreaView` + `StatusBar`
- ✓ Proper error handling
- ✓ Loading states
- ✓ ReactQuery hooks for data
- ✓ TypeScript types
- ✓ Accessibility features

### 4. Screen Navigation

Detects navigation needs from design:

```tsx
// If design shows "tap to open":
<Pressable onPress={() => router.push(`/path/${id}`)}>...</Pressable>
```

### 5. Responsive Layout

Generates layouts that work on different screen sizes:

```tsx
contentContainerStyle={{
  paddingHorizontal: theme.spacing.md,
  gap: theme.spacing.md,
}}
```

## Common Designs → Code

### List Screen

Design → Code:

- Horizontal cards in vertical list
- Pull-to-refresh
- Search bar at top
- FAB for "add"
- Empty state message

### Detail Screen

Design → Code:

- Header with image/icon
- Info sections (scrollable)
- Action buttons at bottom
- Share/edit buttons
- Expandable sections

### Form Screen

Design → Code:

- Input fields with labels
- Validation on submit
- Loading state during save
- Success/error feedback
- Cancel button

### Modal/Sheet

Design → Code (if design shows modal):

- Bottom sheet or overlay
- Backdrop blur
- Close button
- Form or action buttons
- Animation

## Image Analysis Technology

The skill analyzes images to extract:

| Element        | Detection                      | Generated Code                            |
| -------------- | ------------------------------ | ----------------------------------------- |
| **Layout**     | Flexbox/grid pattern           | `flexDirection`, `justifyContent`         |
| **Color**      | Hex/RGB from image             | Matches to `theme.colors.*`               |
| **Typography** | Font size, weight              | Maps to `theme.fontSize.*`                |
| **Icons**      | Icon shape                     | Uses `lucide-react-native`                |
| **Buttons**    | Button style                   | `primary`, `secondary`, `danger` variants |
| **Lists**      | Rows/cards                     | `FlatList` with proper structure          |
| **Navigation** | Tap targets                    | `router.push()` with proper params        |
| **States**     | Loading spinners, empty states | `isLoading`, error handling               |

## Workflow

### Small Feature (1 Screen)

```
1. Design the screen (Figma/paper)
2. Export or photograph design
3. Place in designs/ folder
4. Use copilot:ui-reference-screen
5. Get working screen
6. Write TDD tests for logic
7. Commit
```

### Larger Feature (3+ Screens)

```
1. Design all screens together
2. Export/photograph multiple designs
3. Create separate designs/ files
4. For each screen:
   copilot:ui-reference-screen
5. Connect screens with navigation
6. Add API integration (copilot:backend)
7. Write tests (copilot:test)
8. Verify (copilot:verify)
```

## Tips

### ✅ DO

- **High contrast designs**: AI reads them better
- **Label components**: Add "button", "list", "form" labels
- **Include color palette**: Shows which colors matter
- **Show interactive states**: Checked, active, disabled
- **Use realistic data**: AI generates with real examples

### ❌ DON'T

- **Blurry images**: Hard to analyze (take screenshots instead)
- **Sketchy drawings**: Use photos or digital designs
- **Mix multiple designs**: One design per prompt
- **Skip details**: Show colors, spacing, text clearly
- **Use images of other apps**: Use your own designs

## Integration with Other Skills

### Design → TDD Workflow

```
1. copilot:ui-reference-screen (build UI from design)
2. copilot:tdd (add tests for logic)
3. copilot:verify (quality check)
4. copilot:review (PR description)
```

### Multiple Screens

```
1. Design all screens
2. copilot:ui-reference-screen (Screen 1)
3. copilot:ui-reference-screen (Screen 2)
4. copilot:ui-reference-screen (Screen 3)
5. copilot:backend (API integration)
6. copilot:tdd (add business logic tests)
```

## Generated Files

This skill creates:

```
app/(main)/
├── [feature]/
│   ├── _layout.tsx        (navigation)
│   ├── index.tsx          (list screen, generated)
│   └── [id].tsx           (detail screen, generated)

src/
├── components/
│   └── [feature]/         (reusable components from design, generated)
│       ├── [Component1].tsx
│       └── [Component2].tsx

src/
├── types/
│   └── [feature].ts       (TypeScript types, generated)
```

## Iteration

Design changes?

```
1. Update design image
2. Run copilot:ui-reference-screen again
3. Skill regenerates with new design
4. Update local changes if needed
5. Commit
```

## Example Prompts by Design Type

### Figma Export

```
copilot:ui-reference-screen

Design image: /designs/checkout-flow.figma.png
Screen name: CheckoutScreen

This is a Figma export.
Build a screen showing checkout summary,
order total, and payment options.
```

### Whiteboard Photo

```
copilot:ui-reference-screen

Design image: /designs/dashboard-sketch.jpg
Screen name: DashboardScreen

This is a whiteboard sketch.
Build the KredBook dashboard with:
- Quick stats (balance, sales)
- Recent transactions
- Action shortcuts
```

### Competitor Reference

```
copilot:ui-reference-screen

Design image: /designs/reference-paypal.png
Screen name: PaymentHistoryScreen

Build our version of this payment history screen.
Use our colors, icons, and components.
Show KredBook data (INR, vendor context).
```

---

**This skill saves:** 30-45 min per screen (design → code)  
**Works best with:** Figma, Sketch, or clear screenshots  
**Combines with:** TDD for logic, API integration for data

Use it to transform designs into working code instantly! 🎨➜💻
