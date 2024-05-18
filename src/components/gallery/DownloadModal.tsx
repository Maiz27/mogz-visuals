'use client';
import { useRef } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/form/Input';
import CTAButton from '@/components/ui/CTA/CTAButton';
import { HiArrowDownTray } from 'react-icons/hi2';
import { COLLECTION } from '@/lib/types';
import useDownloadCollection from '@/lib/hooks/useDownloadCollection';

type Props = {
  collection: COLLECTION;
};

const DownloadModal = ({ collection }: Props) => {
  const closeBtn = useRef<HTMLButtonElement>(null);
  const { title, gallery } = collection;
  const { loading, downloadImages } = useDownloadCollection(gallery, title);

  const handleDownload = () => {
    downloadImages();
    closeBtn.current?.click();
  };

  return (
    <Modal
      closeBtn={closeBtn}
      icon={<HiArrowDownTray className='text-lg text-inherit' />}
      CTA='Download'
      classNames='flex flex-col space-y-4'
    >
      <h3 className='w-fit text-primary text-lg lg:text-2xl font-bold tracking-wider'>
        Unlock Your Download
      </h3>
      <span className='lg:tracking-wide'>
        Please enter your email address to access and download this exclusive
        collection. This helps us keep track of downloads and continue providing
        you with high-quality visual content.
      </span>

      <form>
        <Input
          required={true}
          name='email'
          type='email'
          placeholder='Email Address'
        />

        <div className='pt-8 flex justify-end gap-2 md:gap-4'>
          <p>{loading}</p>
          <CTAButton loading={loading} onClick={() => handleDownload()}>
            Download
          </CTAButton>
          <CTAButton
            loading={loading}
            style='ghost'
            onClick={() => closeBtn.current?.click()}
          >
            Cancel
          </CTAButton>
        </div>
      </form>
    </Modal>
  );
};

export default DownloadModal;
