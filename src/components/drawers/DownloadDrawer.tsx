'use client';

import { FormEvent, useState } from 'react';
import Input from '@/components/ui/form/Input';
import CTAButton from '@/components/ui/CTA/CTAButton';
import useFormState from '@/lib/hooks/useFormState';
import useDownloadCollection from '@/lib/hooks/useDownloadCollection';
import { COLLECTION } from '@/lib/types';
import { FORMS } from '@/lib/Constants';
import Progress from '@/components/ui/Progress';
import {
  HiChevronDoubleLeft,
  HiOutlineArrowDownTray,
  HiOutlineCheck,
} from 'react-icons/hi2';
import CollectionDrawerHeader from '../gallery/CollectionDrawerHeader';

type Props = {
  onClose: () => void;
  collection: COLLECTION;
};

type Step = 'email' | 'choice' | 'download_parts' | 'download_stream';

const DownloadContent = ({ collection }: Props) => {
  const [step, setStep] = useState<Step>('email');
  const [isPreparingStream, setIsPreparingStream] = useState(false);

  const stepNumber = step === 'email' ? 1 : step === 'choice' ? 2 : 3;

  const handleBack = () => {
    switch (step) {
      case 'email':
        break;
      case 'choice':
        setStep('email');
        break;
      case 'download_parts':
      case 'download_stream':
        setStep('choice');
        break;
    }
  };

  const {
    loading,
    segments,
    downloadChunk,
    current,
    total,
    progress,
    downloadStream,
  } = useDownloadCollection(collection);

  const { initialValue, fields, rules } = FORMS.download;
  const { state, errors, handleChange, reset } = useFormState(
    initialValue,
    rules,
  );

  const handleEmailSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!state.email || errors.email) return;
    setStep('choice');
  };

  const handleFullDownload = async () => {
    setStep('download_stream');
    setIsPreparingStream(true);
    try {
      await downloadStream(state.email.toLowerCase());
    } finally {
      setIsPreparingStream(false);
    }
  };

  const handlePartDownload = async (index: number) => {
    await downloadChunk(index);
  };

  const overallProgress =
    total <= 1 ? progress : ((current - 1) / total) * 100 + progress / total;

  return (
    <div className='flex flex-col h-full gap-4'>
      <CollectionDrawerHeader collection={collection} />

      {/* Step Navigation */}
      <div className='flex justify-between items-center text-gray-500'>
        <button
          onClick={handleBack}
          className='text-xl hover:text-primary transition-colors hover:cursor-pointer disabled:cursor-not-allowed'
          aria-label='Go back'
          disabled={step === 'email'}
        >
          <HiChevronDoubleLeft />
        </button>

        <span className='text-sm font-medium'>Step {stepNumber} of 3</span>
      </div>

      {/* Step 1: Email */}
      {step === 'email' && (
        <form
          onSubmit={handleEmailSubmit}
          className='h-full flex flex-col justify-between'
        >
          <div className='space-y-4'>
            <p className='text-lg!'>
              Please enter your email address to access and download this
              exclusive collection.
            </p>
            {fields.map((field) => {
              if (field.name !== 'email') return null;
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
          </div>
          <CTAButton type='submit'>Next</CTAButton>
        </form>
      )}

      {/* Step 2: Choice */}
      {step === 'choice' && (
        <div className='h-full flex flex-col justify-between'>
          {loading ? (
            <div className='flex flex-col items-center py-8 gap-2'>
              <span className='loading loading-spinner text-primary'></span>
              <span className='text-sm '>Loading options...</span>
            </div>
          ) : (
            <>
              <p className='text-lg!'>
                Your download is ready! Select an option below to download.
              </p>
              <div className='space-y-2'>
                <CTAButton
                  style='primary'
                  onClick={handleFullDownload}
                  className='w-full'
                >
                  Download Full Collection (Zip)
                </CTAButton>

                <CTAButton
                  onClick={() => setStep('download_parts')}
                  className='w-full'
                  disabled={segments.length <= 1}
                >
                  Or download in parts (Legacy)
                </CTAButton>
              </div>
            </>
          )}
        </div>
      )}

      {/* Step 3: Stream Flow */}
      {step === 'download_stream' && (
        <div className='flex flex-col items-center justify-center space-y-6 text-center py-10'>
          {isPreparingStream ? (
            <>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
              <p className='text-lg font-semibold'>Processing Request...</p>
              <p className='text-sm text-gray-500'>
                This might take a few moments for large collections.
              </p>
            </>
          ) : (
            <>
              <div className='h-16 w-16 bg-green-500/20 rounded-full flex items-center justify-center text-green-500 text-3xl'>
                <HiOutlineCheck />
              </div>
              <p className='text-lg font-semibold'>Download Started!</p>
              <p className='text-sm text-gray-500'>
                Your download should begin automatically.
              </p>
              <button
                onClick={() => setStep('download_parts')}
                className='text-primary hover:underline text-sm mt-4'
              >
                Having trouble? Download via Browser
              </button>
            </>
          )}
        </div>
      )}

      {/* Step 4: Parts Flow */}
      {step === 'download_parts' && (
        <div className='flex flex-col space-y-4'>
          <p className=' mb-4'>Select a part to download:</p>
          <div className='grid grid-cols-2 gap-3'>
            {segments.map((_, i) => (
              <button
                key={i}
                onClick={() => handlePartDownload(i)}
                disabled={loading}
                className='border border-border p-3 hover:bg-border/50 text-left transition-colors flex items-center justify-between group disabled:opacity-50 hover:border-primary hover:text-primary cursor-pointer disabled:cursor-not-allowed'
              >
                <span>Part {i + 1}</span>
                <HiOutlineArrowDownTray className='text-primary opacity-0 group-hover:opacity-100 transition-opacity' />
              </button>
            ))}
          </div>

          {loading && (
            <div className='flex flex-col items-center justify-center gap-y-2 mt-4'>
              <Progress value={overallProgress} className='w-full' />
              <span className='text-sm text-gray-500'>
                {current > 0 && total > 1
                  ? `Downloading part ${current} of ${total}...`
                  : `Downloading...`}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DownloadContent;
