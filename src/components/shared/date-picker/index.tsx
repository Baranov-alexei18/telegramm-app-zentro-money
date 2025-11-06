import {
  Button,
  Calendar,
  CalendarCell,
  CalendarGrid,
  DateInput,
  DatePicker as AriaDatePicker,
  DateSegment,
  DateValue,
  Dialog,
  FieldError,
  Group,
  Heading,
  Label,
  Popover,
} from 'react-aria-components';
import { CalendarDate, fromDate } from '@internationalized/date';
import cn from 'classnames';

import styles from './styles.module.css';

type Props = {
  label?: string;
  value: Date | null;
  onChange: (date: DateValue | null) => void;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
};

export const DatePicker = ({
  label = 'Дата',
  value,
  onChange,
  required = false,
  disabled = false,
  error,
  className,
}: Props) => {
  const dateValue = new CalendarDate(value!.getFullYear(), value!.getMonth() + 1, value!.getDate());

  const handleClick = (e: {
    currentTarget: { querySelector: (arg0: string) => HTMLButtonElement };
  }) => {
    const button = e.currentTarget.querySelector(
      'button[aria-label="Открыть календарь"]'
    ) as HTMLButtonElement;

    button?.click();
  };
  return (
    <AriaDatePicker
      value={dateValue}
      onChange={onChange}
      isDisabled={disabled}
      isRequired={required}
      className={cn(styles.datePicker, className)}
    >
      {label && <Label className={styles.label}>{label}</Label>}

      <Group
        className={cn(styles.group, {
          [styles.inputError]: !!error,
          [styles.disabled]: disabled,
        })}
        onClickCapture={handleClick}
      >
        <DateInput className={styles.dateInput}>
          {(segment) => (
            <DateSegment key={segment.type} segment={segment} className={styles.dateSegment} />
          )}
        </DateInput>

        <Button id="btnCalendar" className={styles.openButton} aria-label="Открыть календарь">
          📅
        </Button>
      </Group>

      <Popover className={styles.popover}>
        <Dialog className={styles.dialog}>
          <Calendar className={styles.calendar}>
            <header className={styles.calendarHeader}>
              <Button slot="previous" className={styles.navButton}>
                ←
              </Button>
              <Heading className={styles.calendarHeading} />
              <Button slot="next" className={styles.navButton}>
                →
              </Button>
            </header>

            <CalendarGrid className={styles.calendarGrid}>
              {(date) => (
                <CalendarCell key={date.toString()} date={date} className={styles.calendarCell} />
              )}
            </CalendarGrid>
          </Calendar>
        </Dialog>
      </Popover>

      {error && <FieldError className={styles.error}>{error}</FieldError>}
    </AriaDatePicker>
  );
};
