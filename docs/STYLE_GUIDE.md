# Rhythm90 Style Guide

## Overview
This style guide defines the design system for Rhythm90, ensuring consistency across all components and pages. It covers colors, typography, spacing, and component patterns.

## Color System

### Primary Colors
```css
/* Primary Brand Colors */
--rhythm-black: #1a1a1a;    /* Main brand color */
--rhythm-white: #ffffff;    /* Primary background */
--rhythm-red: #dc2626;      /* Accent color */
```

### Semantic Colors
```css
/* Success States */
--success-50: #f0fdf4;
--success-100: #dcfce7;
--success-500: #10b981;
--success-600: #059669;
--success-700: #047857;

/* Warning States */
--warning-50: #fffbeb;
--warning-100: #fef3c7;
--warning-500: #f59e0b;
--warning-600: #d97706;
--warning-700: #b45309;

/* Error States */
--error-50: #fef2f2;
--error-100: #fee2e2;
--error-500: #ef4444;
--error-600: #dc2626;
--error-700: #b91c1c;

/* Info States */
--info-50: #eff6ff;
--info-100: #dbeafe;
--info-500: #3b82f6;
--info-600: #2563eb;
--info-700: #1d4ed8;
```

### Neutral Colors
```css
/* Gray Scale */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-400: #9ca3af;
--gray-500: #6b7280;
--gray-600: #4b5563;
--gray-700: #374151;
--gray-800: #1f2937;
--gray-900: #111827;
```

### Dark Mode Colors
```css
/* Dark Mode Overrides */
--dark-bg-primary: #0f0f0f;
--dark-bg-secondary: #1a1a1a;
--dark-bg-tertiary: #2a2a2a;
--dark-text-primary: #ffffff;
--dark-text-secondary: #e5e7eb;
--dark-text-tertiary: #9ca3af;
--dark-border: #374151;
```

## Typography

### Font Family
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### Font Weights
```css
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Font Sizes
```css
/* Heading Scale */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
```

### Line Heights
```css
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

### Typography Scale
| Element | Size | Weight | Line Height | Usage |
|---------|------|--------|-------------|-------|
| H1 | `text-3xl` | `font-bold` | `leading-tight` | Page titles |
| H2 | `text-2xl` | `font-semibold` | `leading-tight` | Section headers |
| H3 | `text-xl` | `font-semibold` | `leading-normal` | Subsection headers |
| H4 | `text-lg` | `font-medium` | `leading-normal` | Card titles |
| Body | `text-base` | `font-normal` | `leading-normal` | Main content |
| Small | `text-sm` | `font-normal` | `leading-normal` | Captions, metadata |
| Caption | `text-xs` | `font-normal` | `leading-normal` | Labels, timestamps |

## Spacing System

### Spacing Scale
```css
--space-xs: 0.25rem;   /* 4px */
--space-sm: 0.5rem;    /* 8px */
--space-md: 1rem;      /* 16px */
--space-lg: 1.5rem;    /* 24px */
--space-xl: 2rem;      /* 32px */
--space-2xl: 3rem;     /* 48px */
--space-3xl: 4rem;     /* 64px */
```

### Container Max Widths
```css
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
--container-2xl: 1536px;
```

### Common Spacing Patterns
```css
/* Page Layout */
.page-padding: 1rem;           /* 16px */
.page-max-width: 1280px;       /* xl container */

/* Card Spacing */
.card-padding: 1.5rem;         /* 24px */
.card-gap: 1.5rem;             /* 24px */

/* Form Spacing */
.form-field-gap: 1rem;         /* 16px */
.form-section-gap: 2rem;       /* 32px */

/* Navigation */
.nav-item-gap: 1rem;           /* 16px */
.nav-section-gap: 2rem;        /* 32px */
```

## Component Standards

### Buttons

#### Primary Button
```tsx
<Button variant="default" size="md">
  Primary Action
</Button>
```

#### Secondary Button
```tsx
<Button variant="outline" size="md">
  Secondary Action
</Button>
```

#### Destructive Button
```tsx
<Button variant="destructive" size="md">
  Delete
</Button>
```

#### Button Sizes
- `sm`: 32px height, 12px padding
- `md`: 40px height, 16px padding (default)
- `lg`: 48px height, 20px padding

### Cards

#### Default Card
```tsx
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    Card content here
  </CardContent>
</Card>
```

#### Elevated Card
```tsx
<Card variant="elevated">
  <CardContent>
    Elevated content
  </CardContent>
</Card>
```

### Form Fields

#### Input Field
```tsx
<div className="space-y-2">
  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
    Field Label
  </label>
  <Input 
    type="text" 
    placeholder="Enter value"
    className="w-full"
  />
  <p className="text-xs text-gray-500">
    Help text
  </p>
</div>
```

#### Form Field with Error
```tsx
<div className="space-y-2">
  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
    Field Label
  </label>
  <Input 
    type="text" 
    className="w-full border-red-300 focus:border-red-500"
  />
  <p className="text-xs text-red-600">
    Error message
  </p>
</div>
```

### Badges

#### Status Badges
```tsx
<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Error</Badge>
<Badge className="bg-green-100 text-green-800">Success</Badge>
<Badge className="bg-blue-100 text-blue-800">Info</Badge>
```

## Layout Patterns

### Page Layout
```tsx
<div className="container mx-auto px-4 py-8 max-w-4xl">
  <div className="mb-8">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
      Page Title
    </h1>
    <p className="text-gray-600 dark:text-gray-400">
      Page description
    </p>
  </div>
  
  <div className="space-y-6">
    {/* Page content */}
  </div>
</div>
```

### Grid Layout
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Grid items */}
</div>
```

### Sidebar Layout
```tsx
<div className="flex">
  <aside className="w-64 bg-gray-50 dark:bg-gray-800 p-6">
    {/* Sidebar content */}
  </aside>
  <main className="flex-1 p-6">
    {/* Main content */}
  </main>
</div>
```

## Responsive Design

### Breakpoints
```css
/* Mobile First */
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1536px;
```

### Responsive Patterns
```tsx
// Responsive text
<h1 className="text-2xl md:text-3xl lg:text-4xl">

// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// Responsive spacing
<div className="p-4 md:p-6 lg:p-8">

// Responsive navigation
<div className="hidden lg:flex">
```

## Animation & Transitions

### Transition Durations
```css
--transition-fast: 150ms;
--transition-normal: 200ms;
--transition-slow: 300ms;
```

### Common Transitions
```css
/* Hover effects */
.hover-transition {
  transition: all 200ms ease-in-out;
}

/* Focus states */
.focus-transition {
  transition: border-color 150ms ease-in-out;
}

/* Loading states */
.loading-transition {
  transition: opacity 200ms ease-in-out;
}
```

## Accessibility

### Focus States
```css
/* Default focus ring */
.focus-ring {
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
}

/* Custom focus for dark mode */
.focus-ring-dark {
  @apply focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900;
}
```

### Color Contrast
- Minimum contrast ratio: 4.5:1 for normal text
- Minimum contrast ratio: 3:1 for large text
- Use semantic colors for status indicators

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Logical tab order
- Skip links for main content
- ARIA labels for screen readers

## Icon System

### Icon Sizes
```css
--icon-xs: 12px;
--icon-sm: 16px;
--icon-md: 20px;
--icon-lg: 24px;
--icon-xl: 32px;
```

### Icon Usage
```tsx
// Using Lucide React icons
import { Plus, Settings, User } from 'lucide-react';

<Plus className="w-4 h-4" />
<Settings className="w-5 h-5" />
<User className="w-6 h-6" />
```

## Best Practices

### Do's
- ✅ Use consistent spacing and typography
- ✅ Follow the color system
- ✅ Implement responsive design
- ✅ Include proper focus states
- ✅ Use semantic HTML
- ✅ Test with screen readers

### Don'ts
- ❌ Don't use arbitrary colors
- ❌ Don't skip responsive design
- ❌ Don't ignore accessibility
- ❌ Don't use inconsistent spacing
- ❌ Don't override component styles unnecessarily

## Implementation Notes

### Tailwind CSS Classes
This style guide is implemented using Tailwind CSS. Custom properties and components are defined in the Tailwind config.

### Component Library
All components should follow these patterns and be documented in Storybook (when implemented).

### Dark Mode
All components should support dark mode using the `dark:` prefix in Tailwind classes.

## Applied Standards (Batch 27)

### ✅ Completed Components

#### Button Variants
- **Primary**: `variant="default"` - Red background with white text
- **Secondary**: `variant="outline"` - White background with border
- **Danger**: `variant="destructive"` - Red background for destructive actions
- **Ghost**: `variant="ghost"` - Transparent with hover background
- **Link**: `variant="link"` - Text link with underline

#### Card Components
- **Default**: Standard card with header and content
- **Elevated**: Cards with shadow for emphasis
- **Responsive**: Grid layouts that adapt to screen size

#### Form Components
- **Input Fields**: Consistent styling with focus states
- **Labels**: Proper spacing and typography
- **Error States**: Red borders and error messages
- **Success States**: Green styling for positive feedback

#### Navigation
- **Sticky Navbar**: Fixed positioning with proper z-index
- **Mobile Menu**: Hamburger menu with dropdown sections
- **Dropdown Menus**: Hover-based dropdowns for Admin and Settings
- **Responsive**: Mobile-first approach with proper breakpoints

#### Dark Mode Support
- **Dashboard**: Full dark mode support
- **Admin Panel**: Consistent dark theme
- **Developer Portal**: Dark mode compatible
- **Settings Page**: Dark mode styling applied

### 📱 Responsive Design

#### Breakpoints Applied
- **Mobile**: ≤640px - Hamburger menu, stacked layouts
- **Tablet**: 641–1024px - Side-by-side layouts
- **Desktop**: >1024px - Full navigation, multi-column layouts

#### Mobile Optimizations
- **Dashboard**: Responsive grid layouts
- **Admin Panel**: Scrollable tables, stacked cards
- **Developer Portal**: Mobile-friendly code blocks
- **Settings**: Form fields stack vertically

### 🎨 Design Consistency

#### Color Usage
- **Primary**: `rhythmRed` (#dc2626) for main actions
- **Success**: Green variants for positive states
- **Warning**: Yellow variants for caution states
- **Error**: Red variants for error states
- **Info**: Blue variants for informational content

#### Typography
- **Headings**: Consistent font weights and sizes
- **Body Text**: Proper line heights and spacing
- **Code**: Monospace font for technical content
- **Labels**: Small, muted text for metadata

#### Spacing
- **Cards**: Consistent padding (1.5rem)
- **Forms**: Proper field spacing (1rem)
- **Sections**: Adequate vertical spacing (1.5rem)
- **Buttons**: Proper padding and margins

### 🚀 Performance Optimizations

#### Loading States
- **Skeleton Loading**: Placeholder content while loading
- **Progressive Loading**: Load critical content first
- **Error Boundaries**: Graceful error handling

#### Accessibility
- **Focus States**: Visible focus indicators
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper ARIA labels
- **Color Contrast**: WCAG compliant contrast ratios

---

*This style guide is a living document and will be updated as the design system evolves.* 