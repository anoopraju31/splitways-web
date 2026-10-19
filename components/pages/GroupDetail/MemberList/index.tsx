'use client';

import { useState } from 'react';

import type { GroupMember, User } from '@/lib/types';
import { Avatar } from '@/components/shared/Avatar';

interface MemberListProps {
  members: GroupMember[];
  currentUser: User;
  onAddMember?: (email: string) => void;
}

export function MemberList({ members, currentUser, onAddMember }: MemberListProps) {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    onAddMember?.(email.trim());
    setEmail('');
  };

  return (
    <div>
      <h3 className="text-foreground mb-4 text-xl font-bold tracking-tight">Members</h3>

      <div className="mb-4 space-y-3">
        {members.map((member) => {
          const isMe = member.userId === currentUser.id;
          return (
            <div key={member.userId} className="flex items-center gap-3 py-1">
              <Avatar user={member.user} size="md" />
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                <span className="text-foreground text-sm font-semibold">{isMe ? 'You' : member.user.name}</span>
                <span className="text-muted-foreground text-xs sm:text-sm">{member.user.email}</span>
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="friend@example.com"
          className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary flex-1 rounded-xl border px-3.5 py-2 text-sm focus:ring-1 focus:outline-none"
        />
        <button
          type="submit"
          className="border-border bg-background text-foreground hover:bg-muted rounded-xl border px-4 py-2 text-sm font-medium shadow-sm transition-colors"
        >
          Add member
        </button>
      </form>
    </div>
  );
}
