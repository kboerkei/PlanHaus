# PlanHaus Codebase Refactoring Plan

## Current State Analysis

### Issues Identified

1. **Mixed Architecture**: Currently using Express + Vite instead of Next.js
2. **Monolithic Structure**: All routes in single files, no clear separation
3. **Inconsistent Naming**: Mixed naming conventions across components
4. **File Organization**: Components scattered across multiple directories
5. **Type Safety**: Inconsistent TypeScript usage
6. **State Management**: Multiple state management approaches
7. **API Structure**: No clear API versioning or structure
8. **Testing**: Limited test coverage and structure

## Recommended Architecture: Next.js 14+ with App Router

### 1. Project Structure

```
planhaus/
├── .github/                    # GitHub workflows
├── .husky/                     # Git hooks
├── apps/
│   ├── web/                    # Next.js frontend
│   └── api/                    # Express API (temporary, migrate to Next.js API routes)
├── packages/
│   ├── ui/                     # Shared UI components
│   ├── config/                 # Shared configuration
│   ├── database/               # Database schema and migrations
│   ├── auth/                   # Authentication utilities
│   └── utils/                  # Shared utilities
├── docs/                       # Documentation
├── scripts/                    # Build and deployment scripts
└── docker/                     # Docker configuration
```

### 2. Next.js App Structure (apps/web)

```
apps/web/
├── app/                        # App Router
│   ├── (auth)/                 # Auth group routes
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── (dashboard)/            # Dashboard group routes
│   │   ├── dashboard/
│   │   ├── budget/
│   │   ├── guests/
│   │   ├── vendors/
│   │   └── layout.tsx
│   ├── api/                    # API routes
│   │   ├── auth/
│   │   ├── projects/
│   │   ├── budget/
│   │   └── guests/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                     # Base UI components
│   ├── forms/                  # Form components
│   ├── layout/                 # Layout components
│   ├── features/               # Feature-specific components
│   │   ├── budget/
│   │   ├── guests/
│   │   └── vendors/
│   └── providers/              # Context providers
├── lib/
│   ├── auth.ts
│   ├── db.ts
│   ├── utils.ts
│   └── validations.ts
├── hooks/
│   ├── use-auth.ts
│   ├── use-projects.ts
│   └── use-budget.ts
├── types/
│   ├── auth.ts
│   ├── budget.ts
│   └── index.ts
└── styles/
    ├── globals.css
    └── components.css
```

### 3. Package Structure (packages/)

#### packages/ui/
```
packages/ui/
├── components/
│   ├── button/
│   ├── card/
│   ├── input/
│   └── index.ts
├── styles/
├── package.json
└── tsconfig.json
```

#### packages/database/
```
packages/database/
├── schema/
│   ├── users.ts
│   ├── projects.ts
│   ├── budget.ts
│   └── index.ts
├── migrations/
├── seed/
├── package.json
└── drizzle.config.ts
```

## Migration Strategy

### Phase 1: Foundation (Week 1-2)

1. **Set up monorepo structure**
   ```bash
   npm create @t3-app@latest planhaus --typescript --tailwind --eslint
   ```

2. **Migrate to Next.js 14+**
   - Install Next.js 14+ with App Router
   - Set up TypeScript configuration
   - Configure Tailwind CSS
   - Set up ESLint and Prettier

3. **Create shared packages**
   - UI component library
   - Database schema
   - Authentication utilities

### Phase 2: Component Migration (Week 3-4)

1. **Migrate UI components**
   ```typescript
   // packages/ui/components/button/button.tsx
   import { cva, type VariantProps } from "class-variance-authority"
   import { cn } from "@/lib/utils"
   
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
       VariantProps<typeof buttonVariants> {}
   
   const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
     ({ className, variant, size, ...props }, ref) => {
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

2. **Create feature-based components**
   ```typescript
   // apps/web/components/features/budget/budget-card.tsx
   import { Card, CardContent, CardHeader, CardTitle } from "@planhaus/ui"
   import { BudgetItem } from "@/types/budget"
   
   interface BudgetCardProps {
     item: BudgetItem
     onEdit: (item: BudgetItem) => void
     onDelete: (id: string) => void
   }
   
   export function BudgetCard({ item, onEdit, onDelete }: BudgetCardProps) {
     return (
       <Card>
         <CardHeader>
           <CardTitle>{item.name}</CardTitle>
         </CardHeader>
         <CardContent>
           {/* Budget item content */}
         </CardContent>
       </Card>
     )
   }
   ```

### Phase 3: API Migration (Week 5-6)

1. **Create Next.js API routes**
   ```typescript
   // apps/web/app/api/projects/route.ts
   import { NextRequest, NextResponse } from "next/server"
   import { getServerSession } from "next-auth"
   import { authOptions } from "@/lib/auth"
   import { db } from "@/lib/db"
   import { projects } from "@planhaus/database"
   
   export async function GET(request: NextRequest) {
     try {
       const session = await getServerSession(authOptions)
       
       if (!session?.user?.id) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
       }
       
       const userProjects = await db
         .select()
         .from(projects)
         .where(eq(projects.userId, session.user.id))
       
       return NextResponse.json(userProjects)
     } catch (error) {
       console.error("Error fetching projects:", error)
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
       const validatedData = projectSchema.parse(body)
       
       const newProject = await db
         .insert(projects)
         .values({
           ...validatedData,
           userId: session.user.id,
         })
         .returning()
       
       return NextResponse.json(newProject[0])
     } catch (error) {
       console.error("Error creating project:", error)
       return NextResponse.json(
         { error: "Internal server error" },
         { status: 500 }
       )
     }
   }
   ```

2. **Set up authentication with NextAuth.js**
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
     }
   }
   ```

### Phase 4: Database Migration (Week 7-8)

1. **Set up Drizzle ORM with proper schema**
   ```typescript
   // packages/database/schema/users.ts
   import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
   import { createInsertSchema, createSelectSchema } from "drizzle-zod"
   import { z } from "zod"
   
   export const users = pgTable("users", {
     id: uuid("id").primaryKey().defaultRandom(),
     email: text("email").notNull().unique(),
     name: text("name").notNull(),
     password: text("password").notNull(),
     createdAt: timestamp("created_at").defaultNow(),
     updatedAt: timestamp("updated_at").defaultNow(),
   })
   
   export const insertUserSchema = createInsertSchema(users)
   export const selectUserSchema = createSelectSchema(users)
   
   export type User = z.infer<typeof selectUserSchema>
   export type NewUser = z.infer<typeof insertUserSchema>
   ```

2. **Create database utilities**
   ```typescript
   // packages/database/index.ts
   import { drizzle } from "drizzle-orm/postgres-js"
   import postgres from "postgres"
   import * as schema from "./schema"
   
   const connectionString = process.env.DATABASE_URL!
   const client = postgres(connectionString)
   export const db = drizzle(client, { schema })
   ```

## Naming Conventions

### 1. Files and Directories
- **Components**: PascalCase (`BudgetCard.tsx`)
- **Hooks**: camelCase with `use` prefix (`useBudget.ts`)
- **Utilities**: camelCase (`formatCurrency.ts`)
- **Types**: PascalCase (`BudgetItem.ts`)
- **Constants**: UPPER_SNAKE_CASE (`API_ENDPOINTS.ts`)

### 2. Variables and Functions
- **Variables**: camelCase (`budgetItems`)
- **Functions**: camelCase (`getBudgetItems`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_BUDGET_AMOUNT`)
- **Types/Interfaces**: PascalCase (`BudgetItem`)

### 3. CSS Classes
- **Use Tailwind CSS utilities**
- **Custom classes**: kebab-case (`budget-card`)
- **Component-specific**: BEM-like (`budget-card__title`)

## Best Practices

### 1. TypeScript
```typescript
// Always use strict TypeScript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}

// Use proper type definitions
interface BudgetItem {
  id: string
  name: string
  amount: number
  category: BudgetCategory
  createdAt: Date
  updatedAt: Date
}

// Use discriminated unions for complex state
type BudgetState = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: BudgetItem[] }
  | { status: 'error'; error: string }
```

### 2. Error Handling
```typescript
// Create custom error classes
export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

// Use Result pattern for error handling
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E }

async function fetchBudgetItems(): Promise<Result<BudgetItem[]>> {
  try {
    const response = await fetch('/api/budget')
    if (!response.ok) {
      throw new Error('Failed to fetch budget items')
    }
    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error as Error }
  }
}
```

### 3. State Management
```typescript
// Use Zustand for global state
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface BudgetStore {
  items: BudgetItem[]
  isLoading: boolean
  error: string | null
  fetchItems: () => Promise<void>
  addItem: (item: NewBudgetItem) => Promise<void>
}

export const useBudgetStore = create<BudgetStore>()(
  devtools(
    (set, get) => ({
      items: [],
      isLoading: false,
      error: null,
      fetchItems: async () => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch('/api/budget')
          const data = await response.json()
          set({ items: data, isLoading: false })
        } catch (error) {
          set({ error: error.message, isLoading: false })
        }
      },
      addItem: async (item) => {
        // Implementation
      }
    }),
    { name: 'budget-store' }
  )
)
```

### 4. Testing
```typescript
// Use Vitest for testing
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BudgetCard } from './budget-card'

describe('BudgetCard', () => {
  it('renders budget item correctly', () => {
    const mockItem = {
      id: '1',
      name: 'Venue',
      amount: 5000,
      category: 'venue' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    render(<BudgetCard item={mockItem} onEdit={vi.fn()} onDelete={vi.fn()} />)
    
    expect(screen.getByText('Venue')).toBeInTheDocument()
    expect(screen.getByText('$5,000')).toBeInTheDocument()
  })
})
```

## Migration Checklist

### Phase 1: Foundation
- [ ] Set up monorepo with Turborepo
- [ ] Install Next.js 14+ with App Router
- [ ] Configure TypeScript, ESLint, Prettier
- [ ] Set up Tailwind CSS
- [ ] Create shared packages structure

### Phase 2: Components
- [ ] Migrate UI components to packages/ui
- [ ] Create feature-based component structure
- [ ] Set up component documentation with Storybook
- [ ] Implement design system tokens

### Phase 3: API
- [ ] Create Next.js API routes
- [ ] Set up NextAuth.js for authentication
- [ ] Migrate Express routes to Next.js API routes
- [ ] Implement proper error handling

### Phase 4: Database
- [ ] Set up Drizzle ORM
- [ ] Create proper database schema
- [ ] Set up migrations
- [ ] Implement seed data

### Phase 5: Testing & Documentation
- [ ] Set up Vitest for testing
- [ ] Create component tests
- [ ] Set up E2E testing with Playwright
- [ ] Create API documentation
- [ ] Write README and contributing guidelines

## Performance Optimizations

### 1. Code Splitting
```typescript
// Use dynamic imports for large components
const BudgetChart = dynamic(() => import('./budget-chart'), {
  loading: () => <BudgetChartSkeleton />,
  ssr: false
})
```

### 2. Image Optimization
```typescript
// Use Next.js Image component
import Image from 'next/image'

<Image
  src="/venue-image.jpg"
  alt="Wedding venue"
  width={400}
  height={300}
  priority
/>
```

### 3. Caching
```typescript
// Implement proper caching strategies
export async function GET() {
  const data = await fetch('https://api.example.com/data', {
    next: { revalidate: 3600 } // Cache for 1 hour
  })
  return Response.json(await data.json())
}
```

## Security Best Practices

### 1. Input Validation
```typescript
// Use Zod for validation
import { z } from 'zod'

const budgetItemSchema = z.object({
  name: z.string().min(1).max(100),
  amount: z.number().positive(),
  category: z.enum(['venue', 'catering', 'photography']),
})

export async function POST(request: NextRequest) {
  const body = await request.json()
  const validatedData = budgetItemSchema.parse(body)
  // Process validated data
}
```

### 2. Authentication
```typescript
// Use NextAuth.js with proper session handling
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Handle authenticated request
}
```

This refactoring plan will transform your current Express + Vite application into a modern, maintainable Next.js application with proper TypeScript support, testing, and best practices. 