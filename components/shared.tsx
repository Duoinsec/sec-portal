'use client';

import { cn } from '@/lib/utils';
import { Loader2, Inbox, AlertCircle, Frown } from 'lucide-react';

export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-[#1468D5]" />
      <p className="text-sm text-[#6B7280]">{message}</p>
    </div>
  );
}

export function EmptyState({ title, message, icon: Icon }: { title: string; message?: string; icon?: any }) {
  const DefaultIcon = Inbox;
  const IconComponent = Icon || DefaultIcon;
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F8FBFF]">
        <IconComponent className="h-7 w-7 text-[#6B7280]" />
      </div>
      <div>
        <p className="font-semibold text-[#172033]">{title}</p>
        {message && <p className="mt-1 text-sm text-[#6B7280]">{message}</p>}
      </div>
    </div>
  );
}

export function ErrorState({ message = 'Something went wrong', onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
        <AlertCircle className="h-7 w-7 text-[#EF4444]" />
      </div>
      <div>
        <p className="font-semibold text-[#172033]">Error</p>
        <p className="mt-1 text-sm text-[#6B7280]">{message}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="mt-1 rounded-lg bg-[#1468D5] px-4 py-2 text-sm font-medium text-white hover:bg-[#123B73] transition-colors">
          Try Again
        </button>
      )}
    </div>
  );
}

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('rounded-2xl border border-[#E6EEF7] bg-white p-4 shadow-sm', className)} {...props}>
      {children}
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, trend, color = '#1468D5' }: {
  label: string;
  value: string | number;
  icon: any;
  trend?: string;
  color?: string;
}) {
  return (
    <Card className="flex items-center gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl shrink-0" style={{ backgroundColor: `${color}15` }}>
        <Icon className="h-6 w-6" style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-[#6B7280] truncate">{label}</p>
        <p className="text-2xl font-bold text-[#172033]">{value}</p>
        {trend && <p className="text-xs text-[#6B7280] mt-0.5">{trend}</p>}
      </div>
    </Card>
  );
}

export function AttendanceRing({ percentage, size = 120 }: { percentage: number; size?: number }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const color = percentage >= 75 ? '#16A34A' : percentage >= 60 ? '#F59E0B' : '#EF4444';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E6EEF7" strokeWidth="8" />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold text-[#172033]">{percentage.toFixed(1)}%</span>
        <span className="text-xs text-[#6B7280]">Attendance</span>
      </div>
    </div>
  );
}

export function Badge({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'success' | 'warning' | 'error' | 'info' }) {
  const variants = {
    default: 'bg-[#F8FBFF] text-[#6B7280]',
    success: 'bg-green-50 text-green-700',
    warning: 'bg-amber-50 text-amber-700',
    error: 'bg-red-50 text-red-700',
    info: 'bg-blue-50 text-blue-700',
  };
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', variants[variant])}>
      {children}
    </span>
  );
}
