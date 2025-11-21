import { Label } from './Label';
import { BaseFormFieldProps } from '@/lib/types';

type RadioGroupProps = {
  options: RadioOption[];
} & BaseFormFieldProps;

type RadioOption = {
  label: string;
  value: string;
};

const RadioGroup = ({ className, options, ...props }: RadioGroupProps) => {
  const { id, label, name, state, errors } = props;
  const value = state
    ? (state[name as keyof typeof state] as unknown as string)
    : ('' as string);

  return (
    <div>
      <Label id={id!} label={label!} className='' />
      <div className='flex flex-wrap items-center mt-2 gap-4'>
        {options.map((option, i) => (
          <div key={option.value} className='flex items-center gap-2'>
            <input
              type='radio'
              {...props}
              value={option.value}
              defaultChecked={i === 0}
              className='appearance-none aspect-square h-5 rounded-full border-[1.5px] border-copy transition-colors hover:cursor-pointer hover:border-primary checked:bg-primary checked:shadow-inner checked:shadow-background'
            />
            <label>{option.label}</label>
          </div>
        ))}
      </div>
      {errors && errors[name as keyof typeof state] && (
        <span className='text-red-600 text-sm'>
          {errors[name as keyof typeof state]}
        </span>
      )}
    </div>
  );
};

export default RadioGroup;
