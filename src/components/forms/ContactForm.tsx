'use client';
import Input from '@/components/ui/form/Input';
import Textarea from '@/components/ui/form/Textarea';
import CTAButton from '@/components/ui/CTA/CTAButton';
import { CONTACT_FIELDS, FORMS } from '@/lib/Constants';
import useFormState from '@/lib/hooks/useFormState';
import { useToast } from '@/lib/context/ToastContext';

const ContactForm = () => {
  const { show } = useToast();
  const { fields, rules } = FORMS.contact;
  const { state, errors, loading, handleChange, onSubmit } = useFormState(
    fields,
    rules
  );

  const handleSubmit = async () => {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(state),
    });
    console.log('response', response);

    if (response.status === 200) {
      show('Your Message was delivered successfully!', {
        status: 'success',
      });
    } else {
      show('An error occurred while delivering your Message!', {
        status: 'error',
      });
    }
  };

  return (
    <form
      data-scroll
      data-scroll-speed='1'
      data-scroll-target='#contact'
      className='w-full max-w-xl flex flex-col space-y-4'
      onSubmit={(e) => onSubmit(e, handleSubmit)}
    >
      {CONTACT_FIELDS.map(({ type, placeholder, name, required }, i) => {
        if (type === 'textarea') {
          return (
            <Textarea
              key={name}
              name={name}
              state={state}
              errors={errors}
              onChange={handleChange}
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
            state={state}
            errors={errors}
            onChange={handleChange}
            required={required}
            placeholder={placeholder}
          />
        );
      })}
      <div className='grid place-items-center'>
        <CTAButton loading={loading} type='submit' className='w-fit'>
          Send Message
        </CTAButton>
      </div>
    </form>
  );
};

export default ContactForm;
