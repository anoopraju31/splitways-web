'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface CurrencySelectProps {
  value?: string;
  onChange?: (currency: string) => void;
  className?: string;
}

const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'INR', 'CAD', 'AUD', 'CHF'];

export function CurrencySelect({ value = 'USD', onChange, className = '' }: CurrencySelectProps) {
  const [current, setCurrent] = useState(value);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value;
    setCurrent(next);
    onChange?.(next);
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <select
        value={current}
        onChange={handleChange}
        className="border-border bg-background text-foreground hover:bg-muted/50 focus:ring-primary/20 cursor-pointer appearance-none rounded-lg border py-1.5 pr-8 pl-3 text-sm font-medium transition-colors focus:ring-2 focus:outline-none"
      >
        {SUPPORTED_CURRENCIES.map((code) => (
          <option key={code} value={code}>
            {code}
          </option>
        ))}
      </select>
      <ChevronDown className="text-muted-foreground pointer-events-none absolute top-1/2 right-2.5 h-4 w-4 -translate-y-1/2" />
    </div>
  );
}
