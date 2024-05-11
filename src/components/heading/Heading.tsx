import React from 'react';

type Props = {
  text: string;
  Tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  className?: string;
};

const Heading = ({ Tag = 'h2', text, className }: Props) => {
  return (
    <Tag className={`text-primary text-4xl font-bold mb-4 ${className}`}>
      {text}
    </Tag>
  );
};

export default Heading;
