'use client';
import Input from '@/components/ui/form/Input';
import Textarea from '@/components/ui/form/Textarea';
import CTAButton from '@/components/ui/CTA/CTAButton';
import RadioGroup from '@/components/ui/form/RadioGroup';
import { FORMS } from '@/lib/Constants';
import useFormState from '@/lib/hooks/useFormState';
import { useToast } from '@/lib/context/ToastContext';

const ContactForm = () => {
  const { show } = useToast();
  const { initialValue, fields, rules } = FORMS.contact;
  const { state, errors, loading, handleChange, onSubmit } = useFormState(
    initialValue,
    rules
  );

  const handleSubmit = async () => {
    console.log('state', state);
    const date = new Date(state.date);
    console.log('date', date);

    // const response = await fetch('/api/contact', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(state),
    // });
    // console.log('response', response);

    // if (response.status === 200) {
    //   show('Your Message was delivered successfully!', {
    //     status: 'success',
    //   });
    // } else {
    //   show('An error occurred while delivering your Message!', {
    //     status: 'error',
    //   });
    // }
  };

  return (
    <form
      data-scroll
      data-scroll-speed='1'
      data-scroll-target='#contact'
      className='w-full max-w-xl flex flex-col space-y-4'
      onSubmit={(e) => onSubmit(e, handleSubmit)}
    >
      {fields.map((field, i) => {
        if (field.comp === 'textarea') {
          return (
            <Textarea
              key={field.name}
              state={state}
              errors={errors}
              onChange={handleChange}
              className='h-28 resize-y'
              {...field}
            />
          );
        }

        if (field.comp === 'radio') {
          return (
            <RadioGroup
              key={field.name}
              state={state}
              errors={errors}
              options={field.options!}
              onChange={handleChange}
              {...field}
            />
          );
        }

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

      <div className='grid place-items-center'>
        <CTAButton loading={loading} type='submit' className='w-fit'>
          Book Session
        </CTAButton>
      </div>
    </form>
  );
};

export default ContactForm;
