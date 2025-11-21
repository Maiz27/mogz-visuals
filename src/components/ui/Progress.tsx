const Progress = ({
  value,
  className,
}: {
  value: number;
  className?: string;
}) => {
  return (
    <div className={`w-full bg-copy/50 rounded-full h-2.5 ${className}`}>
      <div
        className='bg-primary h-2.5 rounded-full'
        style={{ width: `${value}%` }}
      ></div>
    </div>
  );
};

export default Progress;
