'use client';
import { CONTACT_FIELDS } from '@/lib/Constants';
import CTAButton from '../ui/CTA/CTAButton';

const ContactForm = () => {
  const CommonClassName =
    'w-full bg-background border border-copy p-4 tracking-wider focus:outline-primary focus:border-none transition-all';

  return (
    <form className='w-full max-w-xl flex flex-col space-y-4'>
      {CONTACT_FIELDS.map(({ type, placeholder, name, required }, i) => {
        if (type === 'textarea') {
          return (
            <textarea
              key={i}
              name={name}
              required={required}
              placeholder={placeholder}
              className={`h-64 resize-y ${CommonClassName}`}
            />
          );
        }
        return (
          <input
            key={i}
            name={name}
            type={type}
            required={required}
            placeholder={placeholder}
            className={` ${CommonClassName}`}
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
