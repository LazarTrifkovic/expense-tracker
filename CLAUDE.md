# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Expense-sharing application (like Splitwise) with two components:
- **expense-tracker/**: Main Next.js 14 full-stack app with TypeScript, Prisma, NextAuth
- **Root**: Supplementary Python FastAPI service for API key management

## Commands

### expense-tracker (main app)

```bash
# Development
npm run dev                   # Start dev server

# Database
npm run db:generate          # Generate Prisma client
npm run db:push              # Push schema to database
npm run db:migrate           # Create and run migrations
npm run db:studio            # Open Prisma Studio GUI

# Build & Lint
npm run build                # Production build
npm run lint                 # ESLint
```

Start PostgreSQL: `docker-compose up` (in expense-tracker/)

### Python backend (root)

```bash
pip install -r requirements.txt
python app.py                # Runs uvicorn on port 8000
```

## Architecture

### Next.js App Router Structure (expense-tracker/src/app/)

- `(auth)/` - Login and register pages (unprotected)
- `(dashboard)/` - Protected routes: dashboard, groups, settings
- `api/` - API routes for groups, expenses, settlements, auth
- `middleware.ts` - Protects /dashboard/*, /groups/*, /settings/*

### Key Libraries

- `src/lib/auth.ts` - NextAuth config with CredentialsProvider, JWT strategy
- `src/lib/balance.ts` - Balance calculation and debt optimization algorithm
- `src/lib/prisma.ts` - Prisma client singleton
- `src/lib/validators.ts` - Zod schemas for form validation
- `src/lib/email.ts` - Resend email integration

### Database (Prisma)

Models: User, Group, GroupMember, Expense, ExpenseSplit, Settlement, Invitation

Key enums:
- SplitType: EQUAL, UNEQUAL, PERCENTAGE, SHARES
- SettlementStatus: PENDING, CONFIRMED
- GroupType: APARTMENT, TRIP, PROJECT, OTHER

### UI Components

- `src/components/ui/` - Radix UI primitives with Tailwind styling
- `src/components/layout/` - Navbar, Sidebar
- `src/components/expenses/`, `groups/`, `settlements/` - Feature components

## Conventions

- Language: Serbian (sr-RS locale, lang="sr")
- All protected API routes require NextAuth session
- Currency formatting via `src/lib/utils.ts`
