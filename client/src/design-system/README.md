# PlanHaus Design System

## Overview
This design system ensures consistent, beautiful, and accessible UI components across the PlanHaus wedding planning application.

## Color Palette

### Primary Colors
- **Blush (Primary)**: `hsl(var(--blush))` - Main brand color for buttons, links, and accents
- **Rose Gold**: `hsl(var(--rose-gold))` - Secondary accent for highlights and gradients
- **Champagne**: `hsl(var(--champagne))` - Warm accent for backgrounds and subtle elements

### Neutral Colors
- **Cream**: `hsl(var(--cream))` - Light backgrounds and cards
- **Ivory**: `hsl(var(--ivory))` - Pure white backgrounds
- **Sage**: `hsl(var(--sage))` - Muted accent for secondary elements

### Semantic Colors
- **Success**: Green for positive actions and states
- **Warning**: Yellow/Orange for caution states
- **Error**: Red for errors and destructive actions

## Typography

### Fonts
- **Headings**: Playfair Display (serif) - for titles and major headings
- **Body**: Inter (sans-serif) - for all body text and UI elements

### Usage
```tsx
// Headings
<h1 className="font-serif text-4xl font-semibold">Main Title</h1>
<h2 className="font-serif text-2xl font-medium">Section Title</h2>

// Body text
<p className="font-sans text-base">Regular paragraph text</p>
<span className="font-sans text-sm text-muted-foreground">Small text</span>
```

## Component Usage

### Buttons
```tsx
import { Button } from '@/components/design-system';

// Primary button (use for main actions)
<Button variant="default">Primary Action</Button>

// Secondary button (use for secondary actions)
<Button variant="secondary">Secondary Action</Button>

// Outline button (use for less prominent actions)
<Button variant="outline">Outline Action</Button>

// Wedding-themed button
<Button variant="wedding">Wedding Action</Button>
```

### Cards
```tsx
import { Card, CardHeader, CardContent, CardTitle } from '@/components/design-system';

<Card variant="default">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    Card content goes here
  </CardContent>
</Card>
```

### Forms
```tsx
import { Input, Label } from '@/components/design-system';

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="Enter your email" />
</div>
```

## Spacing System

Use consistent spacing values:
- `xs`: 0.25rem (4px)
- `sm`: 0.5rem (8px)
- `md`: 1rem (16px)
- `lg`: 1.5rem (24px)
- `xl`: 2rem (32px)
- `2xl`: 3rem (48px)

## Border Radius

- `sm`: 0.125rem (2px)
- `md`: 0.375rem (6px)
- `lg`: 0.5rem (8px)
- `xl`: 0.75rem (12px)
- `2xl`: 1rem (16px)

## Shadows

- `elegant`: Subtle shadow for cards
- `glow`: Enhanced shadow for elevated elements
- `wedding`: Special shadow with brand color tint

## Best Practices

### 1. Use Design System Components
Always import from `@/components/design-system` instead of individual UI folders:
```tsx
// ✅ Good
import { Button, Card, Input } from '@/components/design-system';

// ❌ Avoid
import { Button } from '@/components/ui/button';
```

### 2. Consistent Color Usage
Use the defined color tokens instead of hardcoded values:
```tsx
// ✅ Good
<div className="bg-blush text-white">Content</div>

// ❌ Avoid
<div className="bg-pink-500 text-white">Content</div>
```

### 3. Proper Focus States
Always include proper focus states for accessibility:
```tsx
// ✅ Good
<button className="focus-ring-blush">Button</button>

// ❌ Avoid
<button className="focus:outline-none">Button</button>
```

### 4. Consistent Spacing
Use the spacing system for consistent layouts:
```tsx
// ✅ Good
<div className="space-y-4 p-6">Content</div>

// ❌ Avoid
<div className="space-y-4 p-6" style={{ marginBottom: '20px' }}>Content</div>
```

## Accessibility Guidelines

1. **Color Contrast**: Ensure sufficient contrast ratios (4.5:1 for normal text)
2. **Focus Indicators**: Always provide visible focus states
3. **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible
4. **Screen Reader Support**: Use proper ARIA labels and semantic HTML

## Responsive Design

- Mobile-first approach
- Use responsive utilities: `sm:`, `md:`, `lg:`, `xl:`
- Test on multiple screen sizes

## Animation Guidelines

- Use subtle, purposeful animations
- Respect user's motion preferences
- Keep animations under 300ms for interactions
- Use easing functions for natural movement

## Common Patterns

### Page Layout
```tsx
import { UnifiedPageLayout } from '@/components/layout/UnifiedPageLayout';

<UnifiedPageLayout title="Page Title" subtitle="Optional subtitle">
  {/* Page content */}
</UnifiedPageLayout>
```

### Section Layout
```tsx
import { UnifiedSection, UnifiedGrid, UnifiedCard } from '@/components/layout/UnifiedSection';

<UnifiedSection title="Section Title">
  <UnifiedGrid>
    <UnifiedCard>
      {/* Card content */}
    </UnifiedCard>
  </UnifiedGrid>
</UnifiedSection>
```

## Troubleshooting

### Common Issues

1. **Missing CSS Classes**: If you see errors about missing classes like `focus:ring-blush`, ensure you're using the design system components and utilities.

2. **Inconsistent Styling**: Always import from `@/components/design-system` to ensure consistent styling.

3. **Color Mismatches**: Use the defined color tokens instead of Tailwind's default colors.

### Getting Help

- Check this documentation first
- Review existing components in the design system
- Ensure you're using the latest design system imports
- Test your components across different screen sizes 