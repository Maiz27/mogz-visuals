import { InputHTMLAttributes } from 'react';
import { BaseFormFieldProps } from '@/lib/types';
import { HiCheck } from 'react-icons/hi2';

type CheckboxProps = InputHTMLAttributes<HTMLInputElement> & BaseFormFieldProps;

const Checkbox = ({ className, ...props }: CheckboxProps) => {
  const { id, label, name, state, errors, required } = props;
  const checked = state
    ? (state[name as keyof typeof state] as unknown as boolean)
    : false;

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
            className='leading-tight pt-[2px] select-none hover:cursor-pointer'
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
