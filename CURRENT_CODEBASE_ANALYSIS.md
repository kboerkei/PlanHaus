# PlanHaus Current Codebase Analysis

## Current Architecture Issues

### 1. **Mixed Technology Stack**
- **Frontend**: React + Vite (client-side routing with wouter)
- **Backend**: Express.js with TypeScript
- **Database**: SQLite with Drizzle ORM
- **State Management**: Multiple approaches (React Query, local state, Zustand)

### 2. **File Organization Problems**

#### Current Structure Issues:
```
client/src/
├── components/           # 100+ components scattered
│   ├── ui/              # UI components mixed with feature components
│   ├── layout/          # Layout components
│   ├── budget/          # Feature-specific components
│   ├── guests/          # Feature-specific components
│   └── dashboard/       # Feature-specific components
├── pages/               # Page components
├── hooks/               # Custom hooks
├── lib/                 # Utilities
├── types/               # TypeScript types
└── styles/              # CSS files
```

**Problems:**
- Components are scattered across multiple directories
- No clear separation between UI and feature components
- Inconsistent naming conventions
- Mixed import patterns

#### Server Structure Issues:
```
server/
├── routes/              # All routes in single files
├── middleware/          # Middleware scattered
├── services/            # Business logic mixed with routes
├── storage.ts           # 1657 lines - monolithic file
└── storage-memory.ts    # 446 lines - duplicate logic
```

**Problems:**
- Monolithic route files
- Business logic mixed with HTTP handling
- No clear API versioning
- Inconsistent error handling

## Immediate Refactoring Actions

### Phase 1: Clean Up Current Structure (Week 1)

#### 1.1 Reorganize Client Components

**Current Problem:**
```typescript
// Mixed imports across files
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/design-system"
import { Card } from "@/components/design-system"
```

**Solution: Create unified component exports**

```typescript
// client/src/components/index.ts
// Unified exports for all components
export { Button, Card, Input } from "./ui"
export { BudgetCard, GuestCard } from "./features"
export { Sidebar, Header, Footer } from "./layout"
```

#### 1.2 Fix Import Inconsistencies

**Current Issues Found:**
- `focus:ring-blush` CSS class doesn't exist
- Mixed design system usage
- Inconsistent component variants

**Immediate Fixes:**

1. **Fix CSS Class Issues:**
```css
/* client/src/styles/enhanced.css */
/* Add missing focus ring utilities */
.focus-ring-blush {
  outline: none;
}
.focus-ring-blush:focus {
  outline: none;
  box-shadow: 0 0 0 2px hsl(var(--blush)), 0 0 0 4px hsl(var(--background));
}
```

2. **Standardize Component Usage:**
```typescript
// client/src/components/design-system/index.ts
// Create unified design system exports
export { Button } from './Button'
export { Card, CardHeader, CardContent, CardTitle } from './Card'
export { Input } from '../ui/input'
```

#### 1.3 Clean Up Server Structure

**Current Problem:**
```typescript
// server/routes.ts - 630 lines of mixed routes
router.get("/api/projects/:id/budget", enhancedRequireAuth, async (req, res) => {
  // Budget logic mixed with HTTP handling
})

router.get("/api/projects/:id/guests", enhancedRequireAuth, async (req, res) => {
  // Guest logic mixed with HTTP handling
})
```

**Solution: Split into feature-based routes**

```typescript
// server/routes/budget.ts
import { Router } from "express"
import { enhancedRequireAuth } from "../middleware/auth"
import { BudgetService } from "../services/budget"

const router = Router()

router.get("/:projectId", enhancedRequireAuth, async (req, res) => {
  try {
    const budgetService = new BudgetService()
    const items = await budgetService.getBudgetItems(req.params.projectId, req.user.id)
    res.json(items)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch budget items" })
  }
})

export default router
```

### Phase 2: Implement Proper Type Safety (Week 2)

#### 2.1 Create Strict Type Definitions

**Current Problem:**
```typescript
// Inconsistent type usage
interface BudgetItem {
  id: string
  name: string
  amount: number
  // Missing proper types
}

// vs

type BudgetItem = {
  id: string
  name: string
  amount: number
  category: string // Should be enum
  isPaid?: boolean // Inconsistent optional usage
}
```

**Solution: Create proper type definitions**

```typescript
// client/src/types/budget.ts
export enum BudgetCategory {
  VENUE = "venue",
  CATERING = "catering",
  PHOTOGRAPHY = "photography",
  MUSIC = "music",
  DECOR = "decor",
  OTHER = "other"
}

export interface BudgetItem {
  id: string
  name: string
  amount: number
  category: BudgetCategory
  description?: string
  isPaid: boolean
  dueDate?: Date
  createdAt: Date
  updatedAt: Date
}

export type NewBudgetItem = Omit<BudgetItem, "id" | "createdAt" | "updatedAt">
export type BudgetItemUpdate = Partial<NewBudgetItem>
```

#### 2.2 Implement Proper Error Handling

**Current Problem:**
```typescript
// Inconsistent error handling
try {
  const data = await fetch("/api/budget")
  return data.json()
} catch (error) {
  console.error(error) // No proper error handling
}
```

**Solution: Create error handling utilities**

```typescript
// client/src/lib/errors.ts
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message)
    this.name = "APIError"
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string
  ) {
    super(message)
    this.name = "ValidationError"
  }
}

// client/src/lib/api.ts
export async function apiRequest<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new APIError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status
      )
    }

    return await response.json()
  } catch (error) {
    if (error instanceof APIError) {
      throw error
    }
    throw new APIError("Network error", 0)
  }
}
```

### Phase 3: Implement State Management Best Practices (Week 3)

#### 3.1 Create Custom Hooks for Data Fetching

**Current Problem:**
```typescript
// Inconsistent data fetching across components
const [budgetItems, setBudgetItems] = useState([])
const [loading, setLoading] = useState(false)

useEffect(() => {
  fetchBudgetItems()
}, [])

// Duplicated in multiple components
```

**Solution: Create reusable hooks**

```typescript
// client/src/hooks/use-budget.ts
import { useState, useEffect } from "react"
import { BudgetItem, NewBudgetItem } from "@/types/budget"
import { apiRequest } from "@/lib/api"

export function useBudget() {
  const [items, setItems] = useState<BudgetItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchItems = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiRequest<BudgetItem[]>("/api/budget")
      setItems(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch items")
    } finally {
      setLoading(false)
    }
  }

  const addItem = async (item: NewBudgetItem) => {
    try {
      const newItem = await apiRequest<BudgetItem>("/api/budget", {
        method: "POST",
        body: JSON.stringify(item),
      })
      setItems(prev => [...prev, newItem])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add item")
      throw err
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  return {
    items,
    loading,
    error,
    addItem,
    refetch: fetchItems,
  }
}
```

#### 3.2 Implement Proper Form Handling

**Current Problem:**
```typescript
// Inconsistent form handling
const [formData, setFormData] = useState({})
const handleSubmit = (e) => {
  e.preventDefault()
  // Manual form handling
}
```

**Solution: Use React Hook Form with validation**

```typescript
// client/src/components/forms/budget-form.tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { budgetItemSchema, type BudgetItemInput } from "@/lib/validations"

interface BudgetFormProps {
  onSubmit: (data: BudgetItemInput) => Promise<void>
  initialData?: Partial<BudgetItemInput>
}

export function BudgetForm({ onSubmit, initialData }: BudgetFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<BudgetItemInput>({
    resolver: zodResolver(budgetItemSchema),
    defaultValues: initialData,
  })

  const onSubmitHandler = async (data: BudgetItemInput) => {
    try {
      await onSubmit(data)
      reset()
    } catch (error) {
      // Error handling
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmitHandler)}>
      <Input
        {...register("name")}
        error={errors.name?.message}
        placeholder="Item name"
      />
      <Input
        {...register("amount", { valueAsNumber: true })}
        type="number"
        error={errors.amount?.message}
        placeholder="Amount"
      />
      <Select {...register("category")} error={errors.category?.message}>
        {Object.values(BudgetCategory).map(category => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </Select>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save Item"}
      </Button>
    </form>
  )
}
```

### Phase 4: Implement Testing Strategy (Week 4)

#### 4.1 Set up Component Testing

```typescript
// client/src/components/__tests__/budget-card.test.tsx
import { render, screen, fireEvent } from "@testing-library/react"
import { BudgetCard } from "../features/budget/budget-card"

const mockItem = {
  id: "1",
  name: "Venue",
  amount: 5000,
  category: "venue" as const,
  isPaid: false,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe("BudgetCard", () => {
  it("renders budget item correctly", () => {
    const onEdit = jest.fn()
    const onDelete = jest.fn()

    render(
      <BudgetCard
        item={mockItem}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    )

    expect(screen.getByText("Venue")).toBeInTheDocument()
    expect(screen.getByText("$5,000")).toBeInTheDocument()
  })

  it("calls onEdit when edit button is clicked", () => {
    const onEdit = jest.fn()
    const onDelete = jest.fn()

    render(
      <BudgetCard
        item={mockItem}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    )

    fireEvent.click(screen.getByText("Edit"))
    expect(onEdit).toHaveBeenCalledWith(mockItem)
  })
})
```

#### 4.2 Set up API Testing

```typescript
// server/__tests__/budget.test.ts
import request from "supertest"
import { app } from "../index"
import { db } from "../lib/db"

describe("Budget API", () => {
  beforeEach(async () => {
    // Clean up database
    await db.delete(budgetItems)
  })

  it("should create a new budget item", async () => {
    const response = await request(app)
      .post("/api/budget")
      .send({
        name: "Venue",
        amount: 5000,
        category: "venue",
      })
      .expect(201)

    expect(response.body).toHaveProperty("id")
    expect(response.body.name).toBe("Venue")
  })

  it("should return 400 for invalid data", async () => {
    await request(app)
      .post("/api/budget")
      .send({
        name: "", // Invalid: empty name
        amount: -100, // Invalid: negative amount
      })
      .expect(400)
  })
})
```

## Immediate Action Items

### Week 1: Foundation
- [ ] Fix CSS class issues (`focus:ring-blush`)
- [ ] Create unified component exports
- [ ] Standardize import patterns
- [ ] Split monolithic route files

### Week 2: Type Safety
- [ ] Create proper TypeScript interfaces
- [ ] Implement Zod validation schemas
- [ ] Add proper error handling
- [ ] Create API request utilities

### Week 3: State Management
- [ ] Create custom hooks for data fetching
- [ ] Implement React Hook Form
- [ ] Add proper loading states
- [ ] Create error boundaries

### Week 4: Testing
- [ ] Set up Vitest for testing
- [ ] Create component tests
- [ ] Add API integration tests
- [ ] Set up E2E testing with Playwright

## Long-term Migration Path

### Phase 5: Next.js Migration (Weeks 5-8)
1. Set up Next.js 14+ with App Router
2. Migrate components to new structure
3. Convert Express routes to Next.js API routes
4. Implement proper authentication with NextAuth.js

### Phase 6: Database Optimization (Weeks 9-10)
1. Migrate from SQLite to PostgreSQL
2. Implement proper database migrations
3. Add database seeding
4. Optimize queries

### Phase 7: Performance & Monitoring (Weeks 11-12)
1. Implement proper caching
2. Add performance monitoring
3. Set up error tracking
4. Add analytics

This analysis provides a clear roadmap for refactoring your current codebase while maintaining functionality and improving maintainability. 