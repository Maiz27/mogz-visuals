'use client';
import { HiArrowLongLeft, HiArrowPath } from 'react-icons/hi2';
import { useBookingStore } from '@/lib/stores/bookingStore';

interface BookingNavigationProps {
  onBack: () => void;
  backLabel: string;
  disabled?: boolean;
}

export default function BookingNavigation({
  onBack,
  backLabel,
  disabled = false,
}: BookingNavigationProps) {
  const reset = useBookingStore((s) => s.reset);

  return (
    <div className='flex flex-wrap items-center gap-x-6 gap-y-4 mb-10'>
      <button
        onClick={onBack}
        disabled={disabled}
        className='group flex items-center gap-2 text-secondary hover:text-primary text-xs font-body tracking-[0.2em] uppercase transition-colors outline-none disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed whitespace-nowrap'
      >
        <HiArrowLongLeft className='text-2xl transition-transform group-hover:-translate-x-1.5' />
        <span className='pt-0.5'>{backLabel}</span>
      </button>
      
      <span className='w-px h-4 bg-white/10 hidden sm:block' aria-hidden='true' />
      
      <button
        onClick={reset}
        disabled={disabled}
        className='flex items-center gap-1.5 text-secondary hover:text-primary text-xs font-body tracking-[0.2em] uppercase transition-colors outline-none disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed whitespace-nowrap'
        title='Start over'
      >
        <HiArrowPath className='text-lg' />
        <span className='pt-0.5'>Start Over</span>
      </button>
    </div>
  );
}
