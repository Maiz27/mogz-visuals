'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useRef } from 'react';
import Modal from '@/components/ui/Modal';
import CTAButton from '@/components/ui/CTA/CTAButton';
import AccessCollectionForm from '../forms/AccessCollectionForm';
import useFormState from '@/lib/hooks/useFormState';
import useVerifyAccess from '@/lib/hooks/useVerifyAccess';
import { setCollectionAccessCookie } from '@/lib/utils';
import { FORMS } from '@/lib/Constants';
import { HiOutlineLockClosed } from 'react-icons/hi2';

const AccessPrivateCollectionModal = () => {
  const closeBtn = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const { initialValue, rules } = FORMS.browse;
  const { state, errors, handleChange, reset } = useFormState(
    { ...initialValue, id: id || '' },
    rules
  );

  const { response, loading, handleVerifyAccess } = useVerifyAccess();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const response = await handleVerifyAccess(state);

    if (response.status === 200) {
      setCollectionAccessCookie(response.secret);
      reset();
      if (id && pathname === '/private') {
        window.location.reload();
      } else {
        router.push(`/private?id=${response.id}`);
      }
      closeBtn.current?.click();
    }
  };

  const handleCancel = () => {
    reset();
    closeBtn.current?.click();
  };

  return (
    <Modal
      scrollId='collection-header'
      closeBtn={closeBtn}
      icon={<HiOutlineLockClosed className='text-lg text-inherit' />}
      CTA='Access Collection'
      classNames='flex flex-col space-y-4'
    >
      <h3 className='w-fit text-primary text-lg lg:text-2xl font-bold tracking-wider'>
        Access Collection
      </h3>
      <span className='lg:tracking-wide text-left'>
        Enter the collection ID and password to unlock and view this exclusive
        collection. This ensures secure access to private content, allowing you
        to explore our high-quality visuals with confidence.
      </span>

      <AccessCollectionForm
        onSubmit={handleSubmit}
        state={state}
        errors={errors}
        handleChange={handleChange}
        className='flex flex-col justify-center space-y-4'
      >
        {response && (
          <span
            className={`pt-4 ${
              response.status === 200 ? 'text-green-500' : 'text-red-600'
            }`}
          >
            {response.message}
          </span>
        )}

        <div className='pt-4 flex justify-end gap-2 md:gap-4'>
          <CTAButton type='submit' loading={loading}>
            Access Collection
          </CTAButton>
          <CTAButton
            loading={loading}
            style='ghost'
            onClick={() => handleCancel()}
          >
            Cancel
          </CTAButton>
        </div>
      </AccessCollectionForm>
    </Modal>
  );
};

export default AccessPrivateCollectionModal;
