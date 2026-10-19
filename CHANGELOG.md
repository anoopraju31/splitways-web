# Changelog

All notable changes to Splitwise are recorded here.

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
