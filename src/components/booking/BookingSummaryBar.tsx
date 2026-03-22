'use client';
import { useBookingStore } from '@/lib/stores/bookingStore';
import { useBookingDataStore } from '@/lib/stores/bookingDataStore';
import { getBookingTotal } from '@/lib/booking';

export default function BookingSummaryBar() {
  const selections = useBookingStore((s) => s.selections);
  const { categoryDetails } = useBookingDataStore();
  const totalPrice = getBookingTotal(selections, categoryDetails);

  if (selections.length === 0) return null;

  return (
    <div className='fixed bottom-0 left-0 right-0 z-50'>
      <div className='absolute inset-0 bg-background/70 backdrop-blur-xl border-t border-white/10' />

      <div className='relative max-w-5xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between gap-4'>
        <div className='flex flex-col gap-0.5 min-w-0'>
          <p className='text-secondary text-xs tracking-widest uppercase font-body truncate'>
            Selected Services
          </p>
          <p className='text-copy text-sm font-heading font-bold truncate'>
            {selections.length} service{selections.length > 1 ? 's' : ''}
          </p>
        </div>

        <div className='shrink-0 text-right'>
          <p className='text-secondary text-xs tracking-widest uppercase font-body'>
            Estimated Total
          </p>
          <p className='text-primary text-2xl font-heading font-bold tracking-tight'>
            ${totalPrice.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
