import { InputHTMLAttributes } from 'react';
import { Label } from './Label';
import { BaseFormFieldProps } from '@/lib/types';

type TextareaProps = InputHTMLAttributes<HTMLTextAreaElement> &
  BaseFormFieldProps;

const Textarea = ({ className, ...props }: TextareaProps) => {
  const { id, label, name, state, errors } = props;
  const value = state
    ? (state[name as keyof typeof state] as unknown as string)
    : ('' as string);

  return (
    <div className='w-full flex flex-col space-y-0.5'>
      <div className='relative my-2 focus-within:text-primary transition-colors'>
        {label && <Label id={id!} label={label} />}
        <textarea
          value={value}
          className={`w-full bg-background border border-copy p-4 tracking-wider focus:outline-primary focus:border-none transition-all ${className}`}
          {...props}
        />
      </div>
      {errors && errors[name as keyof typeof state] && (
        <span className='text-red-600 text-sm'>
          {errors[name as keyof typeof state]}
        </span>
      )}
    </div>
  );
};

export default Textarea;
