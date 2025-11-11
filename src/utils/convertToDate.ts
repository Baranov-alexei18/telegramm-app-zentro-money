import { Timestamp } from 'firebase/firestore';

type DateType = Timestamp | Date | string;

export const convertToDate = (obj: DateType) => {
  if (obj instanceof Timestamp) {
    return new Date(obj.seconds * 1000);
  }

  if (obj instanceof Date) {
    return new Date(obj);
  }

  return new Date(obj);
};
