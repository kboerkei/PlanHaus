# Design System Migration Guide

## Overview
This guide helps you migrate existing components to use the unified design system for better consistency and maintainability.

## Quick Migration Checklist

### 1. Update Imports
```tsx
// ❌ Old way
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

// ✅ New way
import { Button, Card, Input } from '@/components/design-system';
```

### 2. Fix Color Usage
```tsx
// ❌ Old way - hardcoded colors
<div className="bg-pink-500 text-white">Content</div>
<button className="focus:ring-pink-500">Button</button>

// ✅ New way - design system colors
<div className="bg-blush text-white">Content</div>
<button className="focus-ring-blush">Button</button>
```

### 3. Update Focus States
```tsx
// ❌ Old way - inconsistent focus rings
<button className="focus:ring-2 focus:ring-blush focus:ring-offset-2">Button</button>

// ✅ New way - consistent focus utilities
<button className="focus-ring-blush">Button</button>
```

## Component-Specific Migrations

### Button Components
```tsx
// ❌ Old way
<Button variant="default" className="bg-pink-500 hover:bg-pink-600">
  Action
</Button>

// ✅ New way
<Button variant="default">
  Action
</Button>
```

### Card Components
```tsx
// ❌ Old way
<div className="bg-white rounded-lg border border-gray-200 shadow-md p-6">
  Content
</div>

// ✅ New way
<Card variant="default">
  <CardContent>
    Content
  </CardContent>
</Card>
```

### Form Components
```tsx
// ❌ Old way
<input 
  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
  placeholder="Enter text"
/>

// ✅ New way
<Input 
  placeholder="Enter text"
  className="w-full"
/>
```

## Color Mapping Reference

| Old Color | New Color | Usage |
|-----------|-----------|-------|
| `bg-pink-500` | `bg-blush` | Primary buttons, links |
| `bg-pink-600` | `bg-blush/90` | Hover states |
| `bg-pink-100` | `bg-blush/10` | Light backgrounds |
| `text-pink-600` | `text-blush` | Primary text |
| `border-pink-300` | `border-blush/30` | Light borders |
| `focus:ring-pink-500` | `focus-ring-blush` | Focus states |

## Common Patterns to Update

### 1. Status Indicators
```tsx
// ❌ Old way
<span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
  Completed
</span>

// ✅ New way
<Badge variant="success">Completed</Badge>
```

### 2. Navigation Items
```tsx
// ❌ Old way
<button className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
  Menu Item
</button>

// ✅ New way
<Button variant="ghost" className="w-full justify-start">
  Menu Item
</Button>
```

### 3. Form Layouts
```tsx
// ❌ Old way
<div className="space-y-4">
  <div>
    <label className="block text-sm font-medium text-gray-700">Email</label>
    <input className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
  </div>
</div>

// ✅ New way
<div className="space-y-4">
  <div className="space-y-2">
    <Label htmlFor="email">Email</Label>
    <Input id="email" type="email" />
  </div>
</div>
```

## Testing Your Migration

### 1. Visual Testing
- [ ] Check that colors match the design system
- [ ] Verify hover and focus states work correctly
- [ ] Ensure consistent spacing and typography
- [ ] Test on different screen sizes

### 2. Accessibility Testing
- [ ] Verify focus indicators are visible
- [ ] Check keyboard navigation works
- [ ] Ensure proper ARIA labels
- [ ] Test with screen readers

### 3. Functionality Testing
- [ ] Verify all interactions work as expected
- [ ] Check that form submissions work
- [ ] Test error states and loading states
- [ ] Ensure responsive behavior

## Common Issues and Solutions

### Issue: Missing CSS Classes
**Error**: `The 'focus:ring-blush' class does not exist`

**Solution**: 
1. Ensure you're importing from `@/components/design-system`
2. Check that the CSS file is properly loaded
3. Verify the color is defined in the design system

### Issue: Inconsistent Styling
**Problem**: Components look different across pages

**Solution**:
1. Use the unified design system components
2. Avoid mixing old and new component libraries
3. Follow the design system documentation

### Issue: Color Mismatches
**Problem**: Colors don't match the design system

**Solution**:
1. Use the color mapping reference above
2. Replace hardcoded colors with design system tokens
3. Test in both light and dark modes

## Migration Priority

### High Priority (Fix First)
1. **Button components** - Most visible and frequently used
2. **Form inputs** - Critical for user interaction
3. **Navigation elements** - Used across all pages
4. **Color inconsistencies** - Affects overall brand perception

### Medium Priority
1. **Card components** - Used for content organization
2. **Status indicators** - Important for user feedback
3. **Modal dialogs** - Used for important interactions

### Low Priority
1. **Utility components** - Less visible but still important
2. **Animation refinements** - Polish and enhancement
3. **Documentation updates** - Help future development

## Getting Help

If you encounter issues during migration:

1. **Check the design system documentation** first
2. **Review existing migrated components** for examples
3. **Test with the design system playground** (if available)
4. **Ask for code review** from team members familiar with the design system

## Success Metrics

After migration, you should see:

- ✅ Consistent visual appearance across all pages
- ✅ Improved accessibility scores
- ✅ Reduced CSS bundle size
- ✅ Faster development with reusable components
- ✅ Better maintainability and easier updates 