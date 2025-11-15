import { GranularityFields } from '@/constants/granularity';
import { useGranularityStore } from '@/store/granularityStore';

import { Select } from '../shared/select';
import { recalcPeriod } from './utils';

import styles from './styles.module.css';

const options: { value: GranularityFields; label: string }[] = [
  { value: GranularityFields.DAY, label: 'День' },
  { value: GranularityFields.WEEK, label: 'Неделя' },
  { value: GranularityFields.MONTH, label: 'Месяц' },
  { value: GranularityFields.YEAR, label: 'Год' },
  { value: GranularityFields.ALL, label: 'Всё время' },
];

export const PeriodPicker = () => {
  const { type, period, setGranularityType, setGranularityPeriod } = useGranularityStore();

  const handleChange = (key: string) => {
    setGranularityType(key as GranularityFields);
    setGranularityPeriod(recalcPeriod(period.start, key as GranularityFields));
  };

  return (
    <Select
      className={styles.wrapper}
      value={type}
      onChange={handleChange}
      aria-label="Выбор периода"
      options={options}
    />
  );
};
