import { FormEvent, ReactNode } from 'react';
import Input from '../ui/form/Input';

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
  return (
    <form onSubmit={onSubmit} className={` ${className}`}>
      <div className='flex flex-col md:flex-row items-center gap-2'>
        <Input
          required={true}
          name='id'
          state={state}
          errors={errors}
          onChange={handleChange}
          placeholder='Collection ID'
        />
        <Input
          required={true}
          name='password'
          type='password'
          state={state}
          errors={errors}
          onChange={handleChange}
          placeholder='Collection Password'
        />
      </div>

      {children}
    </form>
  );
};

export default AccessCollectionForm;
