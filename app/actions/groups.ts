'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';

import { prisma } from '@/lib/db';
import { ensureUser } from '@/lib/ensure-user';

export async function createGroup(name: string) {
  const { userId } = await auth();
  if (!userId) {
    return { error: 'Unauthorized' };
  }

  await ensureUser();

  const trimmed = name.trim();
  if (!trimmed) {
    return { error: 'Group name is required' };
  }

  const group = await prisma.group.create({
    data: {
      name: trimmed,
      members: {
        create: {
          userId,
          role: 'admin',
        },
      },
    },
  });

  revalidatePath('/dashboard');
  return { groupId: group.id };
}

export async function addMember(groupId: string, email: string) {
  const { userId } = await auth();
  if (!userId) {
    return { error: 'Unauthorized' };
  }

  // Verify group membership of requesting user
  const isMember = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId,
      },
    },
  });

  if (!isMember) {
    return { error: 'You are not a member of this group' };
  }

  const targetEmail = email.trim().toLowerCase();
  const targetUser = await prisma.user.findUnique({
    where: { email: targetEmail },
  });

  if (!targetUser) {
    return {
      error: 'User not found. They must sign up for Splitter before being added.',
    };
  }

  // Check if already a member
  const alreadyMember = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId: targetUser.id,
      },
    },
  });

  if (alreadyMember) {
    return { error: 'User is already a member of this group' };
  }

  await prisma.groupMember.create({
    data: {
      groupId,
      userId: targetUser.id,
      role: 'member',
    },
  });

  revalidatePath(`/groups/${groupId}`);
  revalidatePath('/dashboard');
  return { success: true };
}
