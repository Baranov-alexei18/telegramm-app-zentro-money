import { DateValue } from 'react-aria-components';

export const dateValueToDate = (value: DateValue | null) => {
  if (!value) return null;

  return new Date(value.year, value.month - 1, value.day);
};
