'use client';

import { useState } from 'react';
import { useBookingStore } from '@/lib/stores/bookingStore';
import { useBookingDataStore } from '@/lib/stores/bookingDataStore';
import { getBookingTotal, resolveBookingSelections } from '@/lib/booking';
import { formatBookingDateTimeLocal } from '@/lib/bookingValidation';
import { useRouter } from 'next/navigation';
import { useToast } from '@/lib/context/ToastContext';
import {
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
} from 'react-icons/hi2';
import CTAButton from '@/components/ui/CTA/CTAButton';
import BookingNavigation from '../BookingNavigation';
import LocomotiveScrollSection from '../../locomotiveScrollSection/LocomotiveScrollSection';

export default function Step6_Confirm() {
  const selections = useBookingStore((s) => s.selections);
  const date = useBookingStore((s) => s.date);
  const notes = useBookingStore((s) => s.notes);
  const name = useBookingStore((s) => s.name);
  const email = useBookingStore((s) => s.email);
  const phone = useBookingStore((s) => s.phone);
  const termsAccepted = useBookingStore((s) => s.termsAccepted);
  const token = useBookingStore((s) => s.token);
  const prevStep = useBookingStore((s) => s.prevStep);

  const { categoryDetails, loadingDetail } = useBookingDataStore();
  const resolvedSelections = resolveBookingSelections(selections, categoryDetails);
  const isLoadingDetails = selections.some(
    (selection) => !!loadingDetail[selection.categoryId],
  );
  const totalPrice = getBookingTotal(selections, categoryDetails);

  const router = useRouter();
  const { show } = useToast();

  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async () => {
    setStatus('loading');
    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          termsAccepted,
          items: selections.map((selection) => ({
            categoryId: selection.categoryId,
            packageId: selection.packageId,
            addOnIds: selection.addOnIds,
          })),
          date,
          notes,
          token,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
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
      <LocomotiveScrollSection className='pb-32 px-4 sm:px-8 max-w-xl text-center mx-auto flex flex-col items-center justify-center'>
        <div className='text-primary text-7xl mb-8'>
          <HiOutlineCheckCircle />
        </div>
        <h2 className='text-4xl md:text-5xl font-heading font-normal text-white mb-4 tracking-tight'>
          Request Received
        </h2>
        <p className='text-secondary text-base md:text-lg font-body mb-12 leading-relaxed'>
          Thank you, {name}. We&apos;ve securely received your booking request
          and our team will be in touch within 24 hours to confirm your session.
        </p>
        <CTAButton
          onClick={() => {
            router.push('/');
          }}
          style='primary'
          className='h-14 px-10 shadow-[0_10px_30px_rgba(251,198,129,0.15)]'
        >
          <span className='font-body text-[11px] tracking-[0.2em] font-bold uppercase translate-y-px'>
            Return Home
          </span>
        </CTAButton>
      </LocomotiveScrollSection>
    );
  }

  return (
    <LocomotiveScrollSection className='pb-32 px-4 sm:px-8 max-w-7xl mx-auto'>
      <div className='w-full'>
        <div className='mb-16 mt-4 md:mt-8 flex flex-col md:flex-row md:justify-between md:items-end gap-8'>
          <div className='max-w-2xl'>
            <BookingNavigation
              onBack={prevStep}
              backLabel='Return to Contact Details'
              disabled={status === 'loading'}
            />

            <h2 className='text-4xl md:text-6xl font-heading text-white font-normal mb-0 tracking-tight'>
              <span className='text-[0.6em] md:text-[0.5em] tracking-widest uppercase font-body text-secondary block mb-4'>
                Review Your Itinerary
              </span>
              {isLoadingDetails ? (
                <span className='block w-64 h-10 bg-white/10 rounded animate-pulse' />
              ) : (
                'Confirm Booking'
              )}
            </h2>
          </div>

          <div className='max-w-md text-secondary font-body text-base xl:text-lg leading-relaxed mb-1 md:mb-2'>
            {isLoadingDetails ? (
              <span className='block w-full h-4 bg-white/10 rounded animate-pulse' />
            ) : (
              'Review each selected service, verify pricing, and send one combined booking request to our team.'
            )}
          </div>
        </div>

        <div className='max-w-4xl mb-16 border border-white/5 bg-surface p-6 md:p-10 relative overflow-hidden'>
          {isLoadingDetails && (
            <div className='absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center'>
              <div className='flex flex-col items-center gap-4'>
                <div className='w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin' />
                <p className='text-primary font-body text-[10px] tracking-[0.2em] uppercase font-bold'>
                  Restoring Session...
                </p>
              </div>
            </div>
          )}

          <div className='space-y-8'>
            {resolvedSelections.map((item, index) => (
              <div
                key={item.selection.categoryId}
                className='border border-white/5 bg-background/20 p-5 md:p-6'
              >
                <p className='text-primary text-[10px] tracking-[0.2em] uppercase font-body font-semibold mb-3'>
                  Service {String(index + 1).padStart(2, '0')}
                </p>
                <ConfirmRow
                  label='Service'
                  value={item.category?.name ?? item.selection.categoryId}
                />
                <ConfirmRow
                  label='Package'
                  value={item.selectedPackage?.name ?? '-'}
                />
                {item.resolvedAddOns.length > 0 && (
                  <ConfirmRow
                    label='Add-Ons'
                    value={item.resolvedAddOns.map((addOn) => addOn.name).join(', ')}
                  />
                )}
                <ConfirmRow
                  label='Subtotal'
                  value={`$${item.subtotal.toLocaleString()}`}
                />
              </div>
            ))}
          </div>

          <div className='border-t border-white/5 my-6 md:my-8' />

          <ConfirmRow
            label='Preferred Date'
            value={date ? formatBookingDateTimeLocal(date) : '-'}
          />
          {notes && <ConfirmRow label='Notes' value={notes} />}

          <div className='border-t border-white/5 my-6 md:my-8' />

          <ConfirmRow label='Name' value={name} />
          <ConfirmRow label='Email' value={email} />
          <ConfirmRow label='Phone' value={phone} />

          <div className='border-t border-white/5 my-6 md:my-8' />

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
          <div className='flex items-start gap-4 mb-8 p-6 bg-red-950/20 border border-red-500/30 text-red-200 text-sm font-body max-w-4xl'>
            <HiOutlineExclamationTriangle className='shrink-0 mt-0.5 text-xl text-red-400' />
            <span className='leading-relaxed'>{errorMsg}</span>
          </div>
        )}

        <div className='flex justify-end relative z-50 max-w-4xl'>
          <CTAButton
            onClick={handleSubmit}
            disabled={status === 'loading' || isLoadingDetails}
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
    </LocomotiveScrollSection>
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
