# Changelog

All notable changes to Splitwise are recorded here.

## [0.2.0] - 2026-10-19

### Added

- Integrated Clerk auth infrastructure via Clerk CLI (`@clerk/nextjs`).
- Protected `/dashboard` and `/groups/*` routes in `proxy.ts` using `clerkMiddleware`.
- Wrapped root layout in `<ClerkProvider>` and added global `<Header />` with Clerk v7 `<Show>` auth-conditional CTAs.
- Added dedicated `/sign-in` and `/sign-up` catch-all pages wrapped in `<Suspense>` for Next.js 16 Partial Prerendering compatibility.
