import React from 'react';

type LabelProps = {
  id: string;
  label: string;
};

export const Label = ({ id, label }: LabelProps) => {
  return (
    <label
      htmlFor={id}
      className='text- absolute -top-3 ml-2 bg-background font-medium px-2 tracking-widest rounded-md'
    >
      {label}
    </label>
  );
};
