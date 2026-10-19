import type { SimplifiedDebt, User } from '@/lib/types';
import { formatCents } from '@/lib/mock-data';

interface WhoOwesWhomProps {
  debts: SimplifiedDebt[];
  currentUser: User;
  onSettleUp?: (debt: SimplifiedDebt) => void;
}

export function WhoOwesWhom({ debts, currentUser, onSettleUp }: WhoOwesWhomProps) {
  return (
    <div>
      <h3 className="text-foreground mb-4 text-xl font-bold tracking-tight">Who owes whom</h3>

      {debts.length === 0 ? (
        <div className="border-border bg-card text-muted-foreground rounded-2xl border p-5 text-sm">
          All settled up in this group!
        </div>
      ) : (
        <div className="space-y-3">
          {debts.map((debt, idx) => {
            const isOwedToMe = debt.toUser.id === currentUser.id;
            const isOwedByMe = debt.fromUser.id === currentUser.id;

            return (
              <div
                key={idx}
                className="border-border bg-card flex items-center justify-between rounded-2xl border p-4 shadow-sm"
              >
                <div>
                  <p className="text-foreground text-sm font-semibold">
                    {debt.fromUser.name} <span className="text-muted-foreground font-normal">owes</span>{' '}
                    <span className="text-foreground font-bold">{isOwedToMe ? 'You' : debt.toUser.name}</span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-sm font-bold ${isOwedToMe ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {formatCents(debt.amountCents)}
                  </span>
                  {(isOwedToMe || isOwedByMe) && (
                    <button
                      type="button"
                      onClick={() => onSettleUp?.(debt)}
                      className="border-border bg-background text-foreground hover:bg-muted rounded-lg border px-3 py-1.5 text-xs font-semibold shadow-sm transition-colors"
                    >
                      Settle up
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
