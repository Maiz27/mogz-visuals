import { useBookingStore } from '@/lib/stores/bookingStore';
import { useBookingDataStore } from '@/lib/stores/bookingDataStore';
import { toBookingMetaMap } from '@/lib/booking';
import { AddOnSkeleton } from '../BookingSkeletons';
import BookingNavigation from '../BookingNavigation';
import LocomotiveScrollSection from '../../locomotiveScrollSection/LocomotiveScrollSection';

export default function Step3_AddOns() {
  const selections = useBookingStore((s) => s.selections);
  const toggleAddOn = useBookingStore((s) => s.toggleAddOn);
  const prevStep = useBookingStore((s) => s.prevStep);

  const { categoryList, categoryDetails, loadingDetail } =
    useBookingDataStore();
  const categoryMetaMap = toBookingMetaMap(categoryList);

  return (
    <LocomotiveScrollSection className='pb-32 px-4 sm:px-8 max-w-7xl mx-auto'>
      <div className='w-full'>
        <div className='mb-16 mt-4 md:mt-8 flex flex-col md:flex-row md:justify-between md:items-end gap-8'>
          <div className='max-w-2xl'>
            <BookingNavigation
              onBack={prevStep}
              backLabel='Return to Packages'
            />

            <h2 className='text-4xl md:text-6xl font-heading text-white font-normal mb-0 tracking-tight'>
              <span className='text-[0.6em] md:text-[0.5em] tracking-widest uppercase font-body text-secondary block mb-4'>
                Optional Enhancements
              </span>
              Curate your add-ons
            </h2>
          </div>

          <div className='max-w-md text-secondary font-body text-base xl:text-lg leading-relaxed mb-1 md:mb-2'>
            Choose add-ons per service. Each selection stays scoped to its own
            category so bundles remain easy to review later.
          </div>
        </div>

        <div className='space-y-24'>
          {selections.map((selection) => {
            const category = categoryDetails[selection.categoryId];
            const categoryMeta = categoryMetaMap[selection.categoryId];
            const isLoading = !!loadingDetail[selection.categoryId];
            const addOns = category?.addOns ?? [];
            const selectedPackage =
              category?.packages.find(
                (pkg) => pkg.id === selection.packageId,
              ) ?? null;

            return (
              <section
                key={selection.categoryId}
                className='space-y-6 last:mb-12'
              >
                <div className='flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6'>
                  <div>
                    <span className='block text-primary text-[10px] tracking-[0.2em] uppercase font-body font-semibold mb-3'>
                      {category?.shortName ??
                        categoryMeta?.shortName ??
                        'Service'}
                    </span>
                    <h3 className='text-2xl md:text-4xl font-heading text-white tracking-tight'>
                      {category?.name ??
                        categoryMeta?.name ??
                        'Selected Service'}
                    </h3>
                  </div>
                  <span className='max-w-md text-secondary font-body text-base leading-relaxed'>
                    {selectedPackage
                      ? `Selected package: ${selectedPackage.name}`
                      : 'Optional enhancements for this service.'}
                  </span>
                </div>

                {isLoading ? (
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {[...Array(3)].map((_, i) => (
                      <AddOnSkeleton key={i} />
                    ))}
                  </div>
                ) : addOns.length === 0 ? (
                  <div className='py-16 text-center border border-white/5 bg-surface'>
                    <p className='text-secondary font-body text-lg uppercase tracking-widest'>
                      No add-ons available for this service.
                    </p>
                  </div>
                ) : (
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {addOns.map((addOn) => {
                      const isSelected = selection.addOnIds.includes(addOn.id);

                      return (
                        <button
                          key={addOn.id}
                          type='button'
                          onClick={() =>
                            toggleAddOn(selection.categoryId, addOn.id)
                          }
                          className={`
                            group relative text-left overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] outline-none p-6 md:p-8 flex flex-col justify-between min-h-40 border cursor-pointer
                            ${isSelected ? 'scale-[1.02] shadow-[0_20px_40px_rgba(0,0,0,0.6)] z-10 bg-surface-hover border-primary' : 'scale-100 hover:scale-[1.01] hover:shadow-[0_15px_30px_rgba(0,0,0,0.4)] z-0 bg-surface border-white/5 hover:bg-surface-hover hover:border-primary/30'}
                          `}
                        >
                          {isSelected && (
                            <div className='absolute -inset-[50%] bg-[radial-gradient(circle_at_center,rgba(251,198,129,0.06)_0%,transparent_50%)] pointer-events-none' />
                          )}

                          <div className='flex justify-between items-start mb-8 relative z-10'>
                            <div
                              className={`w-5 h-5 border flex items-center justify-center transition-all duration-500 rounded-sm ${isSelected ? 'border-primary bg-primary/10' : 'border-white/20 group-hover:border-primary/50'}`}
                            >
                              <div
                                className={`w-2 h-2 bg-primary transition-all duration-500 scale-0 ${isSelected ? 'scale-100' : ''}`}
                              />
                            </div>

                            <div className='text-right shrink-0 pl-4'>
                              <span
                                className={`text-2xl font-heading leading-none ${isSelected ? 'text-primary' : 'text-white group-hover:text-primary/80'} transition-colors duration-500`}
                              >
                                +${addOn.price}
                              </span>
                            </div>
                          </div>

                          <div className='relative z-10 mt-auto'>
                            <h4 className='text-lg md:text-xl font-heading text-white mb-2 leading-tight pr-2'>
                              {addOn.name}
                            </h4>
                            {addOn.description && (
                              <span className='text-secondary font-body leading-relaxed py-2 border-t border-white/5 group-hover:border-primary/20 transition-colors duration-500'>
                                {addOn.description}
                              </span>
                            )}
                          </div>

                          <div
                            className={`absolute left-0 top-0 bottom-0 bg-primary transition-all duration-700 ease-out z-30 ${isSelected ? 'w-1' : 'w-0 group-hover:w-px'}`}
                          />
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </LocomotiveScrollSection>
  );
}
