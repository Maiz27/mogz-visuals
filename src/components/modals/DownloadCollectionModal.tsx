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
import RadioGroup from '../ui/form/RadioGroup';

type Props = {
  collection: COLLECTION;
};

const DownloadCollectionModal = ({ collection }: Props) => {
  const closeBtn = useRef<HTMLButtonElement>(null);

  const { loading, segments, downloadChunk, downloadAllChunks } =
    useDownloadCollection(collection);

  const segmentOptions = segments.map((_segment, i) => ({
    label: `Part ${i + 1}`,
    value: i.toString(),
  }));

  const { initialValue, fields, rules } = FORMS.download;
  const { state, errors, handleChange, reset } = useFormState(
    initialValue,
    rules
  );

  const _fields = fields.map((field: any) =>
    field.name === 'segment' ? { ...field, options: segmentOptions } : field
  );

  const handleDownloadSegment = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const segmentIndex = parseInt(state.segment, 10);
    if (!isNaN(segmentIndex)) {
      await downloadChunk(segmentIndex);
    }
    reset();
    closeBtn.current?.click();
  };

  const handleDownloadAll = async () => {
    await downloadAllChunks(state.email.toLowerCase());
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

      <form onSubmit={handleDownloadSegment}>
        {_fields.map((field) => {
          if (field.comp === 'radio') {
            if (segments.length <= 1) return null; // Only show radio if more than one chunk
            return (
              <RadioGroup
                key={field.name}
                state={state}
                errors={errors}
                onChange={handleChange}
                {...field}
              />
            );
          }
          return (
            <Input
              key={field.name}
              state={state}
              errors={errors}
              onChange={handleChange}
              {...field}
            />
          );
        })}

        <div className='pt-8 flex justify-end gap-2 md:gap-4'>
          {segments.length > 1 && (
            <CTAButton
              type='button'
              loading={loading}
              onClick={handleDownloadAll}
            >
              Download All
            </CTAButton>
          )}
          <CTAButton type='submit' loading={loading} style='ghost'>
            {segments.length > 1 ? 'Download Segment' : 'Download'}
          </CTAButton>
        </div>
      </form>
    </Modal>
  );
};

export default DownloadCollectionModal;
