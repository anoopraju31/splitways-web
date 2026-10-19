export type User = {
  id: string;
  name: string;
  email: string;
  imageUrl?: string;
};

export type GroupMember = {
  groupId: string;
  userId: string;
  role: 'admin' | 'member';
  user: User;
};

export type ExpenseSplit = {
  expenseId: string;
  userId: string;
  amountCents: number;
};

export type Expense = {
  id: string;
  groupId: string;
  paidById: string;
  amountCents: number;
  originalAmountCents?: number;
  originalCurrency?: string;
  description: string;
  splits: ExpenseSplit[];
  createdAt: string;
};

export type Settlement = {
  id: string;
  groupId: string;
  fromUserId: string;
  toUserId: string;
  amountCents: number;
  createdAt: string;
};

export type SimplifiedDebt = {
  fromUser: User;
  toUser: User;
  amountCents: number;
};

export type GroupWithDetails = {
  id: string;
  name: string;
  members: GroupMember[];
  expenses: Expense[];
  settlements: Settlement[];
  totalCents: number;
  userBalanceCents: number;
};
