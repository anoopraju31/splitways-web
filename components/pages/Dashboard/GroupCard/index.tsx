import Link from 'next/link';

import type { GroupWithDetails } from '@/lib/types';
import { formatCents } from '@/lib/mock-data';
import { Avatar } from '@/components/shared/Avatar';

interface GroupCardProps {
  group: GroupWithDetails;
}

export function GroupCard({ group }: GroupCardProps) {
  const isSettled = group.userBalanceCents === 0;
  const isOwed = group.userBalanceCents > 0;

  return (
    <Link
      href={`/groups/${group.id}`}
      className="group border-border bg-card hover:border-primary/40 block rounded-2xl border p-6 shadow-sm transition-all hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-foreground group-hover:text-primary text-xl font-bold tracking-tight transition-colors">
          {group.name}
        </h3>

        {/* Balance status pill */}
        {isSettled ? (
          <span className="bg-secondary text-secondary-foreground inline-flex items-center rounded-full px-3.5 py-1 text-xs font-semibold shadow-sm">
            settled up
          </span>
        ) : isOwed ? (
          <span className="inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/5 px-3 py-1 text-xs font-semibold text-emerald-600">
            you are owed {formatCents(group.userBalanceCents)}
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full border border-rose-500/40 bg-rose-500/5 px-3 py-1 text-xs font-semibold text-rose-600">
            you owe {formatCents(group.userBalanceCents)}
          </span>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between">
        {/* Stacked Member Avatars */}
        <div className="flex -space-x-2 overflow-hidden">
          {group.members.map((member) => (
            <Avatar key={member.userId} user={member.user} size="md" className="border-background border-2" />
          ))}
        </div>

        {/* Group Total */}
        <span className="text-muted-foreground text-sm font-medium">{formatCents(group.totalCents)} total</span>
      </div>
    </Link>
  );
}
