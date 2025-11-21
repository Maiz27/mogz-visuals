import { useState } from 'react';

const useProgress = () => {
  const [progress, setProgress] = useState(0);
  const [current, setCurrent] = useState(0);
  const [total, setTotal] = useState(0);

  const start = (totalItems: number) => {
    setTotal(totalItems);
    setCurrent(1);
    setProgress(0);
  };

  const advance = () => {
    setCurrent((prev) => prev + 1);
    setProgress(0);
  };

  const update = (value: number) => {
    setProgress(value);
  };

  const reset = () => {
    setProgress(0);
    setCurrent(0);
    setTotal(0);
  };

  return { progress, current, total, start, advance, update, reset };
};

export default useProgress;
