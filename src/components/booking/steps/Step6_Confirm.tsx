'use client';
import { useState } from 'react';
import { useBooking } from '../BookingContext';
import { useRouter } from 'next/navigation';
import { useToast } from '@/lib/context/ToastContext';
import {
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
} from 'react-icons/hi2';
import { HiArrowLongLeft, HiArrowPath } from 'react-icons/hi2';
import CTAButton from '@/components/ui/CTA/CTAButton';

export default function Step6_Confirm() {
  const {
    state,
    selectedCategory,
    selectedPackage,
    totalPrice,
    prevStep,
    reset,
    clearStorage,
  } = useBooking();

  const router = useRouter();
  const { show } = useToast();

  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const resolvedAddOns = state.addOnIds
    .map((id) => selectedCategory?.addOns?.find((a) => a.id === id))
    .filter(Boolean);

  const handleSubmit = async () => {
    setStatus('loading');
    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: state.name,
          email: state.email,
          phone: state.phone,
          categoryId: state.categoryId,
          packageId: state.packageId,
          addOnIds: state.addOnIds,
          date: state.date,
          notes: state.notes,
          token: state.token,
        }),
      });

      if (res.ok) {
        setStatus('success');
        show('Booking request sent successfully!', { status: 'success' });
      } else {
        const data = await res.json();
        setErrorMsg(data?.message ?? 'Something went wrong. Please try again.');
        setStatus('error');
      }
    } catch {
      setErrorMsg('Network error. Please check your connection and try again.');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className='flex flex-col items-center justify-center py-32 text-center max-w-xl mx-auto'>
        <div className='text-primary text-7xl mb-8'>
          <HiOutlineCheckCircle />
        </div>
        <h2 className='text-4xl md:text-5xl font-heading font-normal text-white mb-4 tracking-tight'>
          Request Received
        </h2>
        <p className='text-secondary text-base md:text-lg font-body mb-12 leading-relaxed'>
          Thank you, {state.name}. We&apos;ve securely received your booking
          request and our team will be in touch within 24 hours to confirm your
          session.
        </p>
        <button
          onClick={() => {
            clearStorage();
            router.push('/');
          }}
          className='h-14 px-10 bg-primary text-background flex items-center justify-center hover:bg-primary-light transition-colors duration-300 shadow-[0_10px_30px_rgba(251,198,129,0.15)] outline-none'
        >
          <span className='font-body text-[11px] tracking-[0.2em] font-bold uppercase translate-y-px'>
            Return Home
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className='w-full'>
      {/* Editorial Header */}
      <div className='mb-16 mt-4 md:mt-8 flex flex-col md:flex-row md:justify-between md:items-end gap-8'>
        <div className='max-w-2xl'>
          <div className='flex flex-wrap items-center gap-6 mb-10'>
            <button
              onClick={prevStep}
              disabled={status === 'loading'}
              className='group flex items-center gap-2 text-secondary hover:text-primary text-xs font-body tracking-[0.2em] uppercase transition-colors outline-none disabled:opacity-50'
            >
              <HiArrowLongLeft className='text-2xl transition-transform group-hover:-translate-x-1.5' />
              Return to Contact Details
            </button>
            <span className='w-px h-4 bg-white/10 hidden sm:block' />
            <button
              onClick={reset}
              disabled={status === 'loading'}
              className='flex items-center gap-1.5 text-secondary hover:text-white text-xs font-body tracking-[0.2em] uppercase transition-colors outline-none disabled:opacity-50'
            >
              <HiArrowPath className='text-lg' />
              Start Over
            </button>
          </div>

          <h2 className='text-4xl md:text-6xl font-heading text-white font-normal mb-0 tracking-tight'>
            <span className='text-[0.6em] md:text-[0.5em] tracking-widest uppercase font-body text-secondary block mb-4'>
              Review Your Itinerary
            </span>
            Confirm Booking
          </h2>
        </div>

        <div className='max-w-md text-secondary font-body text-base xl:text-lg leading-relaxed mb-1 md:mb-2'>
          Verify the components of your luxury session before dispatching your
          final request to our team.
        </div>
      </div>

      <div className='max-w-3xl mb-16 border border-white/5 bg-surface p-6 md:p-10'>
        {/* Category */}
        <ConfirmRow label='Service' value={selectedCategory?.name ?? '—'} />
        {/* Package */}
        <ConfirmRow label='Package' value={selectedPackage?.name ?? '—'} />
        {/* Add-ons */}
        {resolvedAddOns.length > 0 && (
          <ConfirmRow
            label='Add-Ons'
            value={resolvedAddOns.map((a) => a!.name).join(', ')}
          />
        )}
        {/* Date */}
        <ConfirmRow
          label='Preferred Date'
          value={
            state.date
              ? new Date(state.date).toLocaleString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '—'
          }
        />
        {/* Notes */}
        {state.notes && <ConfirmRow label='Notes' value={state.notes} />}

        <div className='border-t border-white/5 my-6 md:my-8' />

        {/* Contact */}
        <ConfirmRow label='Name' value={state.name} />
        <ConfirmRow label='Email' value={state.email} />
        <ConfirmRow label='Phone' value={state.phone} />

        <div className='border-t border-white/5 my-6 md:my-8' />

        {/* Total */}
        <div className='flex flex-col md:flex-row md:items-end justify-between py-2 gap-4'>
          <span className='text-secondary text-[10px] tracking-[0.2em] font-body uppercase font-semibold'>
            Estimated Total
          </span>
          <span className='text-primary text-4xl md:text-5xl font-heading leading-none tracking-tight'>
            ${totalPrice.toLocaleString()}
          </span>
        </div>

        <div className='mt-8 pt-6 border-t border-white/5'>
          <p className='text-secondary text-xs md:text-sm font-body leading-relaxed'>
            A <span className='text-white'>50% deposit</span> will be required
            to confirm your booking. Our team will contact you with secure
            payment details shortly after submission.
          </p>
        </div>
      </div>

      {status === 'error' && (
        <div className='flex items-start gap-4 mb-8 p-6 bg-red-950/20 border border-red-500/30 text-red-200 text-sm font-body max-w-3xl'>
          <HiOutlineExclamationTriangle className='shrink-0 mt-0.5 text-xl text-red-400' />
          <span className='leading-relaxed'>{errorMsg}</span>
        </div>
      )}

      {/* Local Action Row connecting to network submit */}
      <div className='flex justify-end pb-32 relative z-50 max-w-3xl'>
        <CTAButton
          onClick={handleSubmit}
          disabled={status === 'loading'}
          style='primary'
          className='w-full md:w-auto h-14 px-10 rounded-none! flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(251,198,129,0.15)]'
        >
          <span className='font-body text-[11px] tracking-[0.2em] font-bold uppercase translate-y-px'>
            {status === 'loading'
              ? 'Transmitting Request...'
              : 'Confirm Book Request'}
          </span>
        </CTAButton>
      </div>
    </div>
  );
}

function ConfirmRow({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex flex-col md:flex-row md:items-start gap-2 md:gap-8 py-4 border-b border-white/5 last:border-0'>
      <span className='text-primary text-[10px] tracking-[0.2em] uppercase font-body w-40 shrink-0 font-semibold md:pt-1'>
        {label}
      </span>
      <span className='text-white text-base font-body leading-relaxed flex-1'>
        {value}
      </span>
    </div>
  );
}
