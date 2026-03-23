import BookingHeader from '@/components/booking/BookingHeader';
import { ScrollProvider } from '@/lib/context/scrollContext';

/**
 * (booking) group layout — standalone booking shell.
 * Uses ScrollContext and project-standard data-scroll-container pattern.
 */
export default function BookingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ScrollProvider>
      <div data-scroll-container className='relative min-h-screen bg-background text-copy'>
        <BookingHeader />
        {children}
      </div>
    </ScrollProvider>
  );
}
