# Composition Patterns Skill

> React composition patterns that scale. Avoid boolean prop proliferation by using compound components, lifting state, and composing internals.
> Adapted from Vercel's agent-skills.

## When to Use

- Refactoring components with many boolean props
- Building reusable component libraries
- Designing flexible component APIs
- Reviewing component architecture
- Working with compound components or context providers
- "refactor", "compound", "props", "architecture", "component design"

## Rule Categories

| Priority | Category | Impact |
|----------|----------|--------|
| 1 | Component Architecture | HIGH |
| 2 | State Management | MEDIUM |
| 3 | Implementation Patterns | MEDIUM |
| 4 | React 19 APIs | MEDIUM |

### 1. Component Architecture (HIGH) - `architecture-`

| Rule | Description |
|------|-------------|
| `architecture-avoid-boolean-props` | Don't add boolean props to customize behavior; use composition |
| `architecture-compound-components` | Structure complex components with shared context |

### 2. State Management (MEDIUM) - `state-`

| Rule | Description |
|------|-------------|
| `state-decouple-implementation` | Provider is the only place that knows how state is managed |
| `state-context-interface` | Define generic interface with state, actions, meta for dependency injection |
| `state-lift-state` | Move state into provider components for sibling access |

### 3. Implementation Patterns (MEDIUM) - `patterns-`

| Rule | Description |
|------|-------------|
| `patterns-explicit-variants` | Create explicit variant components instead of boolean modes |
| `patterns-children-over-render-props` | Use children for composition instead of renderX props |

### 4. React 19 APIs (MEDIUM) - `react19-`

> ⚠️ React 19+ only. Skip if using React 18 or earlier.

| Rule | Description |
|------|-------------|
| `react19-no-forwardref` | Don't use forwardRef; use use() instead |
| `react19-use-context` | Use use() instead of useContext() |

## Detailed Patterns

### Pattern 1: Avoid Boolean Props

**❌ BAD** - Boolean prop explosion:

```tsx
<Button
  variant="primary"
  size="md"
  disabled={false}
  loading={false}
  iconLeft={true}
  iconRight={false}
  fullWidth={true}
/>
```

**✅ GOOD** - Composition over configuration:

```tsx
<Button>
  <Button.Text>Click me</Button.Text>
  <Button.Icon name="arrow-right" />
</Button>
```

### Pattern 2: Compound Components

**Structure:**

```tsx
// Card.tsx - Parent component
import { createContext } from 'react';

type CardContext = {
  variant: 'elevated' | 'outlined';
};

const CardContext = createContext<CardContext>({ variant: 'elevated' });

export function Card({ children, variant = 'elevated' }) {
  return (
    <CardContext.Provider value={{ variant }}>
      <View style={styles.card}>{children}</View>
    </CardContext.Provider>
  );
}

// Card.Header - Child component
Card.Header = function Header({ title }) {
  const { variant } = useContext(CardContext);
  return <Text style={[styles.header, variantStyles[variant]}>{title}</Text>;
};

// Usage
<Card variant="outlined">
  <Card.Header title="Welcome" />
</Card>
```

### Pattern 3: Explicit Variants

**❌ BAD** - Boolean modes:

```tsx
function Button({ small, medium, large, primary, secondary, ... }) {
  // Expanding boolean mess
}
```

**✅ GOOD** - Explicit variants:

```tsx
function Button({ variant = 'primary', size = 'md', children }) {
  // Clean switch
}

Button.Size = { Small, Medium, Large };
Button.Variant = { Primary, Secondary, Ghost };
```

### Pattern 4: State Lifting

**Move state to common ancestor:**

```tsx
// ❌ BAD - Siblings can't communicate
function Parent() {
  return (
    <>
      <Header showMenu={false} />
      <Menu isOpen={false} />
    </>
  );
}

// ✅ GOOD - Lift state to provider
function MenuProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  return <MenuContext.Provider>{children}</MenuContext.Provider>;
}
```

### Pattern 5: Context Interface

**Define clean interfaces:**

```tsx
interface ToastInterface {
  // State
  toasts: Toast[];
  // Actions
  addToast: (toast: Toast) => void;
  removeToast: (id: string) => void;
  // Meta
  isVisible: boolean;
}
```

## React Native Examples

### Compound Component: Card

```tsx
// Card.tsx
export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

Card.Image = function CardImage({ source }) {
  return <Image source={source} style={styles.image} />;
};

Card.Content = function CardContent({ children }) {
  return <View style={styles.content}>{children}</View>;
};

Card.Actions = function CardActions({ children }) {
  return <View style={styles.actions}>{children}</View>;
};

// Usage
<Card>
  <Card.Image source={img} />
  <Card.Content>
    <Text>Title</Text>
  </Card.Content>
  <Card.Actions>
    <Button>Action</Button>
  </Card.Actions>
</Card>
```

### Compound Component: List

```tsx
// List.tsx
List.Item = function ListItem({ title, subtitle, onPress }) {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text>{title}</Text>
      <Text>{subtitle}</Text>
    </TouchableOpacity>
  );
};

// Usage
<List>
  <List.Item title="Item 1" onPress={() => {}} />
  <List.Item title="Item 2" onPress={() => {}} />
</List>
```

---

*Loaded when: "refactor", "compound", "props", "architecture", "component design", "API"*
