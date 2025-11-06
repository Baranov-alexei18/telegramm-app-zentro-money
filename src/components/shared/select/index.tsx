import {
  Button,
  FieldError,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  Select as HeadlessSelect,
  SelectValue,
} from 'react-aria-components';
import cn from 'classnames';

import styles from './styles.module.css';

type Option = {
  label: string;
  value: string;
};

type Props = {
  label?: string;
  options: Option[];
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
};

export const Select = ({
  label,
  options,
  placeholder,
  value,
  onChange,
  required = false,
  error,
  disabled,
  className,
}: Props) => {
  const selectId = `select-${label?.replace(/\s+/g, '-') || Math.random()}`;

  return (
    <HeadlessSelect
      value={value}
      onChange={(key) => onChange(key as string)}
      isRequired={required}
      isDisabled={disabled}
      aria-labelledby={selectId}
      className={styles.container}
      placeholder={placeholder}
    >
      {label && (
        <Label className={styles.label} id={selectId}>
          {label}
        </Label>
      )}

      <Button
        className={cn(styles.input, className, {
          [styles.inputError]: error,
        })}
      >
        <SelectValue />
      </Button>

      <Popover className={styles.popover}>
        <ListBox className={styles.listbox}>
          {options.map((option) => (
            <ListBoxItem key={option.value} id={option.value} className={styles.option}>
              {option.label}
            </ListBoxItem>
          ))}
        </ListBox>
      </Popover>

      {error && <FieldError className={styles.error}>{error}</FieldError>}
    </HeadlessSelect>
  );
};
