import type { User, GroupWithDetails, SimplifiedDebt } from './types';

export const mockCurrentUser: User = {
  id: 'user_current',
  name: 'Ankita',
  email: 'kulkarni.ankita09@gmail.com',
  imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
};

export const mockFriendUser: User = {
  id: 'user_ankita_2',
  name: 'Ankita Kulkarni',
  email: 'itskulkarniankita@gmail.com',
};

export const mockGroups: GroupWithDetails[] = [
  {
    id: 'viareggio',
    name: 'viareggio',
    totalCents: 23006,
    userBalanceCents: 8301,
    members: [
      {
        groupId: 'viareggio',
        userId: mockCurrentUser.id,
        role: 'admin',
        user: mockCurrentUser,
      },
      {
        groupId: 'viareggio',
        userId: mockFriendUser.id,
        role: 'member',
        user: mockFriendUser,
      },
    ],
    expenses: [
      {
        id: 'exp_1',
        groupId: 'viareggio',
        paidById: mockCurrentUser.id,
        amountCents: 10248,
        originalAmountCents: 8900,
        originalCurrency: 'EUR',
        description: 'Lobster dinner',
        splits: [
          { expenseId: 'exp_1', userId: mockCurrentUser.id, amountCents: 3074 },
          { expenseId: 'exp_1', userId: mockFriendUser.id, amountCents: 7174 },
        ],
        createdAt: '2026-08-05T20:30:00Z',
      },
      {
        id: 'exp_2',
        groupId: 'viareggio',
        paidById: mockCurrentUser.id,
        amountCents: 5758,
        originalAmountCents: 5000,
        originalCurrency: 'EUR',
        description: 'Beach club',
        splits: [
          { expenseId: 'exp_2', userId: mockCurrentUser.id, amountCents: 1727 },
          { expenseId: 'exp_2', userId: mockFriendUser.id, amountCents: 4031 },
        ],
        createdAt: '2026-08-05T14:15:00Z',
      },
      {
        id: 'exp_3',
        groupId: 'viareggio',
        paidById: mockCurrentUser.id,
        amountCents: 7000,
        originalAmountCents: 7000,
        originalCurrency: 'USD',
        description: 'dinner',
        splits: [
          { expenseId: 'exp_3', userId: mockCurrentUser.id, amountCents: 3500 },
          { expenseId: 'exp_3', userId: mockFriendUser.id, amountCents: 3500 },
        ],
        createdAt: '2026-08-05T21:45:00Z',
      },
    ],
    settlements: [],
  },
  {
    id: 'amalfi',
    name: 'amalfi',
    totalCents: 6800,
    userBalanceCents: 0,
    members: [
      {
        groupId: 'amalfi',
        userId: mockCurrentUser.id,
        role: 'admin',
        user: mockCurrentUser,
      },
    ],
    expenses: [
      {
        id: 'exp_4',
        groupId: 'amalfi',
        paidById: mockCurrentUser.id,
        amountCents: 6800,
        originalAmountCents: 6800,
        originalCurrency: 'USD',
        description: 'Ferry tickets',
        splits: [{ expenseId: 'exp_4', userId: mockCurrentUser.id, amountCents: 6800 }],
        createdAt: '2026-08-01T09:00:00Z',
      },
    ],
    settlements: [],
  },
];

export const mockSimplifiedDebts: Record<string, SimplifiedDebt[]> = {
  viareggio: [
    {
      fromUser: mockFriendUser,
      toUser: mockCurrentUser,
      amountCents: 8301,
    },
  ],
  amalfi: [],
};

export function formatCents(cents: number, currency: string = 'USD'): string {
  const symbol = currency === 'EUR' ? '€' : currency === 'JPY' ? '¥' : currency === 'GBP' ? '£' : '$';
  return `${symbol}${(Math.abs(cents) / 100).toFixed(2)}`;
}
