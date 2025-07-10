# Rhythm90 Design System & Style Guide

## Overview

This document outlines the design system, component patterns, and styling guidelines for the Rhythm90 application. Our design system is built on Tailwind CSS with shadcn/ui components, ensuring consistency and maintainability across the application.

## Design Principles

- **Consistency**: Uniform patterns and components across all interfaces
- **Accessibility**: WCAG 2.1 AA compliance for all components
- **Responsive**: Mobile-first design approach
- **Performance**: Optimized for fast loading and smooth interactions
- **Dark Mode**: Full support for light and dark themes

## Color System

### Primary Colors
- **Primary**: `#dc2626` (rhythmRed) - Main brand color for CTAs and highlights
- **Primary Foreground**: `#ffffff` - Text on primary backgrounds

### Semantic Colors
- **Success**: `#16a34a` (green-600) - Success states, confirmations
- **Warning**: `#ca8a04` (yellow-600) - Warnings, alerts
- **Error**: `#dc2626` (red-600) - Errors, destructive actions
- **Info**: `#2563eb` (blue-600) - Information, links

### Neutral Colors
- **Background**: `#ffffff` (light) / `#0a0a0a` (dark)
- **Foreground**: `#0a0a0a` (light) / `#ffffff` (dark)
- **Muted**: `#f5f5f5` (light) / `#262626` (dark)
- **Muted Foreground**: `#737373` (light) / `#a3a3a3` (dark)
- **Border**: `#e5e5e5` (light) / `#262626` (dark)

### Dark Mode Considerations
- Ensure sufficient contrast ratios (minimum 4.5:1 for normal text)
- Use semantic colors that adapt appropriately
- Test all components in both light and dark modes

## Typography

### Font Stack
- **Primary**: Inter (system font fallback)
- **Monospace**: JetBrains Mono (for code, API examples)

### Type Scale
- **Display**: `text-4xl` (36px) - Page headers
- **H1**: `text-3xl` (30px) - Section headers
- **H2**: `text-2xl` (24px) - Subsection headers
- **H3**: `text-xl` (20px) - Card headers
- **H4**: `text-lg` (18px) - Form labels
- **Body**: `text-base` (16px) - Main content
- **Small**: `text-sm` (14px) - Secondary text, captions
- **XS**: `text-xs` (12px) - Metadata, timestamps

### Font Weights
- **Light**: `font-light` (300)
- **Normal**: `font-normal` (400)
- **Medium**: `font-medium` (500)
- **Semibold**: `font-semibold` (600)
- **Bold**: `font-bold` (700)

## Spacing System

### Base Unit: 4px (0.25rem)
- **XS**: `space-1` (4px)
- **S**: `space-2` (8px)
- **M**: `space-3` (12px)
- **L**: `space-4` (16px)
- **XL**: `space-6` (24px)
- **2XL**: `space-8` (32px)
- **3XL**: `space-12` (48px)

### Component Spacing
- **Card Padding**: `p-4` (16px) / `p-6` (24px)
- **Button Padding**: `px-4 py-2` (16px × 8px)
- **Form Spacing**: `space-y-4` (16px between elements)
- **Section Spacing**: `space-y-8` (32px between sections)

## Component Library

### Buttons

#### Primary Button
```tsx
<Button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Primary Action
</Button>
```

#### Secondary Button
```tsx
<Button variant="outline" className="border-border text-foreground hover:bg-muted">
  Secondary Action
</Button>
```

#### Danger Button
```tsx
<Button variant="destructive" className="bg-destructive text-destructive-foreground">
  Delete
</Button>
```

#### Ghost Button
```tsx
<Button variant="ghost" className="text-muted-foreground hover:text-foreground">
  Ghost Action
</Button>
```

#### Button Sizes
- **Default**: `px-4 py-2` (16px × 8px)
- **Small**: `px-3 py-1.5` (12px × 6px)
- **Large**: `px-6 py-3` (24px × 12px)

### Cards

#### Standard Card
```tsx
<Card className="border border-border bg-card">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-muted-foreground">Card content</p>
  </CardContent>
</Card>
```

#### Interactive Card
```tsx
<Card className="border border-border bg-card hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer">
  <CardContent className="p-4">
    Interactive content
  </CardContent>
</Card>
```

### Forms

#### Input Field
```tsx
<div>
  <label className="block text-sm font-medium text-foreground mb-2">
    Label
  </label>
  <Input 
    className="border-border bg-background text-foreground"
    placeholder="Placeholder text"
  />
  <p className="text-sm text-muted-foreground mt-1">
    Helper text
  </p>
</div>
```

#### Textarea
```tsx
<textarea
  className="w-full p-3 border border-border rounded-md bg-background text-foreground font-mono text-sm"
  rows={4}
  placeholder="Enter text..."
/>
```

### Badges

#### Status Badge
```tsx
<Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
  Active
</Badge>
```

#### Type Badge
```tsx
<Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
  Feature Update
</Badge>
```

### Tables

#### Responsive Table
```tsx
<div className="overflow-x-auto">
  <table className="min-w-full bg-card border border-border rounded-lg">
    <thead className="bg-muted/50">
      <tr>
        <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
          Header
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-border">
      <tr className="hover:bg-muted/50">
        <td className="px-4 py-3 text-sm text-foreground">
          Content
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

## Layout Patterns

### Page Layout
```tsx
<PageLayout maxWidth="7xl" className="py-8">
  <h1 className="text-3xl font-bold text-foreground mb-8">Page Title</h1>
  <div className="space-y-6">
    {/* Page content */}
  </div>
</PageLayout>
```

### Sidebar Layout
```tsx
<div className="flex flex-col lg:flex-row gap-8">
  {/* Sidebar */}
  <div className="lg:w-64 lg:flex-shrink-0">
    <Sidebar items={sidebarItems} title="Section" className="bg-card border rounded-lg" />
  </div>
  
  {/* Main Content */}
  <div className="flex-1 space-y-6">
    {/* Content */}
  </div>
</div>
```

### Grid Systems

#### Responsive Grid
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Grid items */}
</div>
```

#### Card Grid
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {/* Cards */}
</div>
```

## Navigation

### Navbar
- **Desktop**: Horizontal navigation with right-side dropdowns
- **Mobile**: Slide-out sidebar overlay (from left)
- **Sticky**: Always visible at top of viewport
- **Theme Toggle**: Right-aligned with notifications

### Sidebar
- **Collapsible**: Toggle button for power users
- **Active States**: Visual indication of current page
- **Icons**: Emoji icons for visual hierarchy
- **Badges**: For notifications or status indicators

## Mobile Responsiveness

### Breakpoints
- **Mobile**: `< 640px` (sm)
- **Tablet**: `640px - 1024px` (md, lg)
- **Desktop**: `> 1024px` (xl, 2xl)

### Mobile Patterns
- **Cards**: Stack vertically on mobile
- **Tables**: Horizontal scroll with `overflow-x-auto`
- **Forms**: Full-width inputs, stacked labels
- **Buttons**: Full-width on mobile, auto-width on desktop
- **Navigation**: Slide-out overlay, hamburger menu

### Responsive Utilities
```tsx
// Responsive visibility
<div className="hidden lg:block">Desktop only</div>
<div className="lg:hidden">Mobile only</div>

// Responsive spacing
<div className="p-4 sm:p-6 lg:p-8">Adaptive padding</div>

// Responsive text
<h1 className="text-2xl sm:text-3xl lg:text-4xl">Responsive heading</h1>
```

## Interactive States

### Hover States
- **Buttons**: `hover:bg-primary/90` (10% opacity increase)
- **Cards**: `hover:shadow-lg hover:scale-[1.02]` (subtle lift)
- **Links**: `hover:text-foreground` (color change)

### Focus States
- **Inputs**: `focus:ring-2 focus:ring-primary focus:ring-offset-2`
- **Buttons**: `focus:ring-2 focus:ring-primary focus:ring-offset-2`
- **Links**: `focus:outline-none focus:ring-2 focus:ring-primary`

### Loading States
```tsx
<Button disabled={loading}>
  {loading ? (
    <>
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
      Loading...
    </>
  ) : (
    "Submit"
  )}
</Button>
```

## Animation & Transitions

### Transitions
- **Default**: `transition-colors` (200ms)
- **Smooth**: `transition-all duration-300 ease-in-out`
- **Fast**: `transition-transform duration-150`

### Animations
- **Spin**: `animate-spin` (for loading indicators)
- **Pulse**: `animate-pulse` (for notifications)
- **Fade**: Custom CSS for modals and overlays

## Accessibility

### ARIA Labels
```tsx
<button aria-label="Close modal" aria-expanded={isOpen}>
  ✕
</button>
```

### Keyboard Navigation
- **Tab Order**: Logical flow through interactive elements
- **Skip Links**: For main content navigation
- **Focus Indicators**: Visible focus rings on all interactive elements

### Screen Reader Support
- **Semantic HTML**: Proper heading hierarchy (h1 → h6)
- **Alt Text**: Descriptive alt text for images
- **Live Regions**: For dynamic content updates

## Best Practices

### Component Design
1. **Single Responsibility**: Each component has one clear purpose
2. **Composition**: Build complex components from simple ones
3. **Props Interface**: Clear, typed props with sensible defaults
4. **Error Boundaries**: Graceful error handling

### Performance
1. **Lazy Loading**: Load components and routes on demand
2. **Memoization**: Use React.memo for expensive components
3. **Bundle Splitting**: Separate vendor and app code
4. **Image Optimization**: Use appropriate formats and sizes

### Code Quality
1. **TypeScript**: Strict typing for all components
2. **ESLint**: Consistent code style and best practices
3. **Prettier**: Automatic code formatting
4. **Testing**: Unit tests for critical components

## Implementation Examples

### Complete Card Component
```tsx
interface CardProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function InfoCard({ title, description, children, className }: CardProps) {
  return (
    <Card className={cn("transition-all hover:shadow-lg", className)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          {title}
        </CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
      </CardContent>
    </Card>
  );
}
```

### Responsive Layout Component
```tsx
interface ResponsiveGridProps {
  children: ReactNode;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: number;
}

export function ResponsiveGrid({ 
  children, 
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 6 
}: ResponsiveGridProps) {
  const gridClasses = cn(
    "grid gap-6",
    `grid-cols-${cols.mobile}`,
    `sm:grid-cols-${cols.tablet}`,
    `lg:grid-cols-${cols.desktop}`
  );

  return <div className={gridClasses}>{children}</div>;
}
```

## Resources

### Design Tokens
- **Tailwind Config**: `tailwind.config.js`
- **CSS Variables**: `src/index.css`
- **Component Library**: `src/components/ui/`

### Tools
- **Design System**: shadcn/ui
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Typography**: Inter font family

### References
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Inter Font](https://rsms.me/inter/)

---

*This style guide is a living document. Update it as the design system evolves.* 