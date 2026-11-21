import { Timestamp } from 'firebase/firestore';

type TimestampLike = {
  seconds: number;
  nanoseconds?: number;
  toDate?: () => Date;
};

type DateType = Timestamp | TimestampLike | Date | string | number;

export const convertToDate = (obj: DateType): Date => {
  if (obj instanceof Date) {
    return new Date(obj);
  }

  if (obj && typeof obj === 'object') {
    if ('toDate' in obj && typeof obj.toDate === 'function') {
      return obj.toDate();
    }

    if ('seconds' in obj && typeof obj.seconds === 'number') {
      return new Date(obj.seconds * 1000 + Math.floor((obj.nanoseconds ?? 0) / 1_000_000));
    }
  }

  if (typeof obj === 'string' || typeof obj === 'number') {
    return new Date(obj);
  }

  return new Date(NaN);
};
