import { InputHTMLAttributes } from 'react';
import { Label } from './Label';
import { BaseFormFieldProps } from '@/lib/types';
import { formatDateTimeForInput, setInputMinDate } from '@/lib/utils';

type InputProps = InputHTMLAttributes<HTMLInputElement> & BaseFormFieldProps;

const dateTypes = ['date', 'datetime-local'];

const Input = ({ className, ...props }: InputProps) => {
  const { id, type, label, name, state, errors, required } = props;
  const value = state
    ? (state[name as keyof typeof state] as unknown as string)
    : ('' as string);

  const isDate = dateTypes.includes(type!);

  return (
    <div className='w-full flex flex-col space-y-0.5'>
      <div className='relative my-2 focus-within:text-primary transition-colors'>
        {label && (
          <Label id={id!} label={label} className='absolute -top-3 ml-2 px-2' />
        )}
        <input
          value={isDate ? formatDateTimeForInput(value) : value}
          className={`w-full bg-background border border-copy p-4 py-3 tracking-wider focus:outline-primary focus:border-none transition-all ${className}`}
          min={isDate ? setInputMinDate({ addDays: 1 }) : undefined}
          {...props}
        />
      </div>
      {required && errors && errors[name as keyof typeof state] && (
        <span className='text-red-600 text-sm text-left'>
          {errors[name as keyof typeof state]}
        </span>
      )}
    </div>
  );
};

export default Input;
