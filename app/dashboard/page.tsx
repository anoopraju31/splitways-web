import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';

import { ensureUser } from '@/lib/ensure-user';
import { getUser, getUserGroups } from '@/lib/queries';
import { DashboardPage } from '@/components/pages/Dashboard';

async function DashboardLoader() {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  // Ensure Clerk user exists in SQLite DB
  const dbUser = await ensureUser();
  if (!dbUser) {
    redirect('/sign-in');
  }

  const [user, groups] = await Promise.all([getUser(userId), getUserGroups(userId)]);

  if (!user) {
    redirect('/sign-in');
  }

  return <DashboardPage currentUser={user} initialGroups={groups} />;
}

export default function Dashboard() {
  return (
    <Suspense fallback={null}>
      <DashboardLoader />
    </Suspense>
  );
}
