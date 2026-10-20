import { prisma } from '@/lib/db';
import type { GroupWithDetails, SimplifiedDebt, User } from '@/lib/types';
import { computeMemberBalances, simplifyDebts } from '@/lib/simplify-debts';

export async function getUserGroups(userId: string): Promise<GroupWithDetails[]> {
  const memberships = await prisma.groupMember.findMany({
    where: { userId },
    include: {
      group: {
        include: {
          members: {
            include: {
              user: true,
            },
          },
          expenses: {
            include: {
              splits: true,
            },
          },
          settlements: true,
        },
      },
    },
    orderBy: {
      group: {
        createdAt: 'desc',
      },
    },
  });

  return memberships.map(({ group }) => {
    const balances = computeMemberBalances(
      group.members.map((m) => ({
        userId: m.userId,
        user: {
          id: m.user.id,
          name: m.user.name,
          email: m.user.email,
          imageUrl: m.user.imageUrl ?? undefined,
        },
      })),
      group.expenses,
      group.settlements,
    );

    const userBalanceCents = balances.get(userId) || 0;
    const totalCents = group.expenses.reduce((sum, e) => sum + e.amountCents, 0);

    return {
      id: group.id,
      name: group.name,
      totalCents,
      userBalanceCents,
      members: group.members.map((m) => ({
        groupId: m.groupId,
        userId: m.userId,
        role: m.role as 'admin' | 'member',
        user: {
          id: m.user.id,
          name: m.user.name,
          email: m.user.email,
          imageUrl: m.user.imageUrl ?? undefined,
        },
      })),
      expenses: group.expenses.map((e) => ({
        id: e.id,
        groupId: e.groupId,
        paidById: e.paidById,
        amountCents: e.amountCents,
        originalAmountCents: e.originalAmountCents ?? undefined,
        originalCurrency: e.originalCurrency ?? undefined,
        description: e.description,
        createdAt: e.createdAt.toISOString(),
        splits: e.splits.map((s) => ({
          expenseId: s.expenseId,
          userId: s.userId,
          amountCents: s.amountCents,
        })),
      })),
      settlements: group.settlements.map((s) => ({
        id: s.id,
        groupId: s.groupId,
        fromUserId: s.fromUserId,
        toUserId: s.toUserId,
        amountCents: s.amountCents,
        createdAt: s.createdAt.toISOString(),
      })),
    };
  });
}

export async function getGroupDetails(
  groupId: string,
  userId: string,
): Promise<{ group: GroupWithDetails; debts: SimplifiedDebt[] } | null> {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      members: {
        include: {
          user: true,
        },
      },
      expenses: {
        include: {
          splits: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
      settlements: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!group) return null;

  // Verify group membership
  const isMember = group.members.some((m) => m.userId === userId);
  if (!isMember) return null;

  const membersWithUser = group.members.map((m) => ({
    userId: m.userId,
    user: {
      id: m.user.id,
      name: m.user.name,
      email: m.user.email,
      imageUrl: m.user.imageUrl ?? undefined,
    },
  }));

  const balances = computeMemberBalances(membersWithUser, group.expenses, group.settlements);

  const debts = simplifyDebts(membersWithUser, group.expenses, group.settlements);

  const userBalanceCents = balances.get(userId) || 0;
  const totalCents = group.expenses.reduce((sum, e) => sum + e.amountCents, 0);

  const groupWithDetails: GroupWithDetails = {
    id: group.id,
    name: group.name,
    totalCents,
    userBalanceCents,
    members: group.members.map((m) => ({
      groupId: m.groupId,
      userId: m.userId,
      role: m.role as 'admin' | 'member',
      user: {
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
        imageUrl: m.user.imageUrl ?? undefined,
      },
    })),
    expenses: group.expenses.map((e) => ({
      id: e.id,
      groupId: e.groupId,
      paidById: e.paidById,
      amountCents: e.amountCents,
      originalAmountCents: e.originalAmountCents ?? undefined,
      originalCurrency: e.originalCurrency ?? undefined,
      description: e.description,
      createdAt: e.createdAt.toISOString(),
      splits: e.splits.map((s) => ({
        expenseId: s.expenseId,
        userId: s.userId,
        amountCents: s.amountCents,
      })),
    })),
    settlements: group.settlements.map((s) => ({
      id: s.id,
      groupId: s.groupId,
      fromUserId: s.fromUserId,
      toUserId: s.toUserId,
      amountCents: s.amountCents,
      createdAt: s.createdAt.toISOString(),
    })),
  };

  return { group: groupWithDetails, debts };
}

export async function getUser(userId: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    imageUrl: user.imageUrl ?? undefined,
  };
}
