'use client';
import LocomotiveScrollSection from '../locomotiveScrollSection/LocomotiveScrollSection';
import { BookingProvider, useBooking } from './BookingContext';
import BookingProgressBar from './BookingProgressBar';
import Step1_Category from './steps/Step1_Category';
import Step2_Package from './steps/Step2_Package';
import Step3_AddOns from './steps/Step3_AddOns';
import Step4_DateTime from './steps/Step4_DateTime';
import Step5_Contact from './steps/Step5_Contact';
import Step6_Confirm from './steps/Step6_Confirm';
import { HiArrowPath } from 'react-icons/hi2';
import { EMAIL_PATTERN } from '@/lib/Constants';

const STEPS = [
  Step1_Category,
  Step2_Package,
  Step3_AddOns,
  Step4_DateTime,
  Step5_Contact,
  Step6_Confirm,
];

const STEP_LABELS = ['Service', 'Package', 'Add-Ons', 'Date', 'Details'];

import { useScroll } from '@/lib/context/scrollContext';
import { useEffect, useRef } from 'react';

function BookingInner() {
  const { state, reset, nextStep } = useBooking();
  const { scrollInstance } = useScroll();
  const StepComponent = STEPS[state.step - 1];
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollInstance) return;
    let isMounted = true;

    // Immediately snap scroll top on step transition
    try {
      scrollInstance.scrollTo('top', { duration: 0, disableLerp: true });
    } catch (e) {}

    // Ensure Locomotive captures exact bounds of dynamic step elements locally
    if (containerRef.current) {
      const ro = new ResizeObserver(() => {
        if (isMounted && scrollInstance) {
          try {
            scrollInstance.update();
          } catch (e) {}
        }
      });
      ro.observe(containerRef.current);
      return () => {
        isMounted = false;
        ro.disconnect();
      };
    }

    return () => {
      isMounted = false;
    };
  }, [state.step, scrollInstance]);

  const canProceed = (() => {
    switch (state.step) {
      case 1:
        return !!state.categoryId;
      case 2:
        return !!state.packageId;
      case 3:
        return true; // Add-ons are optional
      case 4:
        return !!state.date;
      case 5:
        return (
          state.name.length > 2 &&
          !!state.email.match(EMAIL_PATTERN) &&
          state.phone.length > 4 &&
          state.termsAccepted &&
          !!state.token
        );
      default:
        return false;
    }
  })();

  return (
    <>
      <div id='booking-top' className='relative min-h-screen'>
        {/* Grain overlay */}
        <div
          className='pointer-events-none fixed inset-0 z-0 opacity-[0.03]'
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '200px',
          }}
        />

        <LocomotiveScrollSection className='relative z-10 w-full pt-20 md:pt-32 px-4 sm:px-8 max-w-7xl mx-auto'>
          {/* Step-specific Headers managed globally */}
          {state.step === 1 && (
            <div className='flex flex-col md:flex-row md:justify-between md:items-end gap-8 mb-12 md:mb-16'>
              <div className='max-w-2xl'>
                <h1 className='text-5xl md:text-7xl font-heading text-copy/90 tracking-tight leading-none mb-4'>
                  Book a <br className='hidden md:block' />
                  <span className='text-primary italic font-medium'>
                    Session
                  </span>
                </h1>
                <h2 className='text-2xl md:text-3xl text-secondary/80 font-heading italic opacity-90'>
                  What story are we telling?
                </h2>
              </div>
              <div className='max-w-sm md:w-[320px]'>
                <span className='block text-secondary text-[10px] md:text-xs tracking-wide leading-loose font-body'>
                  Select a category that reflects your vision. Each session is a
                  bespoke collaboration designed to capture the essence of your
                  narrative.
                </span>
              </div>
            </div>
          )}
          {state.step > 1 && state.step < 6 && (
            <div className='flex items-center justify-between mb-12'>
              <h2 className='text-3xl font-heading text-copy/90 tracking-tight'>
                {STEP_LABELS[state.step - 1]}
              </h2>
              <button
                onClick={reset}
                className='flex items-center gap-1.5 text-secondary hover:text-primary text-sm tracking-widest transition-colors font-body'
                title='Start over'
              >
                <HiArrowPath className='text-base' />
                <span className='hidden sm:inline uppercase'>Start Over</span>
              </button>
            </div>
          )}

          {/* Step content sharing the global padding container */}
          <div ref={containerRef} className='relative z-10 w-full px-4 sm:px-8 max-w-7xl mx-auto pt-4'>
            <div key={state.step} className='booking-step-enter'>
              <StepComponent />
            </div>
            
            {/* Explicit Spacer for Locomotive Scroll */}
            <div className='h-32 md:h-48 w-full pointer-events-none' aria-hidden='true' />
          </div>
        </LocomotiveScrollSection>

        {/* Fixed Bottom Progress Bar (Stitch Design) */}
        {state.step < 6 && (
          <BookingProgressBar
            currentStep={state.step}
            labels={STEP_LABELS}
            totalSteps={5}
            onNext={nextStep}
            canProceed={canProceed}
          />
        )}

        <style>{`
        .booking-step-enter {
          animation: booking-slide-in 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes booking-slide-in {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      </div>
    </>
  );
}

export default function BookingPage() {
  return (
    <BookingProvider>
      <BookingInner />
    </BookingProvider>
  );
}
