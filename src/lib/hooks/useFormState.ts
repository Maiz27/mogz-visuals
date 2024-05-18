import { ChangeEvent, useState } from 'react';

type ValidationRule = (value: any) => string | null;

interface ValidationRules {
  [key: string]: ValidationRule;
}

const useFormState = <T extends object>(
  initialState: T,
  rules: ValidationRules
) => {
  const [state, setState] = useState<T>(initialState);
  const [errors, setErrors] = useState<{ [K in keyof T]?: string }>({});

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setState({
      ...state,
      [name]: value,
    });

    if (rules[name]) {
      const errorMessage = rules[name](value);
      console.log(errorMessage);
      setErrors({
        ...errors,
        [name]: errorMessage,
      });
    }
  };

  const reset = () => {
    setState(initialState);
    setErrors({});
  };

  return {
    state,
    handleChange,
    reset,
    errors,
  };
};

export default useFormState;
