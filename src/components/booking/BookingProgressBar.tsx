'use client';
import { HiChevronRight } from 'react-icons/hi2';
import CTAButton from '@/components/ui/CTA/CTAButton';
import { useBooking } from './BookingContext';

type Props = {
  currentStep: number;
  totalSteps: number;
  labels: string[];
  onNext: () => void;
  canProceed: boolean;
};

export default function BookingProgressBar({
  currentStep,
  totalSteps,
  labels,
  onNext,
  canProceed,
}: Props) {
  const { totalPrice, selectedCategory, selectedPackage } = useBooking();

  const nextLabel = currentStep < totalSteps ? labels[currentStep] : '';

  return (
    <div className='fixed bottom-6 md:bottom-10 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none'>
      {/* Floating Glass Bar - Sharp Edges & Wide */}
      <div className='w-full max-w-7xl bg-surface-glass/90 backdrop-blur-2xl border border-white/5 shadow-[0_30px_60px_rgba(0,0,0,0.6)] rounded-none px-5 py-4 md:py-3 md:px-8 flex flex-col md:flex-row items-center justify-between pointer-events-auto gap-6 transition-all duration-700 ease-out'>
        <div className='flex items-center w-full md:w-auto justify-between md:justify-start gap-6 md:gap-10'>
          {/* Progress Counter */}
          <div className='shrink-0'>
            <span className='block text-secondary text-[9px] tracking-[0.2em] font-body uppercase mb-1 font-semibold'>
              Progress
            </span>
            <div className='flex items-end gap-1'>
              <span className='text-white font-heading font-medium text-xl md:text-2xl leading-none'>
                0{currentStep}
              </span>
              <span className='text-[#454957] font-heading text-sm mb-[0.1rem]'>
                / 0{totalSteps}
              </span>
            </div>
          </div>

          {/* Pricing Block (Appears after Step 1) */}
          {currentStep > 1 && (
            <div className='flex items-center gap-6 md:gap-10 pl-6 md:pl-10 border-l border-[#2a2a2a] max-w-[65%] md:max-w-none'>
              <div className='hidden md:flex flex-col gap-1 min-w-0 shrink'>
                <p className='text-secondary text-[9px] tracking-[0.2em] uppercase font-body truncate font-semibold'>
                  {selectedCategory?.shortName || labels[currentStep - 1]}
                </p>
                <p className='text-white text-sm font-heading tracking-wide truncate max-w-50'>
                  {selectedPackage?.name || 'Select Package'}
                </p>
              </div>

              <div className='shrink-0 md:pl-4'>
                <p className='text-secondary text-[9px] tracking-[0.2em] uppercase font-body mb-1 font-semibold'>
                  Estimated Total
                </p>
                <p className='text-primary text-2xl lg:text-3xl font-heading leading-none tracking-tight'>
                  ${totalPrice.toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Continue Button CTA */}
        {currentStep <= totalSteps && (
          <div className='w-full md:w-auto shrink-0 md:ml-auto'>
            <CTAButton
              disabled={!canProceed}
              onClick={onNext}
              style='primary'
              className='h-12 w-full md:w-auto md:h-14 px-6 md:px-8 rounded-none! flex items-center justify-center md:justify-between gap-3 shadow-[0_10px_30px_rgba(251,198,129,0.15)] truncate'
            >
              <span className='font-body text-[10px] md:text-[11px] tracking-[0.2em] font-bold uppercase translate-y-px truncate'>
                {currentStep === totalSteps
                  ? 'Review Booking'
                  : `Continue to ${nextLabel}`}
              </span>
              <HiChevronRight className='text-lg shrink-0' />
            </CTAButton>
          </div>
        )}
      </div>
    </div>
  );
}
