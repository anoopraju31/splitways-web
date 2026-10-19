import { Suspense } from 'react';

import { GroupDetailPage } from '@/components/pages/GroupDetail';

async function GroupDetailLoader({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  return <GroupDetailPage groupId={groupId} />;
}

export default function GroupPage({ params }: { params: Promise<{ groupId: string }> }) {
  return (
    <Suspense fallback={null}>
      <GroupDetailLoader params={params} />
    </Suspense>
  );
}
