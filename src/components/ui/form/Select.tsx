'use client';
import { ChangeEvent, useEffect } from 'react';

type Props = {
  name: string;
  value: string | number | readonly string[] | undefined;
  options: string[];
  selected?: string;
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
};

const Select = ({
  name,
  value,
  options,
  selected = 'Select option',
  onChange,
  className,
}: Props) => {
  useEffect(() => {}, []);
  return (
    <>
      <select
        name={name}
        value={value}
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
