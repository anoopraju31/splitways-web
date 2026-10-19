'use client';

import { useState } from 'react';

import type { GroupWithDetails } from '@/lib/types';
import { mockCurrentUser, mockGroups, formatCents } from '@/lib/mock-data';
import { CurrencySelect } from '@/components/shared/CurrencySelect';
import { GroupCard } from '@/components/pages/Dashboard/GroupCard';

export function DashboardPage() {
  const [groups, setGroups] = useState<GroupWithDetails[]>(mockGroups);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  // Compute aggregate totals across all groups
  const totalOwed = groups.reduce((acc, g) => (g.userBalanceCents > 0 ? acc + g.userBalanceCents : acc), 0);
  const totalOwe = groups.reduce((acc, g) => (g.userBalanceCents < 0 ? acc + Math.abs(g.userBalanceCents) : acc), 0);

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    const newGroup: GroupWithDetails = {
      id: newGroupName.toLowerCase().replace(/\s+/g, '-'),
      name: newGroupName.trim(),
      totalCents: 0,
      userBalanceCents: 0,
      members: [
        {
          groupId: newGroupName.toLowerCase().replace(/\s+/g, '-'),
          userId: mockCurrentUser.id,
          role: 'admin',
          user: mockCurrentUser,
        },
      ],
      expenses: [],
      settlements: [],
    };

    setGroups((prev) => [newGroup, ...prev]);
    setNewGroupName('');
  };

  return (
    <main className="bg-background min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        {/* Top welcome row */}
        <div className="flex items-center justify-between pb-8">
          <h1 className="text-foreground text-3xl font-extrabold tracking-tight">
            Welcome back, {mockCurrentUser.name} 👋
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
                className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary w-48 rounded-xl border px-3.5 py-2 text-sm focus:ring-1 focus:outline-none sm:w-64"
              />
              <button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition-colors"
              >
                Create group
              </button>
            </form>
          </div>

          {/* Group cards grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {groups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
