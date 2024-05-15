'use client';
import { ChangeEvent } from 'react';

type Props = {
  name: string;
  options: string[];
  selected?: string;
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
};

const Select = ({
  name,
  options,
  selected = 'Select option',
  onChange,
  className,
}: Props) => {
  return (
    <>
      <select
        name={name}
        onChange={onChange}
        className={`w-full bg-background border border-copy p-4 tracking-wider focus:outline-primary transition-all ${className}`}
      >
        <option disabled value=''>
          {selected}
        </option>
        {options.map((option, i) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </>
  );
};

export default Select;
