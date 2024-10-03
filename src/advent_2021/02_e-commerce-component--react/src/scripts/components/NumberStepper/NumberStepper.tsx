import * as React from 'react';

import styles from './NumberStepper.module.css';

export type Props = {
  value?: number;
  step?: number;
  min?: number;
  size?: number;
  label: string;
  onChange?: (val: number) => void;
};

export default function NumberStepper({
  value = 0,
  step = 1,
  min = 0,
  size = 2,
  label,
  onChange,
}: Props) {
  const [val, setVal] = React.useState(value);

  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const direction =
      event.currentTarget.dataset.direction === 'increase' ? 1 : -1;
    const newVal = val + direction;
    if (newVal >= min) {
      setVal(val + direction);
      if (onChange) {
        onChange(val + direction);
      }
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = parseInt(event.target.value, 10);
    if (newVal >= min) {
      setVal(newVal);
      if (onChange) {
        onChange(newVal);
      }
    }
  };

  return (
    <div className={styles.numberStepper}>
      <button
        type="button"
        className={styles.button}
        data-direction="decrease"
        onClick={handleButtonClick}
        aria-label={`decrease value by ${step}`}
      />
      <input
        type="number"
        className={styles.input}
        step={step}
        size={size}
        min={min}
        value={val}
        onChange={handleInputChange}
        aria-label={label}
      />
      <button
        type="button"
        className={styles.button}
        data-direction="increase"
        onClick={handleButtonClick}
        aria-label={`increase value by ${step}`}
      />
    </div>
  );
}