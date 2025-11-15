import { Button } from 'react-aria-components';

import { GranularityFields } from '@/constants/granularity';
import { useGranularityStore } from '@/store/granularityStore';
import { formatPeriod } from '@/utils/format-period';

import { ArrowLeftIcon } from '../icons/arrow-left-icon';
import { ArrowRightIcon } from '../icons/arrow-right-icon';

import styles from './styles.module.css';

export const PeriodDateNavigator = () => {
  const { type, period, setGranularityPeriod } = useGranularityStore();

  const prev = () => {
    if (!period) return;

    let newStart = period.start;
    let newEnd = period.end;

    switch (type) {
      case GranularityFields.DAY:
        newStart = newStart.subtract({ days: 1 });
        newEnd = newEnd.subtract({ days: 1 });
        break;
      case GranularityFields.WEEK:
        newStart = newStart.subtract({ weeks: 1 });
        newEnd = newEnd.subtract({ weeks: 1 });
        break;
      case GranularityFields.MONTH:
        newStart = newStart.subtract({ months: 1 });
        newEnd = newEnd.subtract({ months: 1 });
        break;
      case GranularityFields.YEAR:
        newStart = newStart.subtract({ years: 1 });
        newEnd = newEnd.subtract({ years: 1 });
        break;
    }

    setGranularityPeriod({ start: newStart, end: newEnd });
  };

  const next = () => {
    if (!period) return;

    let newStart = period.start;
    let newEnd = period.end;

    switch (type) {
      case GranularityFields.DAY:
        newStart = newStart.add({ days: 1 });
        newEnd = newEnd.add({ days: 1 });
        break;
      case GranularityFields.WEEK:
        newStart = newStart.add({ weeks: 1 });
        newEnd = newEnd.add({ weeks: 1 });
        break;
      case GranularityFields.MONTH:
        newStart = newStart.add({ months: 1 });
        newEnd = newEnd.add({ months: 1 });
        break;
      case GranularityFields.YEAR:
        newStart = newStart.add({ years: 1 });
        newEnd = newEnd.add({ years: 1 });
        break;
    }

    setGranularityPeriod({ start: newStart, end: newEnd });
  };

  const readable = formatPeriod(period.start, type);

  return (
    <div className={styles.container}>
      <Button className={styles.arrow} onPress={prev}>
        <ArrowLeftIcon size={12} />
      </Button>

      <div className={styles.label}>{readable}</div>

      <Button className={styles.arrow} onPress={next}>
        <ArrowRightIcon size={12} />
      </Button>
    </div>
  );
};
