'use client';

import { useBookingStore } from '@/lib/stores/bookingStore';
import { useBookingDataStore } from '@/lib/stores/bookingDataStore';
import { useScroll } from '@/lib/context/scrollContext';
import { useEffect, useRef } from 'react';
import BookingHeader from './BookingHeader';
import BookingProgressBar from './BookingProgressBar';
import Step1_Category from './steps/Step1_Category';
import Step2_Package from './steps/Step2_Package';
import Step3_AddOns from './steps/Step3_AddOns';
import Step4_DateTime from './steps/Step4_DateTime';
import Step5_Contact from './steps/Step5_Contact';
import Step6_Confirm from './steps/Step6_Confirm';
import LocomotiveScrollSection from '../locomotiveScrollSection/LocomotiveScrollSection';

const STEPS = [
  Step1_Category,
  Step2_Package,
  Step3_AddOns,
  Step4_DateTime,
  Step5_Contact,
  Step6_Confirm,
];

const STEP_LABELS = ['Service', 'Package', 'Add-Ons', 'Date', 'Details'];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function BookingPage() {
  const step = useBookingStore((s) => s.step);
  const categoryId = useBookingStore((s) => s.categoryId);
  const packageName = useBookingStore((s) => s.packageName);
  const date = useBookingStore((s) => s.date);
  const name = useBookingStore((s) => s.name);
  const email = useBookingStore((s) => s.email);
  const phone = useBookingStore((s) => s.phone);
  const termsAccepted = useBookingStore((s) => s.termsAccepted);
  const token = useBookingStore((s) => s.token);
  const nextStep = useBookingStore((s) => s.nextStep);
  const reset = useBookingStore((s) => s.reset);
  const hydrateFromStorage = useBookingStore((s) => s.hydrateFromStorage);

  const { fetchCategoryList, fetchCategoryDetails, categoryDetails } =
    useBookingDataStore();
  const { scrollInstance } = useScroll();

  // Hydrate state from sessionStorage on first mount
  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  // Fetch the lightweight category list on mount
  useEffect(() => {
    fetchCategoryList();
  }, [fetchCategoryList]);

  // Auto-fetch details if we are deep in the flow and missing data (e.g., after refresh)
  useEffect(() => {
    if (categoryId && !categoryDetails[categoryId]) {
      fetchCategoryDetails(categoryId);
    }
  }, [categoryId, categoryDetails, fetchCategoryDetails]);

  const StepComponent = STEPS[step - 1];
  const contentRef = useRef<HTMLDivElement>(null);

  // Synchronize scroll on step change + content resize
  useEffect(() => {
    if (!scrollInstance) return;

    let isMounted = true;

    // Centerpiece: Robustly update scroll on ANY content shift (important for Step 1 grid and Step 6 mount)
    const ro = new ResizeObserver(() => {
      if (isMounted && scrollInstance) {
        try {
          scrollInstance.update();
        } catch (e) {}
      }
    });

    if (contentRef.current) {
      ro.observe(contentRef.current);
    }

    // Handle the scroll-to-top on step change
    try {
      // Small delay allows the React DOM swap to settle before Locomotive calculates the Top
      setTimeout(() => {
        if (isMounted && scrollInstance) {
          scrollInstance.scrollTo('top', { duration: 0, disableLerp: true });
          scrollInstance.update(); // Final update to be sure
        }
      }, 50);
    } catch (e) {}

    return () => {
      isMounted = false;
      ro.disconnect();
    };
  }, [step, scrollInstance]);

  // Handle flash-free redirect on unmount
  const currentStepRef = useRef(step);
  useEffect(() => {
    currentStepRef.current = step;
  }, [step]);
  useEffect(() => {
    return () => {
      if (currentStepRef.current === 6) {
        reset();
      }
    };
  }, [reset]);

  const canProceed = (() => {
    switch (step) {
      case 1:
        return !!categoryId;
      case 2:
        return !!packageName;
      case 3:
        return true;
      case 4:
        return !!date;
      case 5:
        return (
          name.length > 2 &&
          !!email.match(EMAIL_PATTERN) &&
          phone.length > 4 &&
          termsAccepted &&
          !!token
        );
      default:
        return false;
    }
  })();

  return (
    <main className='relative bg-background selection:bg-primary/30'>
      {/* Editorial Grain Overlay */}
      <div className='fixed inset-0 pointer-events-none z-50 opacity-[0.03] mix-blend-overlay bg-[url(/grain.png)]' />

      <div className='relative flex flex-col'>
        {/* Custom Booking Header (Fixed Navbar substitute) */}
        <BookingHeader />

        {/* Global Navbar Spacer - Ensures all steps clear the fixed header consistently */}
        <LocomotiveScrollSection
          id='booking-spacer'
          className='h-20 md:h-32 w-full shrink-0'
          aria-hidden='true'
        />

        {/* Step content swapped dynamically as independent sections */}
        <div
          id='booking-content'
          ref={contentRef}
          className='relative z-10 w-full'
        >
          <div key={step} className='booking-step-enter'>
            <StepComponent />
          </div>
        </div>

        {/* Fixed Bottom Progress Bar */}
        {step < 6 && (
          <div className='fixed md:sticky bottom-0 left-0 right-0 z-60'>
            <BookingProgressBar
              currentStep={step}
              labels={STEP_LABELS}
              totalSteps={5}
              onNext={nextStep}
              canProceed={canProceed}
            />
          </div>
        )}
      </div>

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
    </main>
  );
}
