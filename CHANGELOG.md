# Changelog

All notable changes to Splitwise are recorded here.

## [0.4.0] - 2026-10-20

### Added

- Connected Prisma SQLite database with core schema (`User`, `Group`, `GroupMember`, `Expense`, `ExpenseSplit`, `Settlement`).
- Added `lib/ensure-user.ts` to automatically sync authenticated Clerk users to the local database.
- Implemented `lib/queries.ts` for database reads (groups, balances, memberships) with no database queries in UI components.
- Implemented `lib/simplify-debts.ts` for net balance computation and greedy debt-minimization algorithm (settling in $\le n-1$ payments).
- Implemented Server Actions in `app/actions/groups.ts` (`createGroup`, `addMember`) and `app/actions/expenses.ts` (`addExpense`, `updateExpense`, `deleteExpense`, `settleUp`, `deleteSettlement`).
- Connected Dashboard and Group Detail pages to live database queries with `sonner` toast feedback and `useTransition` loading states.
- Deleted `lib/mock-data.ts`.

## [0.3.0] - 2026-10-19

### Added

- Added cursor pointer styles for `button`, `[role="button"]`, and `a` in `globals.css`.
- Built Phase 02 UI Foundation matching target screenshots:
  - Dashboard page (`/dashboard`): welcome heading, total owed/owe summary cards, currency selector, inline "Create group" form, and interactive group cards with balance status pills.
  - Group Detail page (`/groups/[groupId]`): group header with balance pill, activity list with expense & settlement rows, "Who owes whom" debt card with settle-up action, and member list with "Add member" form.
  - Expense modal (`components/shared/ExpenseModal`): AI quick-add input shell, description, amount with currency selector, inline split sentence ("Paid by X and split equally"), and member selection checklist.
  - Typed mock data & view-model interfaces in `lib/types.ts` and `lib/mock-data.ts` mirroring future Prisma models.

## [0.2.0] - 2026-10-19

### Added

- Integrated Clerk auth infrastructure via Clerk CLI (`@clerk/nextjs`).
- Protected `/dashboard` and `/groups/*` routes in `proxy.ts` using `clerkMiddleware`.
- Wrapped root layout in `<ClerkProvider>` and added global `<Header />` with Clerk v7 `<Show>` auth-conditional CTAs.
- Added dedicated `/sign-in` and `/sign-up` catch-all pages wrapped in `<Suspense>` for Next.js 16 Partial Prerendering compatibility.
