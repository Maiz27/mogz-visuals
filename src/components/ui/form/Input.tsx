type Props = {
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
};

const Input = ({
  name,
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
        required={required}
        placeholder={placeholder}
        className={`w-full bg-background border border-copy p-4 py-3 tracking-wider focus:outline-primary focus:border-none transition-all ${className}`}
      />
    </>
  );
};

export default Input;
