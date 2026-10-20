import { Pencil, Trash2, HandCoins } from 'lucide-react';

import type { Expense, Settlement, User } from '@/lib/types';
import { formatCents } from '@/lib/format';

interface ActivityItemProps {
  item: { type: 'expense'; data: Expense } | { type: 'settlement'; data: Settlement };
  currentUser: User;
  onEdit?: (expense: Expense) => void;
  onDelete?: (id: string, type: 'expense' | 'settlement') => void;
}

export function ActivityItem({ item, currentUser, onEdit, onDelete }: ActivityItemProps) {
  if (item.type === 'settlement') {
    const s = item.data;
    const isFromMe = s.fromUserId === currentUser.id;
    return (
      <div className="hover:bg-muted/30 flex items-center justify-between p-4 transition-colors">
        <div className="flex items-center gap-3">
          <div className="bg-secondary/10 text-secondary flex h-9 w-9 items-center justify-center rounded-full">
            <HandCoins className="h-4 w-4" />
          </div>
          <div>
            <p className="text-foreground text-sm font-medium">
              {isFromMe ? 'You paid settlement' : 'Settlement received'}
            </p>
            <p className="text-muted-foreground text-xs">
              {new Date(s.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-emerald-600">{formatCents(s.amountCents)}</span>
          <button
            type="button"
            onClick={() => onDelete?.(s.id, 'settlement')}
            className="text-muted-foreground hover:bg-muted rounded p-1 transition-colors hover:text-rose-500"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  const exp = item.data;
  const isPaidByMe = exp.paidById === currentUser.id;
  const mySplit = exp.splits.find((s) => s.userId === currentUser.id);
  const myShareCents = mySplit?.amountCents || 0;

  // Format currency conversion string (e.g. "€89.00 (≈ $102.48) · Aug 5")
  const dateFormatted = new Date(exp.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  const originalStr =
    exp.originalCurrency && exp.originalCurrency !== 'USD' && exp.originalAmountCents
      ? `${formatCents(exp.originalAmountCents, exp.originalCurrency)} (≈ ${formatCents(exp.amountCents)})`
      : formatCents(exp.amountCents);

  return (
    <div className="hover:bg-muted/30 flex items-center justify-between p-4 transition-colors">
      <div>
        <h4 className="text-foreground text-base font-semibold">{exp.description}</h4>
        <p className="text-muted-foreground mt-0.5 text-sm">
          {isPaidByMe ? 'You paid' : 'Someone paid'} {originalStr} · {dateFormatted}
        </p>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <span className="text-muted-foreground text-sm font-medium">your share {formatCents(myShareCents)}</span>

        <button
          type="button"
          onClick={() => onEdit?.(exp)}
          className="text-muted-foreground hover:bg-muted hover:text-foreground rounded p-1 transition-colors"
          title="Edit expense"
        >
          <Pencil className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => onDelete?.(exp.id, 'expense')}
          className="text-muted-foreground hover:bg-muted rounded p-1 transition-colors hover:text-rose-500"
          title="Delete expense"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
