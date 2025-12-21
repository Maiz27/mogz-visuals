'use client';

import Input from '@/components/ui/form/Input';
import { FORMS } from '@/lib/Constants';
import useFormState from '@/lib/hooks/useFormState';
import useSearchCollection from '@/lib/hooks/useSearchCollection';
import { MiniCollectionCard } from '@/components/gallery/CollectionCard';

type Props = {
  onClose: () => void;
};

const SearchContent = ({ onClose }: Props) => {
  const { initialValue, fields, rules } = FORMS.search;
  const { state, errors, handleChange, reset } = useFormState(
    initialValue,
    rules
  );

  const {
    collections,
    loading,
    reset: restCollections,
  } = useSearchCollection(state.name);

  const renderResults = () => {
    if (loading) {
      return (
        <div className='w-full flex flex-col justify-center bg-copy space-y-2 px-2'>
          <div className='h-16 animate-pulse flex items-center gap-4'>
            <div className='h-16 w-20 bg-primary animate-pulse'></div>
            <div className='h-16 w-full bg-primary animate-pulse'></div>
          </div>
          <div className='h-16 animate-pulse flex items-center gap-4'>
            <div className='h-16 w-20 bg-primary animate-pulse'></div>
            <div className='h-16 w-full bg-primary animate-pulse'></div>
          </div>
        </div>
      );
    }

    if (collections.length === 0 && state.name.length >= 3) {
      return (
        <div className='w-full h-12 flex justify-center items-center bg-copy text-background rounded-md mt-4'>
          <span className='lg:text-lg'>No collections matching this name!</span>
        </div>
      );
    }

    if (collections.length > 0) {
      return (
        <div className='w-full flex flex-col gap-2 mt-4 max-h-[60vh] overflow-y-auto'>
          {collections.map((collection) => (
            <MiniCollectionCard
              key={collection.slug.current}
              collection={collection}
            />
          ))}
        </div>
      );
    }
  };

  return (
    <div className='flex flex-col space-y-6 pt-4'>
      <p className='text-copy-light'>
        Type the name of the collection you&apos;re looking for, and we&apos;ll
        show you all matching results.
      </p>

      <div className='flex flex-col space-y-4'>
        {fields.map((field) => (
          <Input
            key={field.name}
            state={state}
            errors={errors}
            onChange={handleChange}
            {...field}
          />
        ))}
      </div>

      {renderResults()}
    </div>
  );
};

export default SearchContent;
