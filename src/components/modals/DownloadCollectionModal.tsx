'use client';
import { FormEvent, useRef } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/form/Input';
import CTAButton from '@/components/ui/CTA/CTAButton';
import useFormState from '@/lib/hooks/useFormState';
import useDownloadCollection from '@/lib/hooks/useDownloadCollection';
import { HiArrowDownTray } from 'react-icons/hi2';
import { COLLECTION } from '@/lib/types';
import { FORMS } from '@/lib/Constants';

type Props = {
  collection: COLLECTION;
};

const DownloadCollectionModal = ({ collection }: Props) => {
  const closeBtn = useRef<HTMLButtonElement>(null);

  const { title, gallery } = collection;
  const { error, loading, downloadImages } = useDownloadCollection(
    gallery,
    title
  );

  const { fields, rules } = FORMS.download;
  const { state, errors, handleChange, reset } = useFormState(fields, rules);

  const handleDownload = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    downloadImages();
    if (error) {
      console.log('Message: ', error);
      return;
    }
    reset();
    closeBtn.current?.click();
  };

  const handleCancel = () => {
    reset();
    closeBtn.current?.click();
  };

  return (
    <Modal
      scrollId='collection-header'
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

      <form onSubmit={handleDownload}>
        <Input
          required={true}
          state={state}
          errors={errors}
          onChange={handleChange}
          name='email'
          type='email'
          placeholder='Email Address'
        />

        {error && (
          <span className='text-red-500 pt-4'>
            An error occurred while download the images, please try again later.
          </span>
        )}

        <div className='pt-8 flex justify-end gap-2 md:gap-4'>
          <CTAButton type='submit' loading={loading}>
            Download
          </CTAButton>
          <CTAButton
            loading={loading}
            style='ghost'
            onClick={() => handleCancel()}
          >
            Cancel
          </CTAButton>
        </div>
      </form>
    </Modal>
  );
};

export default DownloadCollectionModal;
