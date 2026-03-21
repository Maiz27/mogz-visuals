'use client';
import { useBooking } from './BookingContext';

export default function BookingSummaryBar() {
  const { selectedCategory, selectedPackage, totalPrice } = useBooking();

  if (!selectedPackage) return null;

  return (
    <div className='fixed bottom-0 left-0 right-0 z-50'>
      {/* Blur backdrop */}
      <div className='absolute inset-0 bg-background/70 backdrop-blur-xl border-t border-white/10' />

      <div className='relative max-w-5xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between gap-4'>
        <div className='flex flex-col gap-0.5 min-w-0'>
          <p className='text-secondary text-xs tracking-widest uppercase font-body truncate'>
            {selectedCategory?.shortName}
          </p>
          <p className='text-copy text-sm font-heading font-bold truncate'>
            {selectedPackage.name}
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
