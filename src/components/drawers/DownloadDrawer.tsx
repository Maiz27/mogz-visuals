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
  HiOutlineArrowDownTray,
  HiOutlineDocumentDuplicate,
  HiOutlineCheck,
} from 'react-icons/hi2';

type Props = {
  onClose: () => void;
  collection: COLLECTION;
};

type Step = 'email' | 'choice' | 'download_parts' | 'download_stream';

const DownloadContent = ({ onClose, collection }: Props) => {
  const [step, setStep] = useState<Step>('email');
  const [isPreparingStream, setIsPreparingStream] = useState(false);

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
    rules
  );

  const handleEmailSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!state.email || errors.email) return;
    setStep('choice');
  };

  const handleFullDownload = async () => {
    setStep('download_stream');
    setIsPreparingStream(true);
    await downloadStream(state.email.toLowerCase());
    // Simulate "Preparing" delay or wait for stream to start
    setTimeout(() => {
      setIsPreparingStream(false);
    }, 3000);
  };

  const handlePartDownload = async (index: number) => {
    await downloadChunk(index);
  };

  const overallProgress =
    total <= 1 ? progress : ((current - 1) / total) * 100 + progress / total;

  return (
    <div className='flex flex-col h-full space-y-6'>
      {/* Step 1: Email */}
      {step === 'email' && (
        <form onSubmit={handleEmailSubmit} className='flex flex-col space-y-6'>
          <p className='text-copy-light'>
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
          <CTAButton type='submit'>Next</CTAButton>
        </form>
      )}

      {/* Step 2: Choice */}
      {step === 'choice' && (
        <div className='flex flex-col space-y-4'>
          {loading ? (
            <div className='flex flex-col items-center py-8 gap-2'>
              <span className='loading loading-spinner text-primary'></span>
              <span className='text-sm text-copy-light'>
                Loading options...
              </span>
            </div>
          ) : (
            <>
              <CTAButton onClick={handleFullDownload} className='w-full'>
                Download Full Collection (Zip)
              </CTAButton>

              {segments.length > 0 && (
                <button
                  onClick={() => setStep('download_parts')}
                  className='text-primary hover:underline text-sm p-2'
                >
                  Or download in parts (Legacy)
                </button>
              )}
            </>
          )}

          <button
            onClick={() => setStep('email')}
            className='text-gray-500 hover:text-copy text-sm p-2'
          >
            Back
          </button>
        </div>
      )}

      {/* Step 3: Stream Flow */}
      {step === 'download_stream' && (
        <div className='flex flex-col items-center justify-center space-y-6 text-center py-10'>
          {isPreparingStream ? (
            <>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
              <p className='text-lg font-semibold'>
                Preparing your download...
              </p>
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
          <p className='text-copy-light mb-4'>Select a part to download:</p>
          <div className='grid grid-cols-2 gap-3'>
            {segments.map((_, i) => (
              <button
                key={i}
                onClick={() => handlePartDownload(i)}
                disabled={loading}
                className='border border-border p-3 rounded-md hover:bg-border/50 text-left transition-colors flex items-center justify-between group disabled:opacity-50'
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

          <button
            onClick={() => setStep('choice')}
            className='text-gray-500 hover:text-copy text-sm p-2 mt-4'
          >
            Back to options
          </button>
        </div>
      )}
    </div>
  );
};

export default DownloadContent;
