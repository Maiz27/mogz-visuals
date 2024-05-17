import React from 'react';

type Props = {
  name: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
};

const Textarea = ({
  name,
  required = false,
  placeholder = 'Type here...',
  className,
}: Props) => {
  return (
    <>
      <textarea
        name={name}
        required={required}
        placeholder={placeholder}
        className={`w-full bg-background border border-copy p-4 tracking-wider focus:outline-primary focus:border-none transition-all ${className}`}
      />
    </>
  );
};

export default Textarea;
