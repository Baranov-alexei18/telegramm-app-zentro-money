import { Timestamp } from 'firebase/firestore';

export const convertDateToTimestamp = (date: Date | Timestamp | null | undefined): Timestamp => {
  if (!date) {
    return Timestamp.fromDate(new Date());
  }

  if (date instanceof Timestamp) {
    return date;
  }

  return Timestamp.fromDate(date);
};
