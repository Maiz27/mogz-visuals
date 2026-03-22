'use client';
import Image from 'next/image';
import { useEffect } from 'react';
import { useBookingStore } from '@/lib/stores/bookingStore';
import { useBookingDataStore } from '@/lib/stores/bookingDataStore';
import { BOOKING_FALLBACK_IMAGES } from '@/lib/Constants';

import { CategorySkeleton } from '../BookingSkeletons';
import LocomotiveScrollSection from '../../locomotiveScrollSection/LocomotiveScrollSection';

export default function Step1_Category() {
  const categoryId = useBookingStore((s) => s.categoryId);
  const selectCategory = useBookingStore((s) => s.selectCategory);
  const { categoryList, loadingList, listError, fetchCategoryDetails } =
    useBookingDataStore();

  // Prefetch details for selected category immediately on select
  useEffect(() => {
    if (categoryId) {
      fetchCategoryDetails(categoryId);
    }
  }, [categoryId, fetchCategoryDetails]);

  // Build rows of 2 for the asymmetric layout
  const rows: (typeof categoryList)[] = [];
  for (let i = 0; i < categoryList.length; i += 2) {
    rows.push(categoryList.slice(i, i + 2));
  }

  // Skeleton rows while loading (show 9 placeholder tiles = 5 rows)
  const SKELETON_COUNT = 10;
  const skeletonRows: number[][] = [];
  for (let i = 0; i < SKELETON_COUNT; i += 2) {
    skeletonRows.push([i, i + 1].filter((n) => n < SKELETON_COUNT));
  }

  if (listError) {
    return (
      <LocomotiveScrollSection className='pb-32 px-4 sm:px-8 max-w-7xl mx-auto'>
        <div className='py-24 text-center border border-red-500/20 bg-red-950/10'>
          <p className='text-red-300 font-body text-sm uppercase tracking-widest'>
            {listError}
          </p>
        </div>
      </LocomotiveScrollSection>
    );
  }

  return (
    <LocomotiveScrollSection className='pb-32 px-4 sm:px-8 max-w-7xl mx-auto'>
      {/* Editorial Header */}
      <div className='flex flex-col md:flex-row md:justify-between md:items-end gap-8 mb-12 md:mb-16 mt-4 md:mt-8'>
        <div className='max-w-2xl'>
          <h1 className='text-5xl md:text-7xl font-heading text-copy/90 tracking-tight leading-none mb-4'>
            Book a <br className='hidden md:block' />
            <span className='text-primary italic font-medium'>Session</span>
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

      <div className='flex flex-col mb-12 w-full'>
        {loadingList
          ? skeletonRows.map((row, rIdx) => (
              <div
                key={rIdx}
                className='flex flex-col md:flex-row w-full gap-6 lg:gap-8 mb-6 lg:mb-8 h-auto md:h-100'
              >
                {row.map((idx) => (
                  <CategorySkeleton key={idx} index={idx} />
                ))}
              </div>
            ))
          : rows.map((row, rIdx) => (
              <div
                key={rIdx}
                className='flex flex-col md:flex-row w-full gap-6 lg:gap-8 mb-6 lg:mb-8 h-auto md:h-100'
              >
                {row.map((category, cIdx) => {
                  const isFirstSmall = rIdx % 2 === 0;
                  const widthClass = isFirstSmall
                    ? cIdx === 0
                      ? 'md:w-[40%]'
                      : 'md:w-[60%]'
                    : cIdx === 0
                      ? 'md:w-[60%]'
                      : 'md:w-[40%]';

                  const index = rIdx * 2 + cIdx;
                  const isSelected = categoryId === category.id;
                  // Use Sanity image if available, fall back to hardcoded map
                  const imgSrc =
                    category.image ??
                    BOOKING_FALLBACK_IMAGES[category.id] ??
                    '';

                  return (
                    <button
                      key={category.id}
                      onClick={() => {
                        selectCategory(category.id);
                        // Prefetch immediately on click so data is ready before Continue
                        fetchCategoryDetails(category.id);
                      }}
                      className={`
                      group relative block w-full text-left overflow-hidden 
                      focus:outline-none focus:ring-1 focus:ring-primary/50
                      border transition-all duration-700
                      h-70 md:h-full ${widthClass} cursor-pointer
                      ${isSelected ? 'border-primary shadow-[0_0_30px_rgba(251,198,129,0.15)] z-10 scale-[1.02]' : 'border-transparent hover:border-primary/50 scale-100 z-0'}
                    `}
                    >
                      {/* Image Container */}
                      <div className='absolute inset-0 bg-background'>
                        {imgSrc && (
                          <Image
                            src={imgSrc}
                            alt={category.name}
                            fill
                            sizes='(max-width: 768px) 100vw, 50vw'
                            className={`object-cover transition-all duration-[1.5s] ease-out group-hover:scale-[1.03] ${isSelected ? 'opacity-100 grayscale-0' : 'opacity-50 grayscale group-hover:opacity-80 group-hover:grayscale-0'}`}
                          />
                        )}
                        {/* Glass morphic Floating Label */}
                        <div
                          className={`absolute bottom-6 left-6 
                          backdrop-blur-md 
                          border transition-all duration-700
                          px-5 py-3 md:px-6 md:py-4
                          min-w-32 md:min-w-48
                          ${isSelected ? 'bg-[#1c1b1b]/95 border-primary shadow-[0_4px_20px_rgba(0,0,0,0.5)]' : 'bg-[#1c1b1b]/80 border-white/5 group-hover:border-primary/30'}
                        `}
                        >
                          <span className='block text-primary font-body text-[10px] tracking-[0.2em] uppercase font-semibold mb-1'>
                            {(index + 1).toString().padStart(2, '0')}
                          </span>
                          <h3 className='text-white font-heading text-lg md:text-xl tracking-tight'>
                            {category.name}
                          </h3>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
      </div>
    </LocomotiveScrollSection>
  );
}
