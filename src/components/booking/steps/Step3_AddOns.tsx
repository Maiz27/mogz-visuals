'use client';
import { useBooking } from '../BookingContext';
import { HiArrowLongLeft } from 'react-icons/hi2';

export default function Step3_AddOns() {
  const { selectedCategory, selectedPackage, state, toggleAddOn, prevStep } =
    useBooking();

  const addOns = selectedCategory?.addOns ?? [];

  return (
    <div className='w-full'>
      {/* Editorial Header */}
      <div className='mb-16 mt-4 md:mt-8 flex flex-col md:flex-row md:justify-between md:items-end gap-8'>
        <div className='max-w-2xl'>
          <button
            onClick={prevStep}
            className='group flex items-center gap-2 text-secondary hover:text-primary text-xs font-body tracking-[0.2em] uppercase transition-colors mb-10 outline-none'
          >
            <HiArrowLongLeft className='text-2xl transition-transform group-hover:-translate-x-1.5' />
            Return to Package Selection
          </button>

          <h2 className='text-4xl md:text-6xl font-heading text-white font-normal mb-0 tracking-tight'>
            <span className='text-[0.6em] md:text-[0.5em] tracking-widest uppercase font-body text-secondary block mb-4'>
              Enhance your Session
            </span>
            Curate your Add-Ons
          </h2>
        </div>

        <div className='max-w-md text-secondary font-body text-base xl:text-lg leading-relaxed mb-1 md:mb-2'>
          Tailor your {selectedPackage?.name || 'session'} with our bespoke
          optional enhancements to ensure every detail is captured perfectly.
        </div>
      </div>

      {addOns.length === 0 ? (
        <div className='py-24 text-center border border-white/5 bg-surface'>
          <p className='text-secondary font-body text-lg uppercase tracking-widest'>
            No add-ons available for this package.
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-32'>
          {addOns.map((addOn) => {
            const isSelected = state.addOnIds.includes(addOn.id);

            return (
              <button
                key={addOn.id}
                onClick={() => toggleAddOn(addOn.id)}
                className={`
                  group relative text-left overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] outline-none p-6 md:p-8 flex flex-col justify-between min-h-40 border
                  ${isSelected ? 'scale-[1.02] shadow-[0_20px_40px_rgba(0,0,0,0.6)] z-10 bg-surface-hover border-primary' : 'scale-100 hover:scale-[1.01] hover:shadow-[0_15px_30px_rgba(0,0,0,0.4)] z-0 bg-surface border-white/5 hover:bg-surface-hover hover:border-primary/30'}
                `}
              >
                {/* Highlight flare */}
                {isSelected && (
                  <div className='absolute -inset-[50%] bg-[radial-gradient(circle_at_center,rgba(251,198,129,0.06)_0%,transparent_50%)] pointer-events-none' />
                )}

                <div className='flex justify-between items-start mb-8 relative z-10'>
                  {/* Custom Checkbox */}
                  <div
                    className={`w-5 h-5 border flex items-center justify-center transition-all duration-500 rounded-sm ${isSelected ? 'border-primary bg-primary /10' : 'border-white/20 group-hover:border-primary/50'}`}
                  >
                    <div
                      className={`w-2 h-2 bg-primary transition-all duration-500 scale-0 ${isSelected ? 'scale-100' : ''}`}
                    />
                  </div>

                  {/* Price */}
                  <div className='text-right shrink-0 pl-4'>
                    <span
                      className={`text-2xl font-heading leading-none ${isSelected ? 'text-primary' : 'text-white group-hover:text-primary/80'} transition-colors duration-500`}
                    >
                      +${addOn.price}
                    </span>
                  </div>
                </div>

                <div className='relative z-10 mt-auto'>
                  <h3 className='text-xl md:text-2xl font-heading text-white mb-2 leading-tight pr-2'>
                    {addOn.name}
                  </h3>
                  {addOn.description && (
                    <p className='text-secondary text-xs font-body leading-relaxed mt-3 pt-3 border-t border-white/5 group-hover:border-primary/20 transition-colors duration-500'>
                      {addOn.description}
                    </p>
                  )}
                </div>

                {/* Left gold accent line */}
                <div
                  className={`absolute left-0 top-0 bottom-0 bg-primary transition-all duration-700 ease-out z-30 ${isSelected ? 'w-1' : 'w-0 group-hover:w-px'}`}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
