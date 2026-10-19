import type { User } from '@/lib/types';

interface AvatarProps {
  user: Pick<User, 'name' | 'imageUrl'>;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({ user, size = 'md', className = '' }: AvatarProps) {
  const sizeClasses = {
    sm: 'h-7 w-7 text-xs',
    md: 'h-9 w-9 text-sm',
    lg: 'h-11 w-11 text-base',
  };

  const initial = (user.name || '?').charAt(0).toUpperCase();

  if (user.imageUrl) {
    return (
      <img
        src={user.imageUrl}
        alt={user.name}
        className={`ring-background rounded-full object-cover ring-2 ${sizeClasses[size]} ${className}`}
      />
    );
  }

  // Consistent background color based on name initial
  const colors = ['bg-amber-500', 'bg-orange-500', 'bg-emerald-500', 'bg-teal-500', 'bg-blue-500', 'bg-rose-500'];
  const charCode = user.name.charCodeAt(0) || 0;
  const colorClass = colors[charCode % colors.length];

  return (
    <div
      className={`ring-background inline-flex items-center justify-center rounded-full font-semibold text-white ring-2 ${colorClass} ${sizeClasses[size]} ${className}`}
      title={user.name}
    >
      {initial}
    </div>
  );
}
