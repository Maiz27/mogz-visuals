import { ChangeEventHandler } from 'react';

type Props = {
  name: string;
  state?: Object;
  errors?: Object;
  onChange?: ChangeEventHandler<HTMLTextAreaElement> | undefined;
  required?: boolean;
  placeholder?: string;
  className?: string;
};

const Textarea = ({
  name,
  state,
  errors,
  onChange,
  required = false,
  placeholder = 'Type here...',
  className,
}: Props) => {
  return (
    <>
      <textarea
        name={name}
        value={state![name as keyof typeof state]}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className={`w-full bg-background border border-copy p-4 tracking-wider focus:outline-primary focus:border-none transition-all ${className}`}
      />
      {errors && errors[name as keyof typeof state] && (
        <span className='text-red-600 text-sm'>
          {errors[name as keyof typeof state]}
        </span>
      )}
    </>
  );
};

export default Textarea;
