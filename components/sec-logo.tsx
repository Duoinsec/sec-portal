import { cn } from '@/lib/utils';

export function SECLogo({ className, showText = true }: { className?: string; showText?: boolean }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#1468D5] to-[#123B73] shadow-md shrink-0">
        <span className="text-white font-bold text-sm tracking-tight">SEC</span>
      </div>
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className="font-bold text-[#172033] text-sm">SEC AI Assistant</span>
          <span className="text-[10px] text-[#6B7280]">Sengunthar Engineering College</span>
        </div>
      )}
    </div>
  );
}

export function SECLogoCompact({ className }: { className?: string }) {
  return (
    <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#1468D5] to-[#123B73] shadow-md shrink-0', className)}>
      <span className="text-white font-bold text-sm tracking-tight">SEC</span>
    </div>
  );
}
