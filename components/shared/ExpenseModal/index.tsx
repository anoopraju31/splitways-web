'use client';

import { useState } from 'react';
import { X, Sparkles, ChevronDown, Check } from 'lucide-react';

import type { User, GroupMember, Expense } from '@/lib/types';
import { Avatar } from '@/components/shared/Avatar';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: GroupMember[];
  currentUser: User;
  expense?: Expense | null;
  onSave?: (data: any) => void;
}

export function ExpenseModal({ isOpen, onClose, members, currentUser, expense, onSave }: ExpenseModalProps) {
  const [aiText, setAiText] = useState('');
  const [description, setDescription] = useState(expense?.description || 'Dinner at the beach shack');
  const [amount, setAmount] = useState(expense ? (expense.amountCents / 100).toFixed(2) : '120.00');
  const [currency, setCurrency] = useState(expense?.originalCurrency || 'USD');
  const [paidById, setPaidById] = useState(expense?.paidById || members[0]?.userId || currentUser.id);
  const [splitMode, setSplitMode] = useState<'equally' | 'percentages' | 'exact'>('equally');
  const [selectedMembers, setSelectedMembers] = useState<string[]>(
    expense ? expense.splits.map((s) => s.userId) : members.map((m) => m.userId),
  );

  if (!isOpen) return null;

  const toggleMember = (userId: string) => {
    setSelectedMembers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
  };

  const handleParseAi = () => {
    if (!aiText.trim()) return;
    // Mock parsing
    setDescription(aiText.replace(/\d+.*/, '').trim() || aiText);
    const match = aiText.match(/\d+/);
    if (match) setAmount(match[0]);
    if (aiText.toLowerCase().includes('yen') || aiText.toLowerCase().includes('jpy')) setCurrency('JPY');
    if (aiText.toLowerCase().includes('euro') || aiText.toLowerCase().includes('eur')) setCurrency('EUR');
  };

  const handleSave = () => {
    const totalCents = Math.round(parseFloat(amount || '0') * 100);
    if (!description.trim() || totalCents <= 0 || selectedMembers.length === 0) {
      return;
    }

    // Exact equal split with remainder reconciliation
    const count = selectedMembers.length;
    const share = Math.floor(totalCents / count);
    let remainder = totalCents - share * count;

    const splits = selectedMembers.map((userId) => {
      const splitAmount = share + (remainder > 0 ? 1 : 0);
      if (remainder > 0) remainder--;
      return {
        userId,
        amountCents: splitAmount,
      };
    });

    onSave?.({
      description: description.trim(),
      amountCents: totalCents,
      currency,
      paidById,
      splitMode,
      selectedMembers,
      splits,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="bg-card relative z-10 w-full max-w-lg rounded-2xl p-6 shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between pb-4">
          <h2 className="text-foreground text-xl font-bold tracking-tight">
            {expense ? 'Edit expense' : 'Add an expense'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-1.5 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* AI Quick Add Box */}
        <div className="bg-primary/5 border-primary/10 mb-5 rounded-xl border p-3.5">
          <div className="text-primary mb-2 flex items-center gap-1.5 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Quick add with AI</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={aiText}
              onChange={(e) => setAiText(e.target.value)}
              placeholder='e.g. "dinner in Tokyo 4500 yen"'
              className="border-primary/20 bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary flex-1 rounded-lg border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleParseAi}
              className="border-border bg-background text-foreground hover:bg-muted rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors"
            >
              Parse
            </button>
          </div>
        </div>

        {/* Description Field */}
        <div className="mb-4">
          <label className="text-foreground mb-1.5 block text-sm font-semibold">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What was this for?"
            className="border-border bg-background text-foreground focus:border-primary focus:ring-primary w-full rounded-lg border px-3.5 py-2.5 text-sm focus:ring-1 focus:outline-none"
          />
        </div>

        {/* Amount & Currency Fields */}
        <div className="mb-5">
          <label className="text-foreground mb-1.5 block text-sm font-semibold">Amount</label>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="border-border bg-background text-foreground focus:border-primary focus:ring-primary flex-1 rounded-lg border px-3.5 py-2.5 text-sm font-medium focus:ring-1 focus:outline-none"
            />
            <div className="relative">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="border-border bg-background text-foreground hover:bg-muted/50 focus:ring-primary h-full cursor-pointer appearance-none rounded-lg border py-2.5 pr-8 pl-3.5 text-sm font-medium focus:ring-1 focus:outline-none"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="JPY">JPY</option>
                <option value="INR">INR</option>
              </select>
              <ChevronDown className="text-muted-foreground pointer-events-none absolute top-1/2 right-2.5 h-4 w-4 -translate-y-1/2" />
            </div>
          </div>
        </div>

        {/* Split sentence */}
        <div className="text-foreground mb-3.5 flex flex-wrap items-center gap-2 text-sm font-medium">
          <span>Paid by</span>
          <div className="relative inline-flex items-center">
            <select
              value={paidById}
              onChange={(e) => setPaidById(e.target.value)}
              className="text-primary cursor-pointer appearance-none rounded-md bg-transparent pr-5 text-sm font-bold hover:underline focus:outline-none"
            >
              {members.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.user.name}
                </option>
              ))}
            </select>
            <ChevronDown className="text-primary pointer-events-none absolute top-1/2 right-0 h-3.5 w-3.5 -translate-y-1/2" />
          </div>
          <span>and split</span>
          <div className="relative inline-flex items-center">
            <select
              value={splitMode}
              onChange={(e) => setSplitMode(e.target.value as any)}
              className="text-primary cursor-pointer appearance-none rounded-md bg-transparent pr-5 text-sm font-bold hover:underline focus:outline-none"
            >
              <option value="equally">equally</option>
              <option value="percentages">by percentages</option>
              <option value="exact">by exact amounts</option>
            </select>
            <ChevronDown className="text-primary pointer-events-none absolute top-1/2 right-0 h-3.5 w-3.5 -translate-y-1/2" />
          </div>
        </div>

        {/* Member Checkbox List */}
        <div className="divide-border border-border bg-background mb-6 divide-y overflow-hidden rounded-xl border">
          {members.map((m) => {
            const isChecked = selectedMembers.includes(m.userId);
            return (
              <label
                key={m.userId}
                onClick={() => toggleMember(m.userId)}
                className="hover:bg-muted/40 flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors"
              >
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                    isChecked ? 'border-primary bg-primary text-white' : 'border-border bg-background'
                  }`}
                >
                  {isChecked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                </div>
                <Avatar user={m.user} size="sm" />
                <span className="text-foreground text-sm font-medium">{m.user.name}</span>
              </label>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-5 py-2.5 text-sm font-medium shadow-sm transition-colors"
          >
            Save expense
          </button>
        </div>
      </div>
    </div>
  );
}
