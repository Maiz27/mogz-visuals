'use client';
import { useRef } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/form/Input';
import CTAButton from '../ui/CTA/CTAButton';
import { FORMS } from '@/lib/Constants';
import useFormState from '@/lib/hooks/useFormState';
import { HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import useSearchCollection from '@/lib/hooks/useSearchCollection';
import { MiniCollectionCard } from '../gallery/CollectionCard';

const SearchCollectionModal = () => {
  const closeBtn = useRef<HTMLButtonElement>(null);

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

  const handleCancel = () => {
    reset();
    closeBtn.current?.click();
  };

  const handleClose = () => {
    reset();
    restCollections();
  };

  const render = () => {
    if (loading) {
      return (
        <div className='absolute w-full h-64 flex flex-col justify-center bg-copy space-y-2 px-2'>
          <div className='h-16 animate-pulse flex items-center gap-4'>
            <div className='h-16 w-20 bg-primary animate-pulse'></div>
            <div className='h-16 w-full bg-primary animate-pulse'></div>
          </div>
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
        <div className='absolute w-full h-16 md:h-12 flex justify-center bg-copy text-background'>
          <span className='pt-2 lg:text-lg'>
            No collections matching this name!
          </span>
        </div>
      );
    }

    if (collections.length > 0) {
      return (
        <div className='absolute w-full h-60 flex flex-col overflow-y-scroll z-20'>
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
    <Modal
      scrollId='gallery'
      btnStyle='ghost'
      closeBtn={closeBtn}
      onClose={handleClose}
      icon={<HiOutlineMagnifyingGlass className='text-lg text-inherit' />}
      CTA='Search for Collection'
      classNames='flex flex-col space-y-4'
    >
      <h3 className='w-fit text-primary text-lg lg:text-2xl font-bold tracking-wider'>
        Find Your Collection
      </h3>
      <span className='lg:tracking-wide text-left'>
        {`Type the name of the collection you're looking for, and we'll show you all 
      matching results. Discover and explore our diverse range of visual stories 
      to find the collection that perfectly matches your interests.`}
      </span>

      <form className='flex flex-col justify-center space-y-4'>
        <div className='relative'>
          {fields.map((field, i) => {
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
          {render()}
        </div>

        <div
          className={`${
            collections.length > 2 ? 'pt-48' : 'pt-4'
          } flex justify-end gap-2 md:gap-4 z-10`}
        >
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

export default SearchCollectionModal;
