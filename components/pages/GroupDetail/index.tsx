'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import type { GroupWithDetails, Expense, SimplifiedDebt, Settlement } from '@/lib/types';
import { mockCurrentUser, mockGroups, mockSimplifiedDebts, formatCents } from '@/lib/mock-data';
import { Avatar } from '@/components/shared/Avatar';
import { CurrencySelect } from '@/components/shared/CurrencySelect';
import { ExpenseModal } from '@/components/shared/ExpenseModal';
import { ActivityItem } from '@/components/pages/GroupDetail/ActivityItem';
import { WhoOwesWhom } from '@/components/pages/GroupDetail/WhoOwesWhom';
import { MemberList } from '@/components/pages/GroupDetail/MemberList';

interface GroupDetailPageProps {
  groupId: string;
}

export function GroupDetailPage({ groupId }: GroupDetailPageProps) {
  const initialGroup = mockGroups.find((g) => g.id === groupId) || mockGroups[0];
  const [group, setGroup] = useState<GroupWithDetails>(initialGroup);
  const [debts, setDebts] = useState<SimplifiedDebt[]>(mockSimplifiedDebts[groupId] || []);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Combine expenses and settlements into unified activity list sorted newest first
  const activityList = [
    ...group.expenses.map((e) => ({
      type: 'expense' as const,
      data: e,
      date: new Date(e.createdAt).getTime(),
    })),
    ...group.settlements.map((s) => ({
      type: 'settlement' as const,
      data: s,
      date: new Date(s.createdAt).getTime(),
    })),
  ].sort((a, b) => b.date - a.date);

  const handleOpenAdd = () => {
    setEditingExpense(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exp: Expense) => {
    setEditingExpense(exp);
    setIsModalOpen(true);
  };

  const handleDeleteActivity = (id: string, type: 'expense' | 'settlement') => {
    if (type === 'expense') {
      setGroup((prev) => {
        const remaining = prev.expenses.filter((e) => e.id !== id);
        return {
          ...prev,
          expenses: remaining,
          totalCents: remaining.reduce((sum, e) => sum + e.amountCents, 0),
        };
      });
    } else {
      setGroup((prev) => ({
        ...prev,
        settlements: prev.settlements.filter((s) => s.id !== id),
      }));
    }
  };

  const handleSaveExpense = (data: any) => {
    if (editingExpense) {
      setGroup((prev) => ({
        ...prev,
        expenses: prev.expenses.map((e) =>
          e.id === editingExpense.id
            ? {
                ...e,
                description: data.description,
                amountCents: data.amountCents,
                originalCurrency: data.currency,
              }
            : e,
        ),
      }));
    } else {
      const newExp: Expense = {
        id: `exp_${Date.now()}`,
        groupId: group.id,
        paidById: data.paidById,
        amountCents: data.amountCents,
        originalAmountCents: data.amountCents,
        originalCurrency: data.currency,
        description: data.description,
        splits: data.selectedMembers.map((userId: string) => ({
          expenseId: `exp_${Date.now()}`,
          userId,
          amountCents: Math.round(data.amountCents / data.selectedMembers.length),
        })),
        createdAt: new Date().toISOString(),
      };

      setGroup((prev) => ({
        ...prev,
        expenses: [newExp, ...prev.expenses],
        totalCents: prev.totalCents + newExp.amountCents,
      }));
    }
  };

  const handleSettleUp = (debt: SimplifiedDebt) => {
    const newSettlement: Settlement = {
      id: `settle_${Date.now()}`,
      groupId: group.id,
      fromUserId: debt.fromUser.id,
      toUserId: debt.toUser.id,
      amountCents: debt.amountCents,
      createdAt: new Date().toISOString(),
    };

    setGroup((prev) => ({
      ...prev,
      settlements: [newSettlement, ...prev.settlements],
      userBalanceCents: 0,
    }));

    setDebts((prev) => prev.filter((d) => !(d.fromUser.id === debt.fromUser.id && d.toUser.id === debt.toUser.id)));
  };

  const handleAddMember = (email: string) => {
    const newMemberUser = {
      id: `user_${Date.now()}`,
      name: email.split('@')[0],
      email,
    };

    setGroup((prev) => ({
      ...prev,
      members: [
        ...prev.members,
        {
          groupId: prev.id,
          userId: newMemberUser.id,
          role: 'member',
          user: newMemberUser,
        },
      ],
    }));
  };

  const isOwed = group.userBalanceCents > 0;
  const isSettled = group.userBalanceCents === 0;

  return (
    <main className="bg-background min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Back navigation */}
        <Link
          href="/dashboard"
          className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to dashboard</span>
        </Link>

        {/* Group Header */}
        <div className="flex flex-col gap-4 pb-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-foreground text-3xl font-extrabold tracking-tight">{group.name}</h1>

            <div className="mt-3 flex items-center gap-3">
              {/* Stacked avatars */}
              <div className="flex -space-x-2 overflow-hidden">
                {group.members.map((m) => (
                  <Avatar key={m.userId} user={m.user} size="md" className="border-background border-2" />
                ))}
              </div>

              {/* Balance pill */}
              {isSettled ? (
                <span className="bg-secondary text-secondary-foreground inline-flex items-center rounded-full px-3.5 py-1 text-xs font-semibold">
                  settled up
                </span>
              ) : isOwed ? (
                <span className="inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/5 px-3 py-1 text-xs font-semibold text-emerald-600">
                  you are owed {formatCents(group.userBalanceCents, selectedCurrency)}
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full border border-rose-500/40 bg-rose-500/5 px-3 py-1 text-xs font-semibold text-rose-600">
                  you owe {formatCents(group.userBalanceCents, selectedCurrency)}
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 self-start">
            <CurrencySelect value={selectedCurrency} onChange={setSelectedCurrency} />
            <button
              type="button"
              onClick={handleOpenAdd}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-5 py-2 text-sm font-semibold shadow-sm transition-colors"
            >
              Add expense
            </button>
          </div>
        </div>

        {/* 2-Column Content Layout */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Left Column: Activity list */}
          <div className="lg:col-span-7">
            <h2 className="text-foreground mb-4 text-2xl font-bold tracking-tight">Activity</h2>

            {activityList.length === 0 ? (
              <div className="border-border bg-card text-muted-foreground rounded-2xl border p-8 text-center text-sm">
                No activity yet. Click &quot;Add expense&quot; to get started.
              </div>
            ) : (
              <div className="divide-border border-border bg-card divide-y overflow-hidden rounded-2xl border shadow-sm">
                {activityList.map((item) => (
                  <ActivityItem
                    key={item.data.id}
                    item={item}
                    currentUser={mockCurrentUser}
                    onEdit={handleOpenEdit}
                    onDelete={handleDeleteActivity}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Who owes whom & Members */}
          <div className="space-y-8 lg:col-span-5">
            <WhoOwesWhom debts={debts} currentUser={mockCurrentUser} onSettleUp={handleSettleUp} />

            <hr className="border-border" />

            <MemberList members={group.members} currentUser={mockCurrentUser} onAddMember={handleAddMember} />
          </div>
        </div>

        {/* Add/Edit Expense Modal */}
        <ExpenseModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          members={group.members}
          currentUser={mockCurrentUser}
          expense={editingExpense}
          onSave={handleSaveExpense}
        />
      </div>
    </main>
  );
}
