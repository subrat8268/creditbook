# Custom SVG Icons

Drop Figma-exported `.svg` files here.

## Export Steps (Figma)

1. Select the icon frame/component
2. Right panel → Export → **SVG**
3. Uncheck "Include id attributes"
4. Download and place the `.svg` file in this folder

## Usage in code

```tsx
import MyIcon from "@/assets/icons/my-icon.svg";

// Use like any React component — supports width, height, color props
<MyIcon width={24} height={24} color={colors.primary} />;
```

## Naming convention

- Use kebab-case: `home-filled.svg`, `bill-outline.svg`
- Suffix with `-filled` or `-outline` to distinguish variants
