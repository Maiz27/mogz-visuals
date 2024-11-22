import { ChangeEvent, FormEvent, useState } from 'react';

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
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    // radio inputs
    if (type === 'radio') {
      setState({
        ...state,
        [name]: value,
      });

      if (rules[name]) {
        const errorMessage = rules[name](value);
        setErrors({
          ...errors,
          [name]: errorMessage,
        });
      }
      return;
    }

    // file inputs
    let files;
    if (e.target instanceof HTMLInputElement && 'files' in e.target) {
      files = e.target.files;
    }

    setState({
      ...state,
      [name]: value,
    });

    // validate
    if (rules[name]) {
      if (files) {
        const errorMessage = rules[name](files);
        setErrors({
          ...errors,
          [name]: errorMessage,
        });
      } else {
        const errorMessage = rules[name](value);
        setErrors({
          ...errors,
          [name]: errorMessage,
        });
      }
    }
  };

  const reset = () => {
    setState(initialState);
    setErrors({});
  };

  const onSubmit = async (
    e: FormEvent<HTMLFormElement>,
    handle: () => Promise<void>
  ) => {
    try {
      e.preventDefault();
      setLoading(true);
      await handle();
    } catch (error) {
      console.log('error', error);
    } finally {
      reset();
      setLoading(false);
    }
  };

  return {
    state,
    errors,
    loading,
    handleChange,
    reset,
    onSubmit,
  };
};

export default useFormState;
