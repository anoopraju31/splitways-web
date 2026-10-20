'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';

import { prisma } from '@/lib/db';

export interface SplitInput {
  userId: string;
  amountCents: number;
}

export interface ExpenseInput {
  groupId: string;
  description: string;
  amountCents: number;
  originalAmountCents?: number;
  originalCurrency?: string;
  paidById: string;
  splits: SplitInput[];
}

export async function addExpense(input: ExpenseInput) {
  const { userId } = await auth();
  if (!userId) {
    return { error: 'Unauthorized' };
  }

  const { groupId, description, amountCents, originalAmountCents, originalCurrency, paidById, splits } = input;

  // 1. Verify membership of the caller
  const callerMembership = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId,
      },
    },
  });

  if (!callerMembership) {
    return { error: 'You are not a member of this group' };
  }

  // 2. Validate inputs
  const trimmedDesc = description.trim();
  if (!trimmedDesc) {
    return { error: 'Description is required' };
  }

  if (amountCents <= 0) {
    return { error: 'Amount must be greater than zero' };
  }

  if (!splits || splits.length === 0) {
    return { error: 'At least one member must be included in the split' };
  }

  // Exact-sum reconciliation check
  const splitsSum = splits.reduce((sum, s) => sum + s.amountCents, 0);
  if (splitsSum !== amountCents) {
    return {
      error: `Splits sum (${splitsSum}¢) does not match total expense amount (${amountCents}¢)`,
    };
  }

  // 3. Verify all participants belong to the group
  const groupMembers = await prisma.groupMember.findMany({
    where: { groupId },
    select: { userId: true },
  });
  const memberIdSet = new Set(groupMembers.map((m) => m.userId));

  if (!memberIdSet.has(paidById)) {
    return { error: 'Payer is not a member of this group' };
  }

  for (const split of splits) {
    if (!memberIdSet.has(split.userId)) {
      return { error: `User ${split.userId} is not a member of this group` };
    }
  }

  // 4. Create expense and splits
  const expense = await prisma.expense.create({
    data: {
      groupId,
      description: trimmedDesc,
      amountCents,
      originalAmountCents: originalAmountCents ?? amountCents,
      originalCurrency: originalCurrency ?? 'USD',
      paidById,
      splits: {
        create: splits.map((s) => ({
          userId: s.userId,
          amountCents: s.amountCents,
        })),
      },
    },
  });

  revalidatePath(`/groups/${groupId}`);
  revalidatePath('/dashboard');
  return { success: true, expenseId: expense.id };
}

export async function updateExpense(expenseId: string, input: ExpenseInput) {
  const { userId } = await auth();
  if (!userId) {
    return { error: 'Unauthorized' };
  }

  const { groupId, description, amountCents, originalAmountCents, originalCurrency, paidById, splits } = input;

  // 1. Verify caller membership
  const callerMembership = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId,
      },
    },
  });

  if (!callerMembership) {
    return { error: 'You are not a member of this group' };
  }

  // 2. Exact-sum reconciliation check
  const splitsSum = splits.reduce((sum, s) => sum + s.amountCents, 0);
  if (splitsSum !== amountCents) {
    return {
      error: `Splits sum (${splitsSum}¢) does not match total expense amount (${amountCents}¢)`,
    };
  }

  // 3. Rewrite splits atomically with parent
  await prisma.expense.update({
    where: {
      id: expenseId,
      groupId,
    },
    data: {
      description: description.trim(),
      amountCents,
      originalAmountCents: originalAmountCents ?? amountCents,
      originalCurrency: originalCurrency ?? 'USD',
      paidById,
      splits: {
        deleteMany: {},
        create: splits.map((s) => ({
          userId: s.userId,
          amountCents: s.amountCents,
        })),
      },
    },
  });

  revalidatePath(`/groups/${groupId}`);
  revalidatePath('/dashboard');
  return { success: true };
}

export async function deleteExpense(groupId: string, expenseId: string) {
  const { userId } = await auth();
  if (!userId) {
    return { error: 'Unauthorized' };
  }

  // Verify group membership
  const callerMembership = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId,
      },
    },
  });

  if (!callerMembership) {
    return { error: 'You are not a member of this group' };
  }

  await prisma.expense.delete({
    where: {
      id: expenseId,
      groupId,
    },
  });

  revalidatePath(`/groups/${groupId}`);
  revalidatePath('/dashboard');
  return { success: true };
}

export async function settleUp(groupId: string, toUserId: string, amountCents: number) {
  const { userId } = await auth();
  if (!userId) {
    return { error: 'Unauthorized' };
  }

  // Verify both users are members of groupId
  const memberships = await prisma.groupMember.findMany({
    where: {
      groupId,
      userId: { in: [userId, toUserId] },
    },
  });

  if (memberships.length < 2) {
    return { error: 'Both parties must be members of the group' };
  }

  await prisma.settlement.create({
    data: {
      groupId,
      fromUserId: userId,
      toUserId,
      amountCents,
    },
  });

  revalidatePath(`/groups/${groupId}`);
  revalidatePath('/dashboard');
  return { success: true };
}

export async function deleteSettlement(groupId: string, settlementId: string) {
  const { userId } = await auth();
  if (!userId) {
    return { error: 'Unauthorized' };
  }

  // Verify membership
  const callerMembership = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId,
      },
    },
  });

  if (!callerMembership) {
    return { error: 'You are not a member of this group' };
  }

  await prisma.settlement.delete({
    where: {
      id: settlementId,
      groupId,
    },
  });

  revalidatePath(`/groups/${groupId}`);
  revalidatePath('/dashboard');
  return { success: true };
}
