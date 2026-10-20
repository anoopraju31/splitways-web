import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';

import { ensureUser } from '@/lib/ensure-user';
import { getGroupDetails, getUser } from '@/lib/queries';
import { GroupDetailPage } from '@/components/pages/GroupDetail';

async function GroupDetailLoader({ params }: { params: Promise<{ groupId: string }> }) {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  await ensureUser();

  const { groupId } = await params;
  const [user, data] = await Promise.all([getUser(userId), getGroupDetails(groupId, userId)]);

  if (!user) {
    redirect('/sign-in');
  }

  if (!data) {
    notFound();
  }

  return <GroupDetailPage currentUser={user} initialGroup={data.group} initialDebts={data.debts} />;
}

export default function GroupPage({ params }: { params: Promise<{ groupId: string }> }) {
  return (
    <Suspense fallback={null}>
      <GroupDetailLoader params={params} />
    </Suspense>
  );
}
