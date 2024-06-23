import DownloadCollectionModal from '../modals/DownloadCollectionModal';
import ShareCollectionModal from '../modals/ShareCollectionModal';
import { COLLECTION } from '@/lib/types';

type Props = {
  collection: COLLECTION;
};

const GalleryOptions = ({ collection }: Props) => {
  const { isPrivate } = collection;
  return (
    <div className='flex flex-col md:flex-row justify-between md:items-center gap-4 pt-4 lg:pt-8'>
      <div className='ml-1 md:ml-0 flex items-center gap-4'>
        <DownloadCollectionModal collection={collection} />

        {!isPrivate && <ShareCollectionModal collection={collection} />}
      </div>
    </div>
  );
};

export default GalleryOptions;
