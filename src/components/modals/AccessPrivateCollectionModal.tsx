'use client';
import { useRouter } from 'next/navigation';
import { FormEvent, useRef } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/form/Input';
import CTAButton from '@/components/ui/CTA/CTAButton';
import useFormState from '@/lib/hooks/useFormState';
import useVerifyAccess from '@/lib/hooks/useVerifyAccess';
import { FORMS } from '@/lib/Constants';
import { HiOutlineLockClosed } from 'react-icons/hi2';
import { setCollectionAccessCookie } from '@/lib/utils';

const AccessPrivateCollectionModal = () => {
  const closeBtn = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  const { fields, rules } = FORMS.browse;
  const { state, errors, handleChange, reset } = useFormState(fields, rules);

  const { response, loading, handleVerifyAccess } = useVerifyAccess();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const response = await handleVerifyAccess(state);

    if (response.status === 200) {
      setCollectionAccessCookie(response.encryptedSlug);
      router.push(`/private?slug=${response.slug}`);
      reset();
    }
  };

  const handleCancel = () => {
    reset();
    closeBtn.current?.click();
  };

  return (
    <Modal
      scrollId='gallery'
      closeBtn={closeBtn}
      icon={<HiOutlineLockClosed className='text-lg text-inherit' />}
      CTA='Access Private Collection'
      classNames='flex flex-col space-y-4'
    >
      <h3 className='w-fit text-primary text-lg lg:text-2xl font-bold tracking-wider'>
        Access Private Collection
      </h3>
      <span className='lg:tracking-wide text-left'>
        Enter the collection ID and password to unlock and view this exclusive
        collection. This ensures secure access to private content, allowing you
        to explore our high-quality visuals with confidence.
      </span>

      <form
        onSubmit={handleSubmit}
        className='flex flex-col justify-center space-y-4'
      >
        <div className='flex flex-col md:flex-row items-center gap-2'>
          <Input
            required={true}
            name='id'
            state={state}
            errors={errors}
            onChange={handleChange}
            placeholder='Collection ID'
          />
          <Input
            required={true}
            name='password'
            type='password'
            state={state}
            errors={errors}
            onChange={handleChange}
            placeholder='Collection Password'
          />
        </div>

        {response && (
          <span
            className={`pt-4 ${
              response.status === 200 ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {response.message}
          </span>
        )}

        <div className='pt-4 flex justify-end gap-2 md:gap-4'>
          <CTAButton type='submit' loading={loading}>
            Browse Collection
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

export default AccessPrivateCollectionModal;
