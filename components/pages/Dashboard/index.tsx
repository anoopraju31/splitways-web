'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import type { GroupWithDetails, User } from '@/lib/types';
import { formatCents } from '@/lib/format';
import { CurrencySelect } from '@/components/shared/CurrencySelect';
import { GroupCard } from '@/components/pages/Dashboard/GroupCard';
import { createGroup } from '@/app/actions/groups';

interface DashboardPageProps {
  currentUser: User;
  initialGroups: GroupWithDetails[];
}

export function DashboardPage({ currentUser, initialGroups }: DashboardPageProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  // Compute aggregate totals across all groups
  const totalOwed = initialGroups.reduce((acc, g) => (g.userBalanceCents > 0 ? acc + g.userBalanceCents : acc), 0);
  const totalOwe = initialGroups.reduce(
    (acc, g) => (g.userBalanceCents < 0 ? acc + Math.abs(g.userBalanceCents) : acc),
    0,
  );

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newGroupName.trim();
    if (!trimmed) {
      toast.error('Please enter a group name');
      return;
    }

    startTransition(async () => {
      const res = await createGroup(trimmed);
      if (res?.error) {
        toast.error(res.error);
        return;
      }

      toast.success('Group created!');
      setNewGroupName('');
      if (res?.groupId) {
        router.push(`/groups/${res.groupId}`);
      }
    });
  };

  return (
    <main className="bg-background min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        {/* Top welcome row */}
        <div className="flex items-center justify-between pb-8">
          <h1 className="text-foreground text-3xl font-extrabold tracking-tight">
            Welcome back, {currentUser.name} 👋
          </h1>
          <CurrencySelect value={selectedCurrency} onChange={setSelectedCurrency} />
        </div>

        {/* Summary metric tiles */}
        <div className="grid max-w-md grid-cols-2 gap-4 pb-12">
          <div className="border-border bg-card rounded-2xl border p-5 shadow-sm">
            <span className="text-muted-foreground block text-sm font-medium">You are owed</span>
            <span className="mt-2 block text-2xl font-bold tracking-tight text-emerald-600">
              {formatCents(totalOwed, selectedCurrency)}
            </span>
          </div>

          <div className="border-border bg-card rounded-2xl border p-5 shadow-sm">
            <span className="text-muted-foreground block text-sm font-medium">You owe</span>
            <span className="mt-2 block text-2xl font-bold tracking-tight text-rose-500">
              {formatCents(totalOwe, selectedCurrency)}
            </span>
          </div>
        </div>

        {/* Your groups section */}
        <div>
          <div className="flex flex-col gap-4 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-foreground text-2xl font-bold tracking-tight">Your groups</h2>

            {/* Inline create group form */}
            <form onSubmit={handleCreateGroup} className="flex items-center gap-2">
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="New group name..."
                disabled={isPending}
                className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary w-48 rounded-xl border px-3.5 py-2 text-sm focus:ring-1 focus:outline-none disabled:opacity-50 sm:w-64"
              />
              <button
                type="submit"
                disabled={isPending}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
              >
                {isPending ? 'Creating...' : 'Create group'}
              </button>
            </form>
          </div>

          {/* Group cards grid */}
          {initialGroups.length === 0 ? (
            <div className="border-border bg-card text-muted-foreground rounded-2xl border p-8 text-center text-sm">
              You don&apos;t have any groups yet. Create one above to start splitting expenses!
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {initialGroups.map((group) => (
                <GroupCard key={group.id} group={group} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
