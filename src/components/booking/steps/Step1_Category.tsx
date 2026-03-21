'use client';
import Image from 'next/image';
import { BOOKING_DATA } from '@/lib/Constants';
import { useBooking } from '../BookingContext';

export default function Step1_Category() {
  const { state, selectCategory } = useBooking();

  // Create rows of 2 for the asymmetric layout
  const rows = [];
  for (let i = 0; i < BOOKING_DATA.length; i += 2) {
    rows.push(BOOKING_DATA.slice(i, i + 2));
  }

  return (
    <div className='flex flex-col mb-12 w-full'>
      {rows.map((row, rIdx) => (
        <div key={rIdx} className='flex flex-col md:flex-row w-full gap-6 lg:gap-8 mb-6 lg:mb-8 h-auto md:h-100'>
          {row.map((category, cIdx) => {
            // Alternating widths: 
            // Row 0: small | large
            // Row 1: large | small
            const isFirstSmall = rIdx % 2 === 0;
            const widthClass = isFirstSmall 
              ? (cIdx === 0 ? 'md:w-[40%]' : 'md:w-[60%]')
              : (cIdx === 0 ? 'md:w-[60%]' : 'md:w-[40%]');

            // Actual step index
            const index = rIdx * 2 + cIdx;
            const isSelected = state.categoryId === category.id;

            return (
              <button
                key={category.id}
                onClick={() => selectCategory(category.id)}
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
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes='(max-width: 768px) 100vw, 50vw'
                    className={`object-cover transition-all duration-[1.5s] ease-out group-hover:scale-[1.03] ${isSelected ? 'opacity-100 grayscale-0' : 'opacity-50 grayscale group-hover:opacity-80 group-hover:grayscale-0'}`}
                  />
                  {/* Glassmorphic Floating Label - anchored bottom left */}
                  <div className={`absolute bottom-6 left-6 
                    backdrop-blur-md 
                    border transition-all duration-700
                    px-5 py-3 md:px-6 md:py-4
                    min-w-32 md:min-w-48
                    ${isSelected ? 'bg-[#1c1b1b]/95 border-primary shadow-[0_4px_20px_rgba(0,0,0,0.5)]' : 'bg-[#1c1b1b]/80 border-white/5 group-hover:border-primary/30'}
                  `}>
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
  );
}
