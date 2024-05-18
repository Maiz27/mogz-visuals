import { ChangeEventHandler } from 'react';

type Props = {
  name: string;
  type?: string;
  state?: Object;
  errors?: Object;
  required?: boolean;
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
  placeholder = 'Type here...',
  className,
}: Props) => {
  return (
    <>
      <input
        name={name}
        type={type}
        value={state![name as keyof typeof state]}
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
    </>
  );
};

export default Input;
