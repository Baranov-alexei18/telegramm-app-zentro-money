import { ChangeEvent } from 'react';
import {
  FieldError,
  Input as HeadlessInput,
  Label,
  TextField,
  TextFieldProps,
} from 'react-aria-components';
import cn from 'classnames';

import styles from './styles.module.css';

type Props = {
  label?: string;
  type?: string;
  value: string;
  placeholder?: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  validate?: TextFieldProps['validate'];
};

export const Input = ({
  label,
  type = 'text',
  value,
  placeholder,
  onChange,
  required = false,
  validate,
}: Props) => {
  const inputId = `input-${label?.replace(/\s+/g, '-') || Math.random()}`;

  return (
    <TextField className={styles.container} isRequired={required} validate={validate}>
      {label && (
        <Label className={styles.label} htmlFor={inputId}>
          {label}
        </Label>
      )}
      <HeadlessInput
        id={inputId}
        className={cn(styles.input)}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
      />
      <FieldError className={styles.error} />
    </TextField>
  );
};
