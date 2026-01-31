'use client';
import Input from '@/components/ui/form/Input';
import Textarea from '@/components/ui/form/Textarea';
import CTAButton from '@/components/ui/CTA/CTAButton';
import RadioGroup from '@/components/ui/form/RadioGroup';
import Checkbox from '@/components/ui/form/Checkbox';
import { FORMS } from '@/lib/Constants';
import useFormState from '@/lib/hooks/useFormState';
import { useToast } from '@/lib/context/ToastContext';
import TurnstileWidget from '../ui/TurnstileWidget';
import { useState } from 'react';

const ContactForm = () => {
  const { show } = useToast();
  const { initialValue, fields, rules } = FORMS.contact;
  const { state, errors, loading, handleChange, onSubmit } = useFormState(
    initialValue,
    rules,
  );

  const [token, setToken] = useState('');

  const checkRateLimit = async (id: string): Promise<boolean> => {
    const response = await fetch(`/api/rateLimit?id=${id}`, {
      method: 'GET',
    });
    if (!response.ok) {
      const { message } = await response.json();
      console.log('Rate limit status:', response.status, message);
      show(message, { status: 'error', autoClose: false });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!token) {
      show('Please verify you are human', { status: 'error' });
      return;
    }

    if (!(await checkRateLimit('contact'))) return;

    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...state, token }),
    });

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

        if (field.comp === 'checkbox') {
          return (
            <Checkbox
              key={field.name}
              state={state}
              errors={errors}
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

      <div className='grid space-y-4'>
        <TurnstileWidget onVerify={(t) => setToken(t)} />
        <CTAButton
          loading={loading}
          type='submit'
          className='w-fit'
          disabled={!token}
        >
          Book Session
        </CTAButton>
      </div>
    </form>
  );
};

export default ContactForm;
