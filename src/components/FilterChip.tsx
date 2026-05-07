import { cn } from '@/lib/utils';

interface FilterChipProps {
  label: string;
  active?: boolean;
  count?: number;
  onClick?: () => void;
}

export default function FilterChip({ label, active = false, count, onClick }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex-shrink-0 px-4 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap',
        'transition-all duration-200 select-none',
        active
          ? 'bg-[#A5D6C8] text-[#2E2A28]'
          : 'bg-white/[0.6] text-[#2E2A28] border border-[rgba(165,214,200,0.2)]'
      )}
    >
      {label}
      {count !== undefined && (
        <span
          className={cn(
            'ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold',
            active ? 'bg-white/60 text-[#2E2A28]' : 'bg-[#A5D6C8] text-[#2E2A28]'
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}
