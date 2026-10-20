import { currentUser } from '@clerk/nextjs/server';

import { prisma } from '@/lib/db';

export async function ensureUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email = clerkUser.emailAddresses[0]?.emailAddress || '';
  const name =
    `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || clerkUser.username || email.split('@')[0];

  return prisma.user.upsert({
    where: { id: clerkUser.id },
    update: {
      email,
      name,
      imageUrl: clerkUser.imageUrl,
    },
    create: {
      id: clerkUser.id,
      email,
      name,
      imageUrl: clerkUser.imageUrl,
    },
  });
}
