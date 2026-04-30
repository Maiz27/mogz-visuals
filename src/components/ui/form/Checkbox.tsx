import { InputHTMLAttributes } from 'react';
import { BaseFormFieldProps } from '@/lib/types';
import { HiCheck } from 'react-icons/hi2';

type CheckboxProps = InputHTMLAttributes<HTMLInputElement> &
  BaseFormFieldProps & {
    variant?: 'default' | 'premium';
  };

const Checkbox = ({
  className,
  variant = 'default',
  ...props
}: CheckboxProps) => {
  const { id, label, name, state, errors, required } = props;
  const checked = state
    ? (state[name as keyof typeof state] as unknown as boolean)
    : false;

  if (variant === 'premium') {
    return (
      <div className='w-full flex flex-col space-y-0.5'>
        <label
          htmlFor={id}
          className='group relative bg-surface border border-white/5 p-6 md:p-8 hover:border-primary/30 transition-colors duration-500 cursor-pointer flex items-start gap-6'
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              const input = document.getElementById(id!) as HTMLInputElement;
              input?.click();
            }
          }}
        >
          <div className='relative flex items-center shrink-0 mt-1'>
            <input
              id={id}
              type='checkbox'
              checked={checked}
              className={`appearance-none h-6 w-6 border-2 transition-all duration-500 rounded-sm cursor-pointer peer ${checked ? 'border-primary bg-primary/10' : 'border-white/20 group-hover:border-primary/50'}`}
              {...props}
            />
            <div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-primary transition-all duration-500 scale-0 pointer-events-none ${checked ? 'scale-100' : ''}`}
            />
          </div>
          <span className='text-secondary text-sm md:text-base font-body leading-relaxed select-none'>
            {label}
          </span>
        </label>
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
      <div className='flex items-start gap-2 my-2'>
        <div className='relative flex items-center'>
          <input
            id={id}
            type='checkbox'
            checked={checked}
            className={`appearance-none aspect-square h-5 w-5 rounded border-[1.5px] border-copy transition-colors hover:cursor-pointer hover:border-primary checked:bg-primary checked:border-primary peer ${className}`}
            {...props}
          />
          <HiCheck className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-background pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity w-4 h-4' />
        </div>

        {label && (
          <label
            htmlFor={id}
            className='leading-tight pt-0.5 select-none hover:cursor-pointer'
          >
            {label}
          </label>
        )}
      </div>
      {required && errors && errors[name as keyof typeof state] && (
        <span className='text-red-600 text-sm text-left'>
          {errors[name as keyof typeof state]}
        </span>
      )}
    </div>
  );
};

export default Checkbox;
