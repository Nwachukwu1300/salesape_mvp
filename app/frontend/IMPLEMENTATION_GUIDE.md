# SalesApe.ai Frontend - Implementation Guide

## 🎯 Recent Enhancements

This guide documents the latest improvements to the SalesApe.ai frontend platform.

---

## 📦 **New Dependencies**

### Animation
- **framer-motion** `^12.33.0` - Production-ready animation library for React

### Form Management
- **react-hook-form** `^7.71.1` - Performant, flexible forms with easy validation
- **@hookform/resolvers** `^5.2.2` - Validation resolvers for react-hook-form
- **zod** `^4.3.6` - TypeScript-first schema validation

### Testing
- **vitest** `^4.0.18` - Fast unit test framework
- **@testing-library/react** `^16.3.2` - React testing utilities
- **@testing-library/jest-dom** `^6.9.1` - Custom Jest matchers
- **@testing-library/user-event** `^14.6.1` - User interaction simulation
- **jsdom** `^28.0.0` - DOM implementation for Node.js

### Documentation
- **@storybook/react** - Component documentation
- **@storybook/react** - Storybook integration for React + Vite
- **storybook** - Interactive component explorer

---

## 🎨 **Animation System**

### Animated Logo

The Logo component now supports entrance animations and hover effects:

```tsx
import { Logo } from '@/components/Logo';

// With animation (default)
<Logo variant="full" size="lg" animate={true} />

// Without animation
<Logo variant="icon" size="md" animate={false} />
```

**Features:**
- Spring-based entrance animation
- Scale and position transitions
- Hover and tap effects
- Configurable animation states

### Animated Cards

Use `AnimatedCard` for cards with hover effects:

```tsx
import { AnimatedCard } from '@/components/ui/animated-card';

<AnimatedCard className="p-6">
  <h3>Card Title</h3>
  <p>Card content with smooth hover effects</p>
</AnimatedCard>
```

**Props:**
- `hoverScale` - Scale factor on hover (default: 1.02)
- `hoverY` - Y-axis translation on hover (default: -4)
- Supports all standard Card props

### Page Transitions

Wrap pages with `PageTransition` for smooth navigation:

```tsx
import { PageTransition } from '@/components/ui/page-transition';

export default function MyPage() {
  return (
    <PageTransition>
      <div>Page content</div>
    </PageTransition>
  );
}
```

---

## 📝 **Form Validation**

### Validation Schemas

Located in `lib/validations/`:

#### Auth Validation (`auth.ts`)

```tsx
import { loginSchema, registerSchema } from '@/lib/validations/auth';

// Login schema validates:
// - Email format
// - Required fields

// Register schema validates:
// - Name length (2-50 characters)
// - Email format
// - Password requirements:
//   * Minimum 8 characters
//   * At least one uppercase letter
//   * At least one lowercase letter
//   * At least one number
```

#### Onboarding Validation (`onboarding.ts`)

```tsx
import { onboardingSchema } from '@/lib/validations/onboarding';

// Validates:
// - URL format (http:// or https://)
// - Business name (2-100 characters)
// - Description (optional, max 500 characters)
// - Branding options
```

### Using react-hook-form

The AuthForm component demonstrates the pattern:

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const form = useForm<FormData>({
  resolver: zodResolver(validationSchema),
  defaultValues: { /* ... */ },
});

const onSubmit = async (data: FormData) => {
  // Form is already validated
  // Handle submission
};

return (
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <Input {...form.register('email')} />
    {form.formState.errors.email && (
      <p className="text-destructive">
        {form.formState.errors.email.message}
      </p>
    )}
  </form>
);
```

**Benefits:**
- Real-time field validation
- Type-safe form data
- Built-in error messages
- Better UX with immediate feedback
- Reduced server-side validation failures

---

## 🧪 **Testing**

### Running Tests

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Test Files

Tests are colocated with components in `__tests__/` directories:

```
components/
├── Logo.tsx
└── __tests__/
    └── Logo.test.tsx

lib/
└── validations/
    ├── auth.ts
    └── __tests__/
        └── auth.test.ts
```

### Writing Tests

**Component Test Example:**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    const element = screen.getByText('Expected Text');
    expect(element).toBeInTheDocument();
  });
});
```

**Validation Test Example:**

```tsx
import { describe, it, expect } from 'vitest';
import { mySchema } from '../validations';

describe('mySchema', () => {
  it('validates correct data', () => {
    const validData = { /* ... */ };
    expect(() => mySchema.parse(validData)).not.toThrow();
  });

  it('rejects invalid data', () => {
    const invalidData = { /* ... */ };
    expect(() => mySchema.parse(invalidData)).toThrow();
  });
});
```

---

## 📚 **Storybook Documentation**

### Running Storybook

```bash
npm run storybook
```

Storybook will be available at `http://localhost:6006`

### Creating Stories

Stories are colocated with components:

```tsx
// components/MyComponent.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { MyComponent } from './MyComponent';

const meta = {
  title: 'Components/MyComponent',
  component: MyComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MyComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Component props
  },
};

export const Variant: Story = {
  args: {
    variant: 'alternate',
  },
};
```

### Design Tokens Documentation

Design tokens are documented in `stories/DesignTokens.mdx`:
- Brand colors
- Typography
- Spacing
- Border radius
- Shadows
- Transitions

---

## 🎨 **Design System**

### Theme Tokens

All design tokens are defined in `app/globals.css`:

```css
:root {
  --primary: oklch(0.6 0.3 320);  /* Brand magenta */
  --brand-magenta: oklch(0.6 0.3 320);
  --brand-magenta-light: oklch(0.7 0.28 320);
  --brand-magenta-dark: oklch(0.5 0.32 320);
  /* ... */
}
```

### Using Tokens in Code

**Tailwind Classes:**
```tsx
<div className="bg-primary text-primary-foreground">
  Primary color background
</div>

<Button className="bg-brand-magenta hover:bg-brand-magenta-dark">
  Brand button
</Button>
```

**CSS Variables:**
```css
.custom-element {
  background: var(--brand-magenta);
  border-radius: var(--radius-lg);
}
```

---

## 🚀 **Best Practices**

### 1. **Component Organization**

```
components/
├── ui/                      # shadcn components
│   ├── button.tsx
│   ├── button.stories.tsx   # Storybook story
│   └── __tests__/
│       └── button.test.tsx  # Unit test
├── Logo.tsx                 # Custom components
├── Logo.stories.tsx
└── __tests__/
    └── Logo.test.tsx
```

### 2. **Form Handling**

Always use react-hook-form with zod validation:

```tsx
// ✅ Good
const form = useForm({
  resolver: zodResolver(schema),
});

// ❌ Avoid
const [value, setValue] = useState('');
const [error, setError] = useState('');
```

### 3. **Animation**

Use framer-motion for complex animations:

```tsx
// ✅ Good - Declarative animation
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>

// ❌ Avoid - CSS transitions for complex sequences
```

### 4. **Testing**

Write tests for:
- ✅ Component rendering
- ✅ User interactions
- ✅ Form validation
- ✅ Edge cases

```tsx
// Test user interactions
it('calls onSubmit when form is valid', async () => {
  const onSubmit = vi.fn();
  render(<Form onSubmit={onSubmit} />);
  
  await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
  await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
  
  expect(onSubmit).toHaveBeenCalled();
});
```

---

## 📊 **Performance Considerations**

### 1. **Animations**

- Animations respect `prefers-reduced-motion`
- Use GPU-accelerated properties (transform, opacity)
- Avoid animating layout properties (width, height, margin)

### 2. **Form Validation**

- Validation happens client-side first
- Reduces server load
- Immediate user feedback

### 3. **Code Splitting**

Components using framer-motion are code-split by the bundler and runtime configuration.

---

## 🔧 **Configuration Files**

### Vitest Config (`vitest.config.ts`)

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
});
```

### Storybook Config (`.storybook/main.ts`)

```ts
const config: StorybookConfig = {
  stories: [
    "../components/**/*.stories.@(js|jsx|ts|tsx)",
    "../stories/**/*.mdx"
  ],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
  ],
  framework: "@storybook/react",
};
```

---

## 📖 **Additional Resources**

- [Framer Motion Docs](https://www.framer.com/motion/)
- [React Hook Form Docs](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)
- [Vitest Guide](https://vitest.dev/guide/)
- [Storybook for React](https://storybook.js.org/docs/react/get-started/introduction)
- [shadcn/ui Documentation](https://ui.shadcn.com/)

---

## 🎯 **Quick Start Checklist**

- [ ] Run `npm install` to install dependencies
- [ ] Run `npm test` to verify tests pass
- [ ] Run `npm run storybook` to explore components
- [ ] Review `stories/DesignTokens.mdx` for design system
- [ ] Check `lib/validations/` for validation schemas
- [ ] Explore `components/__tests__/` for testing patterns

---

## 💡 **Tips**

1. **Use design tokens** - Never hardcode colors or spacing
2. **Validate early** - Use zod schemas for all user input
3. **Test interactions** - Don't just test rendering
4. **Document components** - Create Storybook stories
5. **Animate purposefully** - Only animate when it enhances UX
6. **Type everything** - Leverage TypeScript for better DX

---

**Last Updated:** February 2026
