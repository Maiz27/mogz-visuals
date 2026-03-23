import { InputHTMLAttributes, useState, useEffect } from 'react';
import { Label } from './Label';
import { BaseFormFieldProps } from '@/lib/types';
import { formatDateTimeForInput, setInputMinDate } from '@/lib/utils';

type InputProps = InputHTMLAttributes<HTMLInputElement> &
  BaseFormFieldProps & {
    variant?: 'default' | 'premium';
  };

const dateTypes = ['date', 'datetime-local'];

const Input = ({ className, variant = 'default', ...props }: InputProps) => {
  const { id, type, label, name, state, errors, required } = props;
  const value = state
    ? (state[name as keyof typeof state] as unknown as string)
    : ('' as string);

  const isDate = dateTypes.includes(type!);
  const [minDate, setMinDate] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (isDate) {
      setMinDate(setInputMinDate({ addDays: 1 }));
    }
  }, [isDate]);

  if (variant === 'premium') {
    return (
      <div className='w-full flex flex-col space-y-0.5'>
        <div className='group relative'>
          <div className='absolute -inset-px bg-linear-to-r from-primary/30 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none' />
          <div className='relative bg-surface border border-white/5 group-focus-within:border-primary/50 p-6 md:p-8 transition-colors duration-500'>
            {label && (
              <label
                htmlFor={id}
                className='block text-primary text-[10px] tracking-[0.2em] uppercase font-body mb-4 font-semibold'
              >
                {label} {required && <span className='text-white/50'>*</span>}
              </label>
            )}
            <input
              id={id}
              value={isDate ? formatDateTimeForInput(value) : value}
              className={`w-full bg-transparent text-white md:text-xl font-heading tracking-wide focus:outline-none placeholder:text-secondary/50 ${isDate ? 'cursor-pointer' : ''} ${className}`}
              min={minDate}
              onFocus={(e) => {
                e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                props.onFocus?.(e);
              }}
              {...props}
            />
            {props.description && (
              <div className='mt-8 pt-8 border-t border-white/5'>
                <p className='text-secondary text-xs font-body leading-relaxed'>
                  {props.description}
                </p>
              </div>
            )}
          </div>
        </div>
        {required && errors && errors[name as keyof typeof state] && (
          <span className='text-red-500/80 text-xs mt-1 ml-1 font-body tracking-wide'>
            {errors[name as keyof typeof state]}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className='w-full flex flex-col space-y-0.5'>
      <div className='relative my-2 focus-within:text-primary transition-colors'>
        {label && (
          <Label id={id!} label={label} className='absolute -top-3 ml-2 px-2' />
        )}
        <input
          value={isDate ? formatDateTimeForInput(value) : value}
          className={`w-full text-primary bg-background border border-copy p-4 py-3 tracking-wider focus:outline-primary focus:border-none transition-all ${className}`}
          min={minDate}
          onFocus={(e) => {
            // Scroll to center on mobile when keyboard opens
            e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            props.onFocus?.(e);
          }}
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
