'use client';

import { FormEvent } from 'react';
import Input from '@/components/ui/form/Input';
import CTAButton from '@/components/ui/CTA/CTAButton';
import useFormState from '@/lib/hooks/useFormState';
import useDownloadCollection from '@/lib/hooks/useDownloadCollection';
import { formatBytes } from '@/lib/utils';
import { COLLECTION, DownloadStep } from '@/lib/types';
import { FORMS } from '@/lib/Constants';
import Progress from '@/components/ui/Progress';
import {
  HiChevronDoubleLeft,
  HiOutlineArrowDownTray,
  HiOutlineCheck,
  HiOutlineXCircle,
} from 'react-icons/hi2';
import CollectionDrawerHeader from '../gallery/CollectionDrawerHeader';

type Props = {
  onClose: () => void;
  collection: COLLECTION;
};

const DownloadContent = ({ collection }: Props) => {
  const {
    step,
    streamStatus,
    streamError,
    streamProgress,
    loading,
    segments,
    downloadChunk,
    submitEmail,
    goBack,
    setStep,
    current,
    total,
    progress,
    downloadStream,
    downloadSize,
  } = useDownloadCollection(collection);

  const stepNumber = step === 'email' ? 1 : step === 'choice' ? 2 : 3;

  const { initialValue, fields, rules } = FORMS.download;
  const { state, errors, handleChange } = useFormState(initialValue, rules);

  const handleEmailSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!state.email || errors.email) return;
    submitEmail(state.email.toLowerCase());
  };

  const handleFullDownload = async () => {
    await downloadStream(state.email.toLowerCase());
  };

  const handlePartDownload = async (index: number) => {
    await downloadChunk(index);
  };

  const overallProgress =
    total <= 1 ? progress : ((current - 1) / total) * 100 + progress / total;
  const isPreparingStream = streamStatus === 'preparing';
  const isPackingStream = streamStatus === 'packing';
  const isFinalizingStream = streamStatus === 'finalizing';
  const isStartingStream =
    streamStatus === 'ready' || streamStatus === 'starting';
  const hasStartedStream = streamStatus === 'started';
  const hasFailedStream = streamStatus === 'failed';

  return (
    <div className='flex flex-col h-full gap-4'>
      <CollectionDrawerHeader collection={collection} />

      {/* Step Navigation */}
      <div className='flex justify-between items-center text-gray-500'>
        <button
          onClick={goBack}
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
                Choose how you want to download this collection. Full ZIP
                downloads are prepared on the server first so the file is ready
                before your browser starts.
              </p>
              <div className='space-y-2'>
                <CTAButton
                  style='primary'
                  onClick={handleFullDownload}
                  className='w-full'
                >
                  Prepare Full Collection (Zip){' '}
                  {downloadSize !== null && `(~${formatBytes(downloadSize)})`}
                </CTAButton>

                <CTAButton
                  onClick={() => setStep('download_parts' as DownloadStep)}
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
        <div className='flex flex-col items-center justify-center gap-5 text-center py-8 min-h-[22rem]'>
          {isPreparingStream ? (
            <>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
              <span className='block text-2xl font-semibold leading-tight text-copy'>
                Preparing your ZIP...
              </span>
              {streamProgress && (
                <div className='w-full max-w-sm space-y-3'>
                  <Progress value={streamProgress.percent} className='w-full' />
                  <div className='flex flex-col gap-1 text-[0.95rem] leading-relaxed text-gray-500'>
                    <span className='block'>
                      {streamProgress.processedImages} of{' '}
                      {streamProgress.totalImages} images processed (
                      {streamProgress.percent}%)
                    </span>
                    <span className='block'>
                      {streamProgress.addedImages} added,{' '}
                      {streamProgress.failedImages} skipped or failed
                    </span>
                  </div>
                </div>
              )}
              <span className='block max-w-sm text-[0.95rem] leading-relaxed text-gray-500'>
                We&apos;re still pulling files into the archive. Large
                collections can take a little while before the ZIP is ready to
                hand off to your browser.
              </span>
            </>
          ) : isPackingStream ? (
            <>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
              <span className='block text-2xl font-semibold leading-tight text-copy'>
                Packing your ZIP...
              </span>
              {streamProgress && (
                <div className='w-full max-w-sm space-y-3'>
                  <Progress value={streamProgress.percent} className='w-full' />
                  <div className='flex flex-col gap-1 text-[0.95rem] leading-relaxed text-gray-500'>
                    <span className='block'>
                      {streamProgress.packedImages} of{' '}
                      {streamProgress.addedImages} files packed into the ZIP (
                      {streamProgress.percent}%)
                    </span>
                    <span className='block'>
                      {streamProgress.failedImages} skipped or failed during
                      fetch
                    </span>
                  </div>
                </div>
              )}
              <span className='block max-w-sm text-[0.95rem] leading-relaxed text-gray-500'>
                The files have been fetched. We&apos;re writing them into the ZIP
                so the finished archive can be validated before download.
              </span>
            </>
          ) : isFinalizingStream ? (
            <>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
              <span className='block text-2xl font-semibold leading-tight text-copy'>
                Finalizing your ZIP...
              </span>
              {streamProgress && (
                <div className='w-full max-w-sm space-y-3'>
                  <Progress value={100} className='w-full' />
                  <div className='flex flex-col gap-1 text-[0.95rem] leading-relaxed text-gray-500'>
                    <span className='block'>
                      {streamProgress.addedImages} files added to the archive
                    </span>
                    <span className='block'>
                      Sealing the ZIP and saving the finished file before the
                      browser download starts.
                    </span>
                  </div>
                </div>
              )}
              <span className='block max-w-sm text-[0.95rem] leading-relaxed text-gray-500'>
                The image streams are already in. We&apos;re closing the archive
                and making sure the finished ZIP is safe to download.
              </span>
            </>
          ) : isStartingStream ? (
            <>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
              <span className='block text-2xl font-semibold leading-tight text-copy'>
                ZIP ready. Starting download...
              </span>
              <span className='block max-w-sm text-[0.95rem] leading-relaxed text-gray-500'>
                Your browser download will begin as soon as the prepared file is
                handed off.
              </span>
            </>
          ) : hasStartedStream ? (
            <>
              <div className='h-16 w-16 bg-green-500/20 rounded-full flex items-center justify-center text-green-500 text-3xl'>
                <HiOutlineCheck />
              </div>
              <span className='block text-2xl font-semibold leading-tight text-copy'>
                Download started
              </span>
              <span className='block max-w-sm text-[0.95rem] leading-relaxed text-gray-500'>
                Your download{' '}
                {downloadSize !== null && `(~${formatBytes(downloadSize)}) `}has
                been prepared and handed off to your browser.
              </span>
              <button
                onClick={handleFullDownload}
                className='text-primary hover:underline text-sm mt-4'
              >
                Start the download again
              </button>
              <button
                onClick={() => setStep('download_parts' as DownloadStep)}
                className='text-primary hover:underline text-sm'
              >
                Having trouble? Download in parts instead
              </button>
            </>
          ) : hasFailedStream ? (
            <>
              <div className='h-16 w-16 bg-red-500/15 rounded-full flex items-center justify-center text-red-500 text-3xl'>
                <HiOutlineXCircle />
              </div>
              <span className='block text-2xl font-semibold leading-tight text-copy'>
                Download preparation failed
              </span>
              <span className='block max-w-sm text-[0.95rem] leading-relaxed text-gray-500'>
                {streamError ||
                  'We could not prepare a valid ZIP for this collection.'}
              </span>
              <button
                onClick={handleFullDownload}
                className='text-primary hover:underline text-sm mt-4'
              >
                Try preparing the ZIP again
              </button>
              <button
                onClick={() => setStep('download_parts' as DownloadStep)}
                className='text-primary hover:underline text-sm'
              >
                Or download in parts
              </button>
            </>
          ) : (
            <>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
              <span className='block text-2xl font-semibold leading-tight text-copy'>
                Preparing your ZIP...
              </span>
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
