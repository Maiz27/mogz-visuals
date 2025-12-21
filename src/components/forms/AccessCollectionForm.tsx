import { FormEvent, ReactNode } from 'react';
import Input from '../ui/form/Input';
import { FORMS } from '@/lib/Constants';

type Props = {
  children: ReactNode;
  onSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  className?: string;
  state: any;
  errors: any;
  handleChange: any;
};

const AccessCollectionForm = ({
  children,
  onSubmit,
  className = '',
  state,
  errors,
  handleChange,
}: Props) => {
  const { fields } = FORMS.browse;
  return (
    <form onSubmit={onSubmit} className={`${className}`}>
      <div className='flex flex-col items-center space-y-2'>
        {fields.map((field) => (
          <Input
            key={field.id}
            state={state}
            errors={errors}
            onChange={handleChange}
            {...field}
          />
        ))}
      </div>

      {children}
    </form>
  );
};

export default AccessCollectionForm;
