import { useId } from 'react';
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
import { Icon } from '@iconify/react';
import cn from 'classnames';

import styles from './styles.module.css';

type Option = {
  label: string;
  value: string;
};

type Props = {
  label?: string;
  ariaLabel?: string;
  'aria-label'?: string;
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
  ariaLabel,
  'aria-label': ariaLabelAttr,
  options,
  placeholder,
  value,
  onChange,
  required = false,
  error,
  disabled,
  className,
}: Props) => {
  const labelId = useId();
  const resolvedAriaLabel = label
    ? undefined
    : (ariaLabel ?? ariaLabelAttr ?? placeholder ?? 'Выбор значения');

  return (
    <HeadlessSelect
      selectedKey={value}
      onSelectionChange={(key) => {
        if (key !== null) {
          onChange(String(key));
        }
      }}
      isRequired={required}
      isDisabled={disabled}
      aria-labelledby={label ? labelId : undefined}
      aria-label={resolvedAriaLabel}
      className={styles.container}
      placeholder={placeholder}
    >
      {label && (
        <Label className={styles.label} id={labelId}>
          {label}
        </Label>
      )}

      <Button
        className={cn(styles.trigger, className, {
          [styles.triggerError]: Boolean(error),
        })}
      >
        <SelectValue className={styles.value} />

        <span className={styles.chevron} aria-hidden="true">
          <Icon icon="mingcute:down-line" width={16} height={16} />
        </span>
      </Button>

      <Popover className={styles.popover} offset={6}>
        <ListBox className={styles.listbox}>
          {options.map((option) => (
            <ListBoxItem
              key={option.value}
              id={option.value}
              textValue={option.label}
              className={styles.option}
            >
              {({ isSelected }) => (
                <>
                  <span className={styles.optionLabel}>{option.label}</span>
                  {isSelected && (
                    <span className={styles.checkIcon} aria-hidden="true">
                      <Icon icon="mingcute:check-line" width={16} height={16} />
                    </span>
                  )}
                </>
              )}
            </ListBoxItem>
          ))}
        </ListBox>
      </Popover>

      {error && <FieldError className={styles.error}>{error}</FieldError>}
    </HeadlessSelect>
  );
};
