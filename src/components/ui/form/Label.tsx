import React from 'react';

type LabelProps = {
  id: string;
  label: React.ReactNode;
  className?: string;
};

export const Label = ({ id, label, className }: LabelProps) => {
  return (
    <label
      htmlFor={id}
      className={`bg-background font-medium  tracking-widest rounded-md ${className}`}
    >
      {label}
    </label>
  );
};
