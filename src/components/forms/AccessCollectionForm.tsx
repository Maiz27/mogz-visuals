import { FormEvent, ReactNode } from 'react';
import Input from '../ui/form/Input';
import { FORMS } from '@/lib/Constants';
import TurnstileWidget from '../ui/TurnstileWidget';

type Props = {
  children: ReactNode;
  onSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  className?: string;
  state: any;
  errors: any;
  handleChange: any;
  setToken: (token: string) => void;
};

const AccessCollectionForm = ({
  children,
  onSubmit,
  className = '',
  state,
  errors,
  handleChange,
  setToken,
}: Props) => {
  const { fields } = FORMS.browse;
  return (
    <form onSubmit={onSubmit} className={`${className}`}>
      <div className='flex flex-col space-y-2'>
        {fields.map((field) => (
          <Input
            key={field.id}
            state={state}
            errors={errors}
            onChange={handleChange}
            {...field}
          />
        ))}
        <TurnstileWidget onVerify={(t) => setToken(t)} />
      </div>

      {children}
    </form>
  );
};

export default AccessCollectionForm;
