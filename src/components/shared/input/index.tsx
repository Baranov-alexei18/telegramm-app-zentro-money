import { ChangeEvent } from 'react';
import {
  FieldError,
  Input as HeadlessInput,
  InputProps,
  Label,
  TextField,
  TextFieldProps,
} from 'react-aria-components';
import cn from 'classnames';

import styles from './styles.module.css';

type Props = InputProps & {
  label?: string;
  type?: string;
  value: string;
  placeholder?: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  validate?: TextFieldProps['validate'];
  disabled?: boolean;
};

export const Input = ({
  label,
  type = 'text',
  value,
  placeholder,
  className,
  onChange,
  required = false,
  validate,
  disabled,
  ...props
}: Props) => {
  const inputId = `input-${label?.replace(/\s+/g, '-') || Math.random()}`;

  return (
    <TextField
      className={styles.container}
      isRequired={required}
      validate={validate}
      isDisabled={disabled}
    >
      {label && (
        <Label className={styles.label} htmlFor={inputId}>
          {label}
        </Label>
      )}
      <HeadlessInput
        id={inputId}
        className={cn(styles.input, className)}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        {...props}
      />
      <FieldError className={styles.error} />
    </TextField>
  );
};
