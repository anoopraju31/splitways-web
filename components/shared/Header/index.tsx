import { Suspense } from 'react';
import Link from 'next/link';
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';

export function Header() {
  return (
    <header className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <span className="text-xl">💸</span>
          <span>Splitter</span>
        </Link>
        <div className="flex items-center gap-4">
          <Suspense fallback={null}>
            <Show when="signed-in">
              <Link
                href="/dashboard"
                className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
              >
                Dashboard
              </Link>
              <UserButton />
            </Show>
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
                >
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button
                  type="button"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow focus-visible:ring-1 focus-visible:outline-none"
                >
                  Get started
                </button>
              </SignUpButton>
            </Show>
          </Suspense>
        </div>
      </div>
    </header>
  );
}
