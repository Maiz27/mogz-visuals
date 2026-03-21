import { useBooking } from '../BookingContext';
import { HiArrowLongLeft } from 'react-icons/hi2';

export default function Step2_Package() {
  const { selectedCategory, state, selectPackage, prevStep } = useBooking();

  if (!selectedCategory) return null;

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
            Return to Services
          </button>

          <h2 className='text-4xl md:text-6xl font-heading text-white font-normal mb-0 tracking-tight'>
            <span className='text-[0.6em] md:text-[0.5em] tracking-widest uppercase font-body text-secondary block mb-4'>
              Select your Package
            </span>
            {selectedCategory.name}
          </h2>
        </div>

        <div className='max-w-md text-secondary font-body text-base xl:text-lg leading-relaxed mb-1 md:mb-2'>
          {selectedCategory.description}
        </div>
      </div>

      {/* Package Grid - Luxury aesthetic */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-24'>
        {selectedCategory.packages.map((pkg, idx) => {
          const isSelected = state.packageId === pkg.id;

          return (
            <button
              key={pkg.id}
              onClick={() => selectPackage(pkg.id)}
              className={`
                group relative text-left overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] outline-none
                ${isSelected ? 'scale-[1.02] shadow-[0_20px_40px_rgba(0,0,0,0.8)] z-10' : 'scale-100 hover:scale-[1.01] hover:shadow-[0_15px_30px_rgba(0,0,0,0.4)] z-0'}
              `}
            >
              {/* Core Base Background - darkroom plate */}
              <div
                className={`absolute inset-0 transition-colors duration-700 ${isSelected ? 'bg-surface-hover' : 'bg-surface group-hover:bg-surface-hover'}`}
              />

              {/* Subtle film-flare glow for selected state */}
              {isSelected && (
                <div className='absolute -inset-[50%] bg-[radial-gradient(circle_at_center,rgba(251,198,129,0.06)_0%,transparent_50%)] pointer-events-none' />
              )}

              {/* Ultra-subtle Ghost border vs the Primary Gold Frame */}
              <div
                className={`absolute inset-0 border transition-all duration-700 z-20 ${isSelected ? 'border-primary' : 'border-white/5 group-hover:border-primary/30'}`}
              />

              {/* Left edge gold accent indicating selection status */}
              <div
                className={`absolute left-0 top-0 bottom-0 bg-primary transition-all duration-700 ease-out z-30 ${isSelected ? 'w-1.5' : 'w-0 group-hover:w-1'}`}
              />

              {/* Main Content Area */}
              <div className='relative z-30 p-8 sm:p-12 h-full flex flex-col justify-between'>
                {/* Top Section: Price & Name */}
                <div className='flex flex-col sm:flex-row justify-between sm:items-start gap-8 sm:gap-4 mb-20'>
                  <div className='flex flex-col order-2 sm:order-1'>
                    <span
                      className={`text-xs tracking-[0.25em] font-body uppercase font-bold transition-colors duration-500 mb-3 ${isSelected ? 'text-primary' : 'text-secondary group-hover:text-primary/70'}`}
                    >
                      Package {String(idx + 1).padStart(2, '0')}
                    </span>
                    <h3 className='text-3xl font-heading text-white font-medium pr-4'>
                      {pkg.name}
                    </h3>
                  </div>

                  <div className='flex flex-col sm:items-end order-1 sm:order-2 min-w-0 shrink sm:max-w-[55%]'>
                    <span className='text-5xl sm:text-6xl font-heading text-primary leading-none mb-3'>
                      ${pkg.price.toLocaleString()}
                    </span>
                    {pkg.duration && (
                      <span className='text-copy/90 opacity-70 text-[10px] uppercase font-body tracking-[0.2em] font-semibold border border-white/10 px-3 py-1.5 text-left sm:text-right leading-relaxed'>
                        {pkg.duration}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Section: Insights & Includes Lineup */}
                <div className='border-t border-white/5 pt-8 mt-auto group-hover:border-primary/20 transition-colors duration-700'>
                  {pkg.description && (
                    <p className='text-copy/90 text-base font-body mb-8 font-medium leading-[1.8] opacity-90 max-w-lg'>
                      {pkg.description}
                    </p>
                  )}

                  <ul className='flex flex-col gap-3.5'>
                    {pkg.includes.map((item, i) => (
                      <li
                        key={i}
                        className='flex gap-4 items-start text-sm font-body text-secondary'
                      >
                        <span
                          className={`transition-all duration-500 mt-[0.35rem] block w-1.5 h-1.5 shrink-0 ${isSelected ? 'bg-primary /80 scale-100 rotate-45' : 'bg-white/20 scale-75 group-hover:bg-primary /40 group-hover:scale-100 group-hover:rotate-45'}`}
                        />
                        <span
                          className={`leading-[1.7] transition-colors duration-500 ${isSelected ? 'text-copy/90' : 'group-hover:text-copy/90/80'}`}
                        >
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
