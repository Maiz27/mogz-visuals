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
import Progress from '@/components/ui/Progress';

type Props = {
  collection: COLLECTION;
};

const DownloadCollectionModal = ({ collection }: Props) => {
  const closeBtn = useRef<HTMLButtonElement>(null);

  const {
    loading,
    segments,
    downloadChunk,
    downloadAllChunks,
    progress,
    current,
    total,
  } = useDownloadCollection(collection);

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
    field.name === 'part' ? { ...field, options: segmentOptions } : field
  );

  const handleDownloadSegment = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const segmentIndex = parseInt(state.part, 10);
    if (!isNaN(segmentIndex)) {
      await downloadChunk(segmentIndex);
    }
  };

  const handleDownloadAll = async () => {
    await downloadAllChunks(state.email.toLowerCase());
  };

  const handleCancel = () => {
    reset();
    closeBtn.current?.click();
  };

  const hasSegments = segments.length > 1;

  const overallProgress =
    total <= 1 ? progress : ((current - 1) / total) * 100 + progress / total;

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

      <form onSubmit={handleDownloadSegment} className='space-y-2'>
        {_fields.map((field) => {
          if (field.comp === 'radio') {
            if (!hasSegments) return null; // Only show radio if more than one chunk
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

        <div className='flex flex-col gap-2 pt-8'>
          {loading && (
            <div className='flex flex-col items-center justify-center gap-y-2'>
              <Progress value={overallProgress} className='w-full' />
              <span className='text-sm text-gray-500'>
                {current > 0 && total > 1
                  ? `Downloading part ${current} of ${total}...`
                  : `Downloading...`}
              </span>
            </div>
          )}

          <div className='flex justify-end gap-2 md:gap-4'>
            <CTAButton type='submit' loading={loading}>
              {hasSegments ? 'Download Part' : 'Download'}
            </CTAButton>

            {hasSegments && (
              <CTAButton
                type='button'
                loading={loading}
                style={hasSegments ? 'ghost' : undefined}
                onClick={handleDownloadAll}
              >
                Download All
              </CTAButton>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default DownloadCollectionModal;
