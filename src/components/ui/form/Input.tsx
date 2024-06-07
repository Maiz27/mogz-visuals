import { ChangeEventHandler } from 'react';

type Props = {
  name: string;
  type?: string;
  state?: Object;
  errors?: Object;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  onChange?: ChangeEventHandler<HTMLInputElement> | undefined;
  className?: string;
};

const Input = ({
  name,
  state,
  errors,
  onChange,
  type = 'text',
  required = false,
  disabled = false,
  placeholder = 'Type here...',
  className,
}: Props) => {
  const value = state
    ? (state[name as keyof typeof state] as unknown as string)
    : ('' as string);
  return (
    <div className='w-full flex flex-col space-y-1'>
      <input
        name={name}
        type={type}
        value={value}
        disabled={disabled}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className={`w-full bg-background border border-copy p-4 py-3 tracking-wider focus:outline-primary focus:border-none transition-all ${className}`}
      />
      {errors && errors[name as keyof typeof state] && (
        <span className='text-red-500 text-sm'>
          {errors[name as keyof typeof state]}
        </span>
      )}
    </div>
  );
};

export default Input;
