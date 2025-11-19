function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`animate-pulse bg-copy/30 ${className}`} {...props} />;
}

export { Skeleton };
