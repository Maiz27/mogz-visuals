import DownloadCollectionModal from '../modals/DownloadCollectionModal';
import { COLLECTION } from '@/lib/types';
import { HiOutlineShare } from 'react-icons/hi2';
import CTAButton from '../ui/CTA/CTAButton';

type Props = {
  collection: COLLECTION;
};

const GalleryOptions = ({ collection }: Props) => {
  return (
    <div className='flex flex-col md:flex-row justify-between md:items-center gap-4 pt-4 lg:pt-8'>
      <div className='ml-1 md:ml-0 flex items-center gap-4'>
        <DownloadCollectionModal collection={collection} />

        <CTAButton style='ghost' className='flex items-center gap-1'>
          <HiOutlineShare className='text-lg text-inherit' />
          <span>Share</span>
        </CTAButton>
      </div>
    </div>
  );
};

export default GalleryOptions;
