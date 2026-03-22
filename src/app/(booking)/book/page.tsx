import { getPageMetadata } from '@/lib/utils';
import BookingPage from '@/components/booking/BookingPage';

export const metadata = getPageMetadata('book');

export default function Page() {
  return <BookingPage />;
}
