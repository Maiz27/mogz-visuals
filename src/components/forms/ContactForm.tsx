'use client';
import Input from '@/components/ui/form/Input';
import Textarea from '@/components/ui/form/Textarea';
import CTAButton from '@/components/ui/CTA/CTAButton';
import { CONTACT_FIELDS } from '@/lib/Constants';

const ContactForm = () => {
  return (
    <form
      data-scroll
      data-scroll-speed='1'
      data-scroll-target='#contact'
      className='w-full max-w-xl flex flex-col space-y-4'
    >
      {CONTACT_FIELDS.map(({ type, placeholder, name, required }, i) => {
        if (type === 'textarea') {
          return (
            <Textarea
              key={name}
              name={name}
              required={required}
              placeholder={placeholder}
              className='h-64 resize-y'
            />
          );
        }
        return (
          <Input
            key={name}
            name={name}
            type={type}
            required={required}
            placeholder={placeholder}
          />
        );
      })}
      <div className='grid place-items-center'>
        <CTAButton type='submit' className='w-fit'>
          Send Message
        </CTAButton>
      </div>
    </form>
  );
};

export default ContactForm;
