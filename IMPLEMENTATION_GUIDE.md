# PlanHaus Refactoring Implementation Guide

## Immediate Actions (Week 1)

### 1. Set up Monorepo Structure

First, create the new monorepo structure:

```bash
# Create new monorepo directory
mkdir planhaus-refactored
cd planhaus-refactored

# Initialize with Turborepo
npx create-turbo@latest . --use-npm

# Install additional dependencies
npm install -D @types/node typescript @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

### 2. Create Package Structure

```bash
# Create package directories
mkdir -p packages/ui packages/database packages/auth packages/utils
mkdir -p apps/web apps/api
```

### 3. Set up Next.js App

```bash
# Create Next.js app
cd apps/web
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

## Phase 1: Component Migration

### 1. Migrate UI Components

Create the shared UI package:

```typescript
// packages/ui/package.json
{
  "name": "@planhaus/ui",
  "version": "0.0.0",
  "private": true,
  "exports": {
    "./components": "./components/index.ts",
    "./styles": "./styles/index.css"
  },
  "scripts": {
    "lint": "eslint . --max-warnings 0",
    "generate:component": "turbo gen react-component"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  },
  "peerDependencies": {
    "react": "^18.2.0"
  }
}
```

Migrate your existing Button component:

```typescript
// packages/ui/components/button/button.tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "underline-offset-4 hover:underline text-primary",
        // Add your custom variants
        wedding: "bg-blush text-white hover:bg-blush/90",
        elegant: "bg-rose-gold text-white hover:bg-rose-gold/90",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

### 2. Migrate Feature Components

Create feature-based components for your budget functionality:

```typescript
// apps/web/components/features/budget/budget-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@planhaus/ui"
import { Button } from "@planhaus/ui"
import { BudgetItem } from "@/types/budget"
import { formatCurrency } from "@/lib/utils"

interface BudgetCardProps {
  item: BudgetItem
  onEdit: (item: BudgetItem) => void
  onDelete: (id: string) => void
}

export function BudgetCard({ item, onEdit, onDelete }: BudgetCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{item.name}</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(item)}
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(item.id)}
            >
              Delete
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Amount:</span>
            <span className="font-semibold">{formatCurrency(item.amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Category:</span>
            <span className="capitalize">{item.category}</span>
          </div>
          {item.isPaid && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-sm text-green-600">Paid</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
```

### 3. Create Custom Hooks

```typescript
// apps/web/hooks/use-budget.ts
import { useState, useEffect } from "react"
import { BudgetItem } from "@/types/budget"

interface UseBudgetReturn {
  items: BudgetItem[]
  isLoading: boolean
  error: string | null
  addItem: (item: Omit<BudgetItem, "id" | "createdAt" | "updatedAt">) => Promise<void>
  updateItem: (id: string, updates: Partial<BudgetItem>) => Promise<void>
  deleteItem: (id: string) => Promise<void>
  refetch: () => Promise<void>
}

export function useBudget(): UseBudgetReturn {
  const [items, setItems] = useState<BudgetItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchItems = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch("/api/budget")
      if (!response.ok) {
        throw new Error("Failed to fetch budget items")
      }
      const data = await response.json()
      setItems(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const addItem = async (item: Omit<BudgetItem, "id" | "createdAt" | "updatedAt">) => {
    try {
      const response = await fetch("/api/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      })
      if (!response.ok) {
        throw new Error("Failed to add budget item")
      }
      await fetchItems()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add item")
    }
  }

  const updateItem = async (id: string, updates: Partial<BudgetItem>) => {
    try {
      const response = await fetch(`/api/budget/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
      if (!response.ok) {
        throw new Error("Failed to update budget item")
      }
      await fetchItems()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update item")
    }
  }

  const deleteItem = async (id: string) => {
    try {
      const response = await fetch(`/api/budget/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error("Failed to delete budget item")
      }
      await fetchItems()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete item")
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  return {
    items,
    isLoading,
    error,
    addItem,
    updateItem,
    deleteItem,
    refetch: fetchItems,
  }
}
```

## Phase 2: API Migration

### 1. Create Next.js API Routes

```typescript
// apps/web/app/api/budget/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { budgetItems } from "@planhaus/database"
import { eq } from "drizzle-orm"
import { budgetItemSchema } from "@/lib/validations"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const items = await db
      .select()
      .from(budgetItems)
      .where(eq(budgetItems.userId, session.user.id))
      .orderBy(budgetItems.createdAt)

    return NextResponse.json(items)
  } catch (error) {
    console.error("Error fetching budget items:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = budgetItemSchema.parse(body)

    const newItem = await db
      .insert(budgetItems)
      .values({
        ...validatedData,
        userId: session.user.id,
      })
      .returning()

    return NextResponse.json(newItem[0], { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.message },
        { status: 400 }
      )
    }

    console.error("Error creating budget item:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
```

### 2. Create Dynamic API Routes

```typescript
// apps/web/app/api/budget/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { budgetItems } from "@planhaus/database"
import { eq, and } from "drizzle-orm"
import { budgetItemUpdateSchema } from "@/lib/validations"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const item = await db
      .select()
      .from(budgetItems)
      .where(
        and(
          eq(budgetItems.id, params.id),
          eq(budgetItems.userId, session.user.id)
        )
      )
      .limit(1)

    if (!item[0]) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    return NextResponse.json(item[0])
  } catch (error) {
    console.error("Error fetching budget item:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = budgetItemUpdateSchema.parse(body)

    const updatedItem = await db
      .update(budgetItems)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(budgetItems.id, params.id),
          eq(budgetItems.userId, session.user.id)
        )
      )
      .returning()

    if (!updatedItem[0]) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    return NextResponse.json(updatedItem[0])
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.message },
        { status: 400 }
      )
    }

    console.error("Error updating budget item:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const deletedItem = await db
      .delete(budgetItems)
      .where(
        and(
          eq(budgetItems.id, params.id),
          eq(budgetItems.userId, session.user.id)
        )
      )
      .returning()

    if (!deletedItem[0]) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Item deleted successfully" })
  } catch (error) {
    console.error("Error deleting budget item:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
```

## Phase 3: Database Schema

### 1. Create Database Package

```typescript
// packages/database/schema/budget.ts
import { pgTable, text, timestamp, uuid, numeric, boolean } from "drizzle-orm/pg-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import { z } from "zod"

export const budgetItems = pgTable("budget_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  name: text("name").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  description: text("description"),
  isPaid: boolean("is_paid").default(false),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export const insertBudgetItemSchema = createInsertSchema(budgetItems)
export const selectBudgetItemSchema = createSelectSchema(budgetItems)

export type BudgetItem = z.infer<typeof selectBudgetItemSchema>
export type NewBudgetItem = z.infer<typeof insertBudgetItemSchema>
```

### 2. Create Validations

```typescript
// apps/web/lib/validations.ts
import { z } from "zod"

export const budgetItemSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  amount: z.number().positive("Amount must be positive"),
  category: z.enum(["venue", "catering", "photography", "music", "decor", "other"]),
  description: z.string().optional(),
  isPaid: z.boolean().default(false),
  dueDate: z.date().optional(),
})

export const budgetItemUpdateSchema = budgetItemSchema.partial()

export type BudgetItemInput = z.infer<typeof budgetItemSchema>
export type BudgetItemUpdate = z.infer<typeof budgetItemUpdateSchema>
```

## Phase 4: Page Migration

### 1. Create App Router Pages

```typescript
// apps/web/app/(dashboard)/budget/page.tsx
import { Suspense } from "react"
import { BudgetPage } from "@/components/features/budget/budget-page"
import { BudgetPageSkeleton } from "@/components/features/budget/budget-page-skeleton"

export default function BudgetPageRoute() {
  return (
    <Suspense fallback={<BudgetPageSkeleton />}>
      <BudgetPage />
    </Suspense>
  )
}
```

### 2. Create Feature Components

```typescript
// apps/web/components/features/budget/budget-page.tsx
"use client"

import { useBudget } from "@/hooks/use-budget"
import { BudgetCard } from "./budget-card"
import { BudgetForm } from "./budget-form"
import { Button } from "@planhaus/ui"
import { Plus } from "lucide-react"
import { useState } from "react"

export function BudgetPage() {
  const { items, isLoading, error, addItem, updateItem, deleteItem } = useBudget()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null)

  const handleEdit = (item: BudgetItem) => {
    setEditingItem(item)
    setIsFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      await deleteItem(id)
    }
  }

  const handleFormSubmit = async (data: BudgetItemInput) => {
    if (editingItem) {
      await updateItem(editingItem.id, data)
    } else {
      await addItem(data)
    }
    setIsFormOpen(false)
    setEditingItem(null)
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Budget Management</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <BudgetCard
            key={item.id}
            item={item}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {isFormOpen && (
        <BudgetForm
          item={editingItem}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsFormOpen(false)
            setEditingItem(null)
          }}
        />
      )}
    </div>
  )
}
```

## Phase 5: Authentication Setup

### 1. Set up NextAuth.js

```typescript
// apps/web/lib/auth.ts
import { NextAuthOptions } from "next-auth"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "@/lib/db"
import { users } from "@planhaus/database"
import { eq } from "drizzle-orm"
import bcrypt from "bcrypt"

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }
        
        const user = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email))
          .limit(1)
        
        if (!user[0]) {
          return null
        }
        
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user[0].password
        )
        
        if (!isPasswordValid) {
          return null
        }
        
        return {
          id: user[0].id,
          email: user[0].email,
          name: user[0].name,
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
      }
      return session
    }
  }
}
```

## Migration Steps

### Step 1: Set up the new structure
```bash
# Create new monorepo
mkdir planhaus-refactored
cd planhaus-refactored

# Initialize with Turborepo
npx create-turbo@latest . --use-npm

# Create package structure
mkdir -p packages/ui packages/database packages/auth packages/utils
mkdir -p apps/web apps/api
```

### Step 2: Migrate components one by one
1. Start with UI components (Button, Card, Input)
2. Move to feature components (BudgetCard, GuestCard)
3. Create custom hooks for data fetching
4. Set up API routes

### Step 3: Test thoroughly
1. Unit tests for components
2. Integration tests for API routes
3. E2E tests for critical user flows

### Step 4: Deploy incrementally
1. Deploy new structure alongside existing app
2. Migrate users gradually
3. Monitor for issues
4. Switch over completely once stable

This implementation guide provides a practical path to refactor your current Express + Vite application into a modern Next.js application with proper TypeScript support, testing, and best practices. 