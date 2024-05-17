import React from 'react';

type Props = {
  text: string;
  Tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  color?: 'primary' | 'secondary' | 'copy';
  className?: string;
};

const Heading = ({ Tag = 'h2', text, color = 'primary', className }: Props) => {
  return (
    <Tag
      className={`text-${color} text-4xl 2xl:text-5xl font-bold mb-4 ${className}`}
    >
      {text}
    </Tag>
  );
};

export default Heading;
