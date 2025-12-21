'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FormEvent } from 'react';
import CTAButton from '@/components/ui/CTA/CTAButton';
import AccessCollectionForm from '@/components/forms/AccessCollectionForm';
import useFormState from '@/lib/hooks/useFormState';
import useVerifyAccess from '@/lib/hooks/useVerifyAccess';
import { setCollectionAccessCookie } from '@/lib/utils';
import { FORMS } from '@/lib/Constants';

type Props = {
  onClose: () => void;
};

const AccessContent = ({ onClose }: Props) => {
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
      onClose(); // Close drawer first
      if (id && pathname === '/private') {
        window.location.reload();
      } else {
        router.push(`/private?id=${response.id}`);
      }
    }
  };

  return (
    <div className='flex flex-col space-y-6 pt-4'>
      <p className='text-copy-light'>
        Enter the collection ID and password to unlock and view this exclusive
        collection.
      </p>

      <AccessCollectionForm
        onSubmit={handleSubmit}
        state={state}
        errors={errors}
        handleChange={handleChange}
        className='flex flex-col space-y-4'
      >
        {response && (
          <span
            className={`pt-2 text-sm ${
              response.status === 200 ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {response.message}
          </span>
        )}

        <div className='pt-6 flex justify-end gap-2 md:gap-4'>
          <CTAButton type='submit' loading={loading}>
            Access Collection
          </CTAButton>
        </div>
      </AccessCollectionForm>
    </div>
  );
};

export default AccessContent;
