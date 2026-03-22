import { Skeleton } from '@/components/ui/Skeleton';

// ─── Step 1: Category Skeleton ────────────────────────────────────────────────
export function CategorySkeleton({ index }: { index: number }) {
  const isFirstSmall = Math.floor(index / 2) % 2 === 0;
  const posInRow = index % 2;
  const widthClass = isFirstSmall
    ? posInRow === 0
      ? 'md:w-[40%]'
      : 'md:w-[60%]'
    : posInRow === 0
      ? 'md:w-[60%]'
      : 'md:w-[40%]';

  return (
    <div
      className={`relative block w-full overflow-hidden border border-white/5 h-70 md:h-full ${widthClass}`}
    >
      <Skeleton className='absolute inset-0 bg-surface' />
      <div className='absolute bottom-6 left-6 bg-surface-hover/80 backdrop-blur-md border border-white/10 px-5 py-3 md:px-6 md:py-4 min-w-32 md:min-w-48'>
        <Skeleton className='w-6 h-2 mb-2 opacity-20' />
        <Skeleton className='w-32 h-4 opacity-20' />
      </div>
    </div>
  );
}

// ─── Step 2: Package Skeleton ─────────────────────────────────────────────────
export function PackageSkeleton() {
  return (
    <div className='relative overflow-hidden border border-white/5 bg-surface'>
      <div className='p-8 sm:p-12 h-full flex flex-col justify-between min-h-95'>
        <div className='flex flex-col sm:flex-row justify-between sm:items-start gap-8 sm:gap-4 mb-20'>
          <div className='flex flex-col order-2 sm:order-1 gap-3'>
            <Skeleton className='w-16 h-2 opacity-20' />
            <Skeleton className='w-40 h-6 opacity-20' />
          </div>
          <div className='flex flex-col sm:items-end order-1 sm:order-2 gap-3'>
            <Skeleton className='w-24 h-10 opacity-20' />
            <Skeleton className='w-32 h-4 opacity-20' />
          </div>
        </div>
        <div className='border-t border-white/5 pt-8 mt-auto flex flex-col gap-3'>
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className='w-full h-2.5 opacity-10' />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Step 3: Add-on Skeleton ──────────────────────────────────────────────────
export function AddOnSkeleton() {
  return (
    <div className='relative overflow-hidden border border-white/5 bg-surface p-6 md:p-8 flex flex-col justify-between min-h-40'>
      <div className='flex justify-between items-start mb-8'>
        <Skeleton className='w-5 h-5 rounded-sm opacity-20' />
        <Skeleton className='w-16 h-7 opacity-20' />
      </div>
      <div className='flex flex-col gap-2 mt-auto'>
        <Skeleton className='w-40 h-5 opacity-20' />
        <Skeleton className='w-full h-2.5 opacity-10' />
      </div>
    </div>
  );
}
