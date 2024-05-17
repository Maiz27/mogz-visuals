import Input from '@/components/ui/form/Input';
import CTAButton from '@/components/ui/CTA/CTAButton';

const CollectionIdForm = () => {
  return (
    <>
      <form className='pt-4 flex flex-col md:flex-row justify-center items-center gap-4'>
        <Input
          name='collection'
          placeholder='Enter collection id'
          required={true}
          className='w-min'
        />
        <CTAButton>Open Collection</CTAButton>
      </form>
    </>
  );
};

export default CollectionIdForm;
