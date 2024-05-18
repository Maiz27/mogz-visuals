import DownloadModal from './DownloadModal';
import { HiOutlineShare } from 'react-icons/hi2';

type Props = {};

const GalleryOptions = ({}: Props) => {
  return (
    <div className='flex flex-col md:flex-row justify-between md:items-center gap-4 pt-4'>
      <div className='ml-1 md:ml-0 flex items-center gap-4'>
        <DownloadModal />
        <button className='flex items-center gap-1'>
          <HiOutlineShare className='text-lg text-primary' />
          Share
        </button>
      </div>
    </div>
  );
};

export default GalleryOptions;
