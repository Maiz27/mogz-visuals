'use client';

import Link from 'next/link';
import { useBookingStore } from '@/lib/stores/bookingStore';
import TurnstileWidget from '@/components/ui/TurnstileWidget';
import BookingNavigation from '../BookingNavigation';
import Input from '@/components/ui/form/Input';
import Checkbox from '@/components/ui/form/Checkbox';
import LocomotiveScrollSection from '../../locomotiveScrollSection/LocomotiveScrollSection';

export default function Step5_Contact() {
  const name = useBookingStore((s) => s.name);
  const email = useBookingStore((s) => s.email);
  const phone = useBookingStore((s) => s.phone);
  const termsAccepted = useBookingStore((s) => s.termsAccepted);
  const token = useBookingStore((s) => s.token);
  const updateField = useBookingStore((s) => s.updateField);
  const prevStep = useBookingStore((s) => s.prevStep);

  // Bundle state for existing component compatibility if needed
  const state = { name, email, phone, termsAccepted, token };

  return (
    <LocomotiveScrollSection className='pb-32 px-4 sm:px-8 max-w-7xl mx-auto'>
      <div className='w-full'>
        {/* Editorial Header */}
        <div className='mb-16 mt-4 md:mt-8 flex flex-col md:flex-row md:justify-between md:items-end gap-8'>
          <div className='max-w-2xl'>
            <BookingNavigation
              onBack={prevStep}
              backLabel='Return to Scheduling'
            />

            <h2 className='text-4xl md:text-6xl font-heading text-white font-normal mb-0 tracking-tight'>
              <span className='text-[0.6em] md:text-[0.5em] tracking-widest uppercase font-body text-secondary block mb-4'>
                Finalize Request
              </span>
              Your Details
            </h2>
          </div>

          <div className='max-w-md text-secondary font-body text-base xl:text-lg leading-relaxed mb-1 md:mb-2'>
            Almost there — please provide your contact information so we can
            reserve your booking.
          </div>
        </div>

        <div className='max-w-2xl space-y-6 mb-16'>
          {/* Name Input */}
          <Input
            label='Full Name'
            name='name'
            state={state}
            value={name}
            placeholder='Your full name'
            variant='premium'
            onChange={(e) => updateField('name', e.target.value)}
            required
          />

          {/* Email Input */}
          <Input
            type='email'
            label='Email Address'
            name='email'
            state={state}
            value={email}
            placeholder='you@example.com'
            variant='premium'
            onChange={(e) => updateField('email', e.target.value)}
            required
          />

          {/* Phone Input */}
          <Input
            type='tel'
            label='Phone Number'
            name='phone'
            state={state}
            value={phone}
            placeholder='+211 900 000 000'
            variant='premium'
            onChange={(e) => updateField('phone', e.target.value)}
            required
          />

          {/* Turnstile */}
          <div className='py-4'>
            <TurnstileWidget
              onVerify={(t) => {
                updateField('token', t);
              }}
            />
          </div>

          {/* Terms */}
          <Checkbox
            id='terms'
            name='termsAccepted'
            state={state}
            variant='premium'
            onChange={(e) => updateField('termsAccepted', e.target.checked)}
            required
            label={
              <span className='leading-relaxed'>
                I agree to the{' '}
                <Link
                  href='/terms-of-use'
                  target='_blank'
                  className='text-white border-b border-white/20 pb-0.5 hover:text-primary hover:border-primary transition-colors'
                  onClick={(e) => e.stopPropagation()}
                >
                  Terms &amp; Conditions
                </Link>{' '}
                and understand the deposit policy (50% required to confirm
                booking).
              </span>
            }
          />
        </div>
      </div>
    </LocomotiveScrollSection>
  );
}
