'use client';
import Image from 'next/image';
import { useMemo } from 'react';
import { useBookingStore } from '@/lib/stores/bookingStore';
import { useBookingDataStore } from '@/lib/stores/bookingDataStore';
import { getSelectableBookingCategoryIds } from '@/lib/booking';
import { BOOKING_FALLBACK_IMAGES } from '@/lib/Constants';

import { CategorySkeleton } from '../BookingSkeletons';
import LocomotiveScrollSection from '../../locomotiveScrollSection/LocomotiveScrollSection';

export default function Step1_Category() {
  const selections = useBookingStore((s) => s.selections);
  const toggleCategory = useBookingStore((s) => s.toggleCategory);
  const { categoryList, loadingList, listError, fetchCategoryDetails } =
    useBookingDataStore();

  const selectedIds = selections.map((selection) => selection.categoryId);
  const selectableCategoryIds = useMemo(
    () =>
      getSelectableBookingCategoryIds(
        selectedIds,
        categoryList.map((category) => category.id),
        Object.fromEntries(
          categoryList.map((category) => [
            category.id,
            category.compatibleCategoryIds,
          ]),
        ),
      ),
    [selectedIds, categoryList],
  );

  const rows: (typeof categoryList)[] = [];
  for (let i = 0; i < categoryList.length; i += 2) {
    rows.push(categoryList.slice(i, i + 2));
  }

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
      <div className='flex flex-col md:flex-row md:justify-between md:items-end gap-8 mb-12 md:mb-16 mt-4 md:mt-8'>
        <div className='max-w-2xl'>
          <h1 className='text-5xl md:text-7xl font-heading text-copy/90 tracking-tight leading-none mb-4'>
            Build your <br className='hidden md:block' />
            <span className='text-primary italic font-medium'>Booking</span>
          </h1>
          <h2 className='text-2xl md:text-3xl text-secondary/80 font-heading italic opacity-90'>
            Choose one service or combine compatible ones.
          </h2>
        </div>
        <div className='max-w-sm md:w-[320px] space-y-4'>
          <span className='block text-secondary text-[10px] md:text-xs tracking-wide leading-loose font-body'>
            Select every category you want included in this request. Services
            can only be combined when Sanity marks them as compatible.
          </span>
          {selectedIds.length > 0 && (
            <p className='text-primary text-[10px] md:text-xs tracking-[0.2em] uppercase font-body font-semibold'>
              {selectedIds.length} service{selectedIds.length > 1 ? 's' : ''}{' '}
              selected
            </p>
          )}
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
                  const isSelected = selectedIds.includes(category.id);
                  const isSelectable = selectableCategoryIds.has(category.id);
                  const imgSrc =
                    category.image ??
                    BOOKING_FALLBACK_IMAGES[category.id] ??
                    '';

                  return (
                    <button
                      key={category.id}
                      type='button'
                      disabled={!isSelectable}
                      onClick={() => {
                        toggleCategory(category.id);
                        if (!isSelected) {
                          fetchCategoryDetails(category.id);
                        }
                      }}
                      className={`
                        group relative block w-full text-left overflow-hidden
                        focus:outline-none focus:ring-1 focus:ring-primary/50
                        border transition-all duration-700
                        h-70 md:h-full ${widthClass} cursor-pointer
                        ${isSelected ? 'border-primary shadow-[0_0_30px_rgba(251,198,129,0.15)] z-10 scale-[1.02]' : 'scale-100 z-0'}
                        ${!isSelected && isSelectable ? 'border-transparent hover:border-primary/50' : ''}
                        ${!isSelectable ? 'opacity-45 cursor-not-allowed border-white/10' : ''}
                      `}
                    >
                      <div className='absolute inset-0 bg-background'>
                        {imgSrc && (
                          <Image
                            src={imgSrc}
                            alt={category.name}
                            fill
                            sizes='(max-width: 768px) 100vw, 50vw'
                            className={`object-cover transition-all duration-[1.5s] ease-out group-hover:scale-[1.03] ${isSelected ? 'opacity-100 grayscale-0' : 'opacity-50 grayscale group-hover:opacity-80 group-hover:grayscale-0'} ${!isSelectable ? 'group-hover:scale-100' : ''}`}
                          />
                        )}

                        <div
                          className={`absolute bottom-6 left-6 backdrop-blur-md border transition-all duration-700 px-5 py-3 md:px-6 md:py-4 min-w-32 md:min-w-48 ${isSelected ? 'bg-[#1c1b1b]/95 border-primary shadow-[0_4px_20px_rgba(0,0,0,0.5)]' : 'bg-[#1c1b1b]/80 border-white/5'} ${isSelectable && !isSelected ? 'group-hover:border-primary/30' : ''}`}
                        >
                          <span className='block text-primary font-body text-[10px] tracking-[0.2em] uppercase font-semibold mb-1'>
                            {(index + 1).toString().padStart(2, '0')}
                          </span>
                          <h3 className='text-white font-heading text-lg md:text-xl tracking-tight'>
                            {category.name}
                          </h3>
                          <p className='mt-3 text-[10px] uppercase tracking-[0.2em] text-secondary font-body'>
                            {isSelected
                              ? 'Selected'
                              : isSelectable
                                ? category.compatibleCategoryIds.length > 0
                                  ? 'Can be combined'
                                  : 'Standalone service'
                                : 'Not compatible'}
                          </p>
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
