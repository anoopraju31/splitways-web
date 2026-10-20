import type { User, SimplifiedDebt } from '@/lib/types';

export interface GroupMemberWithUser {
  userId: string;
  user: User;
}

export interface SplitRecord {
  userId: string;
  amountCents: number;
}

export interface ExpenseRecord {
  paidById: string;
  amountCents: number;
  splits: SplitRecord[];
}

export interface SettlementRecord {
  fromUserId: string;
  toUserId: string;
  amountCents: number;
}

export function computeMemberBalances(
  members: GroupMemberWithUser[],
  expenses: ExpenseRecord[],
  settlements: SettlementRecord[],
): Map<string, number> {
  const balances = new Map<string, number>();

  for (const m of members) {
    balances.set(m.userId, 0);
  }

  // Expenses: paidBy gets +amountCents, each split debtor gets -split.amountCents
  for (const exp of expenses) {
    const currentPaid = balances.get(exp.paidById) || 0;
    balances.set(exp.paidById, currentPaid + exp.amountCents);

    for (const split of exp.splits) {
      const currentOwed = balances.get(split.userId) || 0;
      balances.set(split.userId, currentOwed - split.amountCents);
    }
  }

  // Settlements: fromUser paid toUser
  // fromUser gets +settlement.amountCents (paid off their debt)
  // toUser gets -settlement.amountCents (received their credit)
  for (const st of settlements) {
    const fromBal = balances.get(st.fromUserId) || 0;
    balances.set(st.fromUserId, fromBal + st.amountCents);

    const toBal = balances.get(st.toUserId) || 0;
    balances.set(st.toUserId, toBal - st.amountCents);
  }

  return balances;
}

export function simplifyDebts(
  members: GroupMemberWithUser[],
  expenses: ExpenseRecord[],
  settlements: SettlementRecord[],
): SimplifiedDebt[] {
  const balances = computeMemberBalances(members, expenses, settlements);
  const memberMap = new Map<string, User>(members.map((m) => [m.userId, m.user]));

  const creditors: { userId: string; amount: number }[] = [];
  const debtors: { userId: string; amount: number }[] = [];

  for (const [userId, bal] of balances.entries()) {
    if (bal > 0) {
      creditors.push({ userId, amount: bal });
    } else if (bal < 0) {
      debtors.push({ userId, amount: -bal });
    }
  }

  // Sort descending by amount
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const simplified: SimplifiedDebt[] = [];

  let cIdx = 0;
  let dIdx = 0;

  while (cIdx < creditors.length && dIdx < debtors.length) {
    const creditor = creditors[cIdx];
    const debtor = debtors[dIdx];

    const settledAmount = Math.min(creditor.amount, debtor.amount);

    if (settledAmount > 0) {
      const fromUser = memberMap.get(debtor.userId);
      const toUser = memberMap.get(creditor.userId);

      if (fromUser && toUser) {
        simplified.push({
          fromUser,
          toUser,
          amountCents: settledAmount,
        });
      }
    }

    creditor.amount -= settledAmount;
    debtor.amount -= settledAmount;

    if (creditor.amount === 0) cIdx++;
    if (debtor.amount === 0) dIdx++;
  }

  return simplified;
}
