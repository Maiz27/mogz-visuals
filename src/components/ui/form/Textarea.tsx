import { InputHTMLAttributes } from 'react';
import { Label } from './Label';
import { BaseFormFieldProps } from '@/lib/types';

type TextareaProps = InputHTMLAttributes<HTMLTextAreaElement> &
  BaseFormFieldProps & {
    variant?: 'default' | 'premium';
  };

const Textarea = ({ className, variant = 'default', ...props }: TextareaProps) => {
  const { id, label, name, state, errors, required } = props;
  const value = state
    ? (state[name as keyof typeof state] as unknown as string)
    : ('' as string);

  if (variant === 'premium') {
    return (
      <div className='w-full flex flex-col h-full'>
        <div className='group relative h-full flex flex-col'>
          <div className='absolute -inset-px bg-linear-to-r from-transparent to-primary/30 opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none' />
          <div className='relative bg-surface border border-white/5 group-focus-within:border-primary/50 p-8 md:p-10 transition-colors duration-500 flex flex-col flex-1'>
            <div className='flex justify-between items-center mb-6'>
              {label && (
                <label className='block text-primary text-[10px] tracking-[0.2em] uppercase font-body font-semibold'>
                  {label}
                </label>
              )}
              {!required && (
                <span className='text-secondary text-[9px] tracking-[0.2em] uppercase font-body'>
                  Optional
                </span>
              )}
            </div>
            <textarea
              id={id}
              value={value}
              className={`w-full flex-1 bg-transparent text-white text-sm md:text-base font-body leading-relaxed focus:outline-none placeholder:text-secondary/30 resize-none min-h-40 ${className}`}
              {...props}
            />
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
        <textarea
          value={value}
          className={`w-full bg-background border border-copy p-4 tracking-wider focus:outline-primary focus:border-none transition-all ${className}`}
          {...props}
        />
      </div>
      {required && errors && errors[name as keyof typeof state] && (
        <span className='text-red-600 text-sm'>
          {errors[name as keyof typeof state]}
        </span>
      )}
    </div>
  );
};

export default Textarea;
