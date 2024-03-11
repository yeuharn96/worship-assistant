import { FC } from 'react';

type Props = {
  value?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
};
const InputNumber: FC<Props> = ({ value = 0, onChange, min, max, className }) => {
  return (
    <input
      type='number'
      className={`no-arrow text-center input-primary px-1 ${className ? className : ''}`}
      value={value}
      onFocus={(e) => e.target.select()}
      onChange={(e) => {
        let newValue = Number(e.target.value);
        if (isNaN(newValue)) return;
        if (max && newValue > max) newValue = max;
        if (min && newValue < min) newValue = min;

        onChange && onChange(newValue);
      }}
    />
  );
};

export default InputNumber;
