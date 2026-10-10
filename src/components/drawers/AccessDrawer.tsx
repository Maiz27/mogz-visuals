'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useTransitionNavigate } from '@/lib/context/TransitionContext';
import { FormEvent, useEffect } from 'react';
import CTAButton from '@/components/ui/CTA/CTAButton';
import AccessCollectionForm from '@/components/forms/AccessCollectionForm';
import useFormState from '@/lib/hooks/useFormState';
import useVerifyAccess from '@/lib/hooks/useVerifyAccess';
import { FORMS } from '@/lib/Constants';
import CollectionDrawerHeader from '../gallery/CollectionDrawerHeader';
import { COLLECTION } from '@/lib/types';

type Props = {
  onClose: () => void;
  collection?: COLLECTION;
};

const AccessContent = ({ onClose, collection }: Props) => {
  const { navigate } = useTransitionNavigate();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const { initialValue, rules } = FORMS.browse;
  const { state, errors, handleChange, reset } = useFormState(
    { ...initialValue, id: id || '' },
    rules,
  );

  const { response, loading, token, setToken, handleVerifyAccess, reset: resetAccessStore } =
    useVerifyAccess();

  useEffect(() => {
    return () => {
      resetAccessStore();
    };
  }, [resetAccessStore]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const response = await handleVerifyAccess(state);

    if (response.status === 200) {
      // The access cookie is httpOnly and was already set by the server on the
      // verify response, so there is nothing to store client-side.
      reset();
      resetAccessStore();
      onClose(); // Close drawer first
      if (id && pathname === '/private' && id === response.id) {
        window.location.reload();
      } else {
        navigate(`/private?id=${response.id}`);
      }
    }
  };

  return (
    <div className='flex flex-col space-y-6'>
      {collection && <CollectionDrawerHeader collection={collection} />}

      <p className='text-lg!'>
        Enter the collection ID and password to unlock and view this exclusive
        collection.
      </p>

      <AccessCollectionForm
        onSubmit={handleSubmit}
        state={state}
        errors={errors}
        handleChange={handleChange}
        setToken={setToken}
        className='flex flex-col justify-between'
      >
        <div className=''>
          {response && (
            <span
              className={`pt-2 text-sm ${
                response.status === 200 ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {response.message}
            </span>
          )}

          <CTAButton type='submit' loading={loading} disabled={!token}>
            Access Collection
          </CTAButton>
        </div>
      </AccessCollectionForm>
    </div>
  );
};

export default AccessContent;
