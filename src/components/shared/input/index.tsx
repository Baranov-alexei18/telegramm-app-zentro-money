import { ChangeEvent } from 'react';
import { Fieldset, Input as HeadlessInput, Label } from '@headlessui/react';
import cn from 'classnames';

import styles from './styles.module.css';

type Props = {
  label?: string;
  type?: string;
  value: string;
  placeholder?: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
};

export const Input = ({ label, type = 'text', value, placeholder, onChange, error }: Props) => {
  const inputId = `input-${label?.replace(/\s+/g, '-') || Math.random()}`;

  return (
    <Fieldset className={styles.container}>
      {label && (
        <Label className={styles.label} htmlFor={inputId}>
          {label}
        </Label>
      )}
      <HeadlessInput
        id={inputId}
        className={cn(styles.input, {
          [styles.inputError]: !!error,
        })}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
      />
      {error && <div className={styles.error}>{error}</div>}
    </Fieldset>
  );
};
