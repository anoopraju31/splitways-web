'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

import type { GroupWithDetails, Expense, SimplifiedDebt, User } from '@/lib/types';
import { formatCents } from '@/lib/format';
import { Avatar } from '@/components/shared/Avatar';
import { CurrencySelect } from '@/components/shared/CurrencySelect';
import { ExpenseModal } from '@/components/shared/ExpenseModal';
import { ActivityItem } from '@/components/pages/GroupDetail/ActivityItem';
import { WhoOwesWhom } from '@/components/pages/GroupDetail/WhoOwesWhom';
import { MemberList } from '@/components/pages/GroupDetail/MemberList';
import { addExpense, updateExpense, deleteExpense, settleUp, deleteSettlement } from '@/app/actions/expenses';
import { addMember } from '@/app/actions/groups';

interface GroupDetailPageProps {
  currentUser: User;
  initialGroup: GroupWithDetails;
  initialDebts: SimplifiedDebt[];
}

export function GroupDetailPage({ currentUser, initialGroup, initialDebts }: GroupDetailPageProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Combine expenses and settlements into unified activity list sorted newest first
  const activityList = [
    ...initialGroup.expenses.map((e) => ({
      type: 'expense' as const,
      data: e,
      date: new Date(e.createdAt).getTime(),
    })),
    ...initialGroup.settlements.map((s) => ({
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
    startTransition(async () => {
      if (type === 'expense') {
        const res = await deleteExpense(initialGroup.id, id);
        if (res?.error) {
          toast.error(res.error);
          return;
        }
        toast.success('Expense deleted');
      } else {
        const res = await deleteSettlement(initialGroup.id, id);
        if (res?.error) {
          toast.error(res.error);
          return;
        }
        toast.success('Settlement deleted');
      }
      router.refresh();
    });
  };

  const handleSaveExpense = (data: any) => {
    startTransition(async () => {
      if (editingExpense) {
        const res = await updateExpense(editingExpense.id, {
          groupId: initialGroup.id,
          description: data.description,
          amountCents: data.amountCents,
          originalAmountCents: data.amountCents,
          originalCurrency: data.currency,
          paidById: data.paidById,
          splits: data.splits,
        });

        if (res?.error) {
          toast.error(res.error);
          return;
        }
        toast.success('Expense updated!');
      } else {
        const res = await addExpense({
          groupId: initialGroup.id,
          description: data.description,
          amountCents: data.amountCents,
          originalAmountCents: data.amountCents,
          originalCurrency: data.currency,
          paidById: data.paidById,
          splits: data.splits,
        });

        if (res?.error) {
          toast.error(res.error);
          return;
        }
        toast.success('Expense added!');
      }
      router.refresh();
    });
  };

  const handleSettleUp = (debt: SimplifiedDebt) => {
    startTransition(async () => {
      const res = await settleUp(initialGroup.id, debt.toUser.id, debt.amountCents);

      if (res?.error) {
        toast.error(res.error);
        return;
      }

      toast.success('Payment recorded!');
      router.refresh();
    });
  };

  const handleAddMember = (email: string) => {
    startTransition(async () => {
      const res = await addMember(initialGroup.id, email);
      if (res?.error) {
        toast.error(res.error);
        return;
      }

      toast.success('Member added!');
      router.refresh();
    });
  };

  const isOwed = initialGroup.userBalanceCents > 0;
  const isSettled = initialGroup.userBalanceCents === 0;

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
            <h1 className="text-foreground text-3xl font-extrabold tracking-tight">{initialGroup.name}</h1>

            <div className="mt-3 flex items-center gap-3">
              {/* Stacked avatars */}
              <div className="flex -space-x-2 overflow-hidden">
                {initialGroup.members.map((m) => (
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
                  you are owed {formatCents(initialGroup.userBalanceCents, selectedCurrency)}
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full border border-rose-500/40 bg-rose-500/5 px-3 py-1 text-xs font-semibold text-rose-600">
                  you owe {formatCents(initialGroup.userBalanceCents, selectedCurrency)}
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
              <div className="border-border bg-card divide-border divide-y overflow-hidden rounded-2xl border shadow-sm">
                {activityList.map((item) => (
                  <ActivityItem
                    key={item.data.id}
                    item={item}
                    currentUser={currentUser}
                    onEdit={handleOpenEdit}
                    onDelete={handleDeleteActivity}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Who owes whom & Members */}
          <div className="space-y-8 lg:col-span-5">
            <WhoOwesWhom debts={initialDebts} currentUser={currentUser} onSettleUp={handleSettleUp} />

            <hr className="border-border" />

            <MemberList members={initialGroup.members} currentUser={currentUser} onAddMember={handleAddMember} />
          </div>
        </div>

        {/* Add/Edit Expense Modal */}
        <ExpenseModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          members={initialGroup.members}
          currentUser={currentUser}
          expense={editingExpense}
          onSave={handleSaveExpense}
        />
      </div>
    </main>
  );
}
